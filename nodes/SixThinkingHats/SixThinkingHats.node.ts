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

            if (!process.env.ANTHROPIC_API_KEY) {
                throw new Error('ANTHROPIC_API_KEY не найден в переменных окружения');
            }

            const scriptPath = path.join(__dirname, 'six_hats_prompt.py');

            const options = {
                mode: 'text' as const,
                pythonPath: 'python3',
                pythonOptions: ['-u'],
                scriptPath: path.dirname(scriptPath),
                args: [
                    topic,
                    JSON.stringify(selectedHats),
                    process.env.ANTHROPIC_API_KEY
                ],
            };

            const results = await new Promise<string[]>((resolve, reject) => {
                const pyshell = new PythonShell(path.basename(scriptPath), options);
                const output: string[] = [];

                pyshell.on('message', (message) => {
                    output.push(message);
                });

                pyshell.on('error', (err) => {
                    reject(err);
                });

                pyshell.end((err) => {
                    if (err) reject(err);
                    resolve(output);
                });
            });

            if (results && results.length > 0) {
                const analysisResults = JSON.parse(results[results.length - 1]);
                returnData.push({
                    json: {
                        topic,
                        analysis: analysisResults,
                    },
                });
            }

            return [returnData];
        } catch (error) {
            if (error instanceof Error) {
                throw new NodeOperationError(this.getNode(), error);
            }
            throw error;
        }
    }
}