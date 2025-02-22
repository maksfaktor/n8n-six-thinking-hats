import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeOperationError,
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
        inputs: ['main'],
        outputs: ['main'],
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
            },
            {
                displayName: 'OpenAI API Ключ',
                name: 'apiKey',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                required: true,
                description: 'OpenAI API ключ для LangChain',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        try {
            const topic = this.getNodeParameter('topic', 0) as string;
            const selectedHats = this.getNodeParameter('selectedHats', 0) as string[];
            const apiKey = this.getNodeParameter('apiKey', 0) as string;

            const scriptPath = path.join(__dirname, 'six_hats_prompt.py');

            let options = {
                mode: 'text' as const,
                pythonPath: 'python3',
                pythonOptions: ['-u'],
                scriptPath: path.dirname(scriptPath),
                args: [topic, JSON.stringify(selectedHats), apiKey],
            };

            const results = await new Promise<string[]>((resolve, reject) => {
                const pyshell = new PythonShell(path.basename(scriptPath), options);
                const output: string[] = [];

                pyshell.on('message', (message) => {
                    output.push(message);
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

        } catch (error) {
            if (error instanceof Error) {
                throw new NodeOperationError(this.getNode(), error);
            }
        }

        return [returnData];
    }
}