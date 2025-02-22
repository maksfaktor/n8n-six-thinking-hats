import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeOperationError,
    NodeConnectionType,
} from 'n8n-workflow';
import { PythonShell } from 'python-shell';
import * as path from 'path';

export class SixThinkingHats implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Six Thinking Hats',
        name: 'sixThinkingHats',
        group: ['transform'],
        version: 1,
        description: 'Применяет методологию шести шляп мышления с помощью LangChain',
        defaults: {
            name: 'Six Thinking Hats',
        },
        inputs: [
            {
                type: NodeConnectionType.Main,
                required: true,
            },
        ],
        outputs: [
            {
                type: NodeConnectionType.Main,
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Тема',
                name: 'topic',
                type: 'string',
                default: '',
                required: true,
                description: 'Тема или решение для анализа',
            },
            {
                displayName: 'Выбранные шляпы',
                name: 'selectedHats',
                type: 'multiOptions',
                options: [
                    {
                        name: 'Белая шляпа (Факты)',
                        value: 'white',
                    },
                    {
                        name: 'Красная шляпа (Эмоции)',
                        value: 'red',
                    },
                    {
                        name: 'Черная шляпа (Критика)',
                        value: 'black',
                    },
                    {
                        name: 'Желтая шляпа (Преимущества)',
                        value: 'yellow',
                    },
                    {
                        name: 'Зеленая шляпа (Креативность)',
                        value: 'green',
                    },
                    {
                        name: 'Синяя шляпа (Процесс)',
                        value: 'blue',
                    },
                ],
                default: ['white', 'red', 'black', 'yellow', 'green', 'blue'],
                required: true,
                description: 'Выберите, какие шляпы мышления применить',
            }
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        try {
            const items = this.getInputData();
            const returnData: INodeExecutionData[] = [];

            const topic = this.getNodeParameter('topic', 0) as string;
            const selectedHats = this.getNodeParameter('selectedHats', 0) as string[];

            console.log(`Начало выполнения с параметрами: тема="${topic}", шляпы=${JSON.stringify(selectedHats)}`);

            if (!process.env.ANTHROPIC_API_KEY) {
                throw new Error('ANTHROPIC_API_KEY не найден в переменных окружения');
            }

            const scriptPath = path.join(__dirname, 'six_hats_prompt.py');
            console.log(`Путь к скрипту: ${scriptPath}`);

            const options = {
                mode: 'text' as const,
                pythonPath: 'python3',
                pythonOptions: ['-u'],
                scriptPath: path.dirname(scriptPath),
                cwd: path.dirname(scriptPath),
                args: [
                    topic,
                    JSON.stringify(selectedHats),
                    process.env.ANTHROPIC_API_KEY
                ],
            };

            console.log('Запуск Python-скрипта...');
            console.log(`Рабочая директория: ${options.cwd}`);

            const results = await new Promise<string[]>((resolve, reject) => {
                const pyshell = new PythonShell(path.basename(scriptPath), options);
                const output: string[] = [];

                pyshell.on('message', (message) => {
                    console.log(`Получено сообщение от Python: ${message}`);
                    output.push(message);
                });

                pyshell.on('error', (err) => {
                    console.error('Ошибка в Python-скрипте:', err);
                    reject(new Error(`Ошибка при выполнении Python-скрипта: ${err.message}`));
                });

                pyshell.end((err) => {
                    if (err) {
                        console.error('Ошибка при завершении Python-скрипта:', err);
                        reject(new Error(`Ошибка при завершении Python-скрипта: ${err.message}`));
                        return;
                    }
                    console.log('Python-скрипт успешно завершил работу');
                    resolve(output);
                });
            });

            if (results && results.length > 0) {
                // Ищем последнее валидное JSON сообщение
                let lastJsonOutput = null;
                for (let i = results.length - 1; i >= 0; i--) {
                    try {
                        lastJsonOutput = JSON.parse(results[i]);
                        break;
                    } catch (e) {
                        continue;
                    }
                }

                if (lastJsonOutput) {
                    console.log('Обработка результатов завершена успешно');
                    returnData.push({
                        json: {
                            topic,
                            analysis: lastJsonOutput,
                        },
                    });
                } else {
                    throw new Error('Не удалось получить валидный JSON от Python-скрипта');
                }
            } else {
                throw new Error('Python-скрипт не вернул результатов');
            }

            return [returnData];
        } catch (error) {
            console.error('Произошла ошибка:', error);
            if (error instanceof Error) {
                throw new NodeOperationError(this.getNode(), error);
            }
            throw error;
        }
    }
}