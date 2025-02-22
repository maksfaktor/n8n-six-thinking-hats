import { 
    INodeType, 
    INodeTypeDescription, 
    IExecuteFunctions, 
    INodeExecutionData,
    NodeConnectionType,
    IDataObject,
    INodeInputConfiguration,
    INodeOutputConfiguration
} from 'n8n-workflow';
import { hatColors, defaultHatsOrder, IAnalysisResult } from './types';
import Anthropic from '@anthropic-ai/sdk';
import { spawn } from 'child_process';
import { join } from 'path';
import { readFileSync } from 'fs';
import express from 'express';

// Declare global type for latestConversation
declare global {
    var latestConversation: IAnalysisResult | null;
}

// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024

export class SixThinkingHats implements INodeType {
    private visualizationServer: express.Express | null = null;

    description: INodeTypeDescription = {
        displayName: 'Six Thinking Hats',
        name: 'sixThinkingHats',
        group: ['transform'],
        version: 1,
        description: 'Метод 6 шляп мышления с последовательным диалогом',
        defaults: {
            name: 'Six Thinking Hats',
        },
        inputs: [{
            type: NodeConnectionType.Main,
        }] as INodeInputConfiguration[],
        outputs: [{
            type: NodeConnectionType.Main,
        }] as INodeOutputConfiguration[],
        credentials: [
            {
                name: 'anthropicApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Тема для анализа',
                name: 'topic',
                type: 'string',
                default: '',
                required: true,
                description: 'Тема для анализа методом 6 шляп',
            },
            {
                displayName: 'Порядок шляп',
                name: 'hatsOrder',
                type: 'multiOptions',
                options: Object.entries(hatColors).map(([key, value]) => ({
                    name: key.charAt(0).toUpperCase() + key.slice(1),
                    value: key,
                })),
                default: defaultHatsOrder,
                description: 'Выберите порядок использования шляп',
            },
            {
                displayName: 'Режим диалога',
                name: 'dialogMode',
                type: 'boolean',
                default: true,
                description: 'Включить режим последовательного диалога между шляпами',
            },
        ],
    };

    private setupVisualizationServer() {
        if (this.visualizationServer) return;

        const app = express();
        const visualizerPath = join(__dirname, 'web_visualizer');
        app.use(express.static(visualizerPath));

        const serverPort = Number(process.env.VISUALIZER_PORT || 3001);
        app.listen(serverPort, '0.0.0.0', () => {
            console.log(`Visualization server running on port ${serverPort}`);
        });

        this.visualizationServer = app;
    }

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        global.latestConversation = null;
        try {
            const topic = this.getNodeParameter('topic', 0) as string;
            const hatsOrder = this.getNodeParameter('hatsOrder', 0) as string[];
            const dialogMode = this.getNodeParameter('dialogMode', 0) as boolean;

            // Validate API key
            const apiKey = process.env.ANTHROPIC_API_KEY;
            if (!apiKey) {
                throw new Error('ANTHROPIC_API_KEY не найден в переменных окружения');
            }

            // Spawn Python process for analysis
            const pythonScript = join(__dirname, 'six_hats_prompt.py');
            const pythonProcess = spawn('python', [
                pythonScript,
                '--topic', topic,
                '--hats', JSON.stringify(hatsOrder),
                '--dialog-mode', String(dialogMode),
            ]);

            return new Promise((resolve, reject) => {
                let outputData = '';
                let errorData = '';

                pythonProcess.stdout.on('data', (data) => {
                    outputData += data.toString();
                });

                pythonProcess.stderr.on('data', (data) => {
                    errorData += data.toString();
                });

                pythonProcess.on('close', (code) => {
                    if (code !== 0) {
                        reject(new Error(`Ошибка Python процесса: ${errorData}`));
                        return;
                    }

                    try {
                        const result = JSON.parse(outputData) as IAnalysisResult;
                        if (result.status === 'success') {
                            global.latestConversation = result;
                            // Get instance reference and call visualization server setup
                            const nodeInstance = this as unknown as SixThinkingHats;
                            nodeInstance.setupVisualizationServer();
                        }
                        const returnData: INodeExecutionData[] = [{
                            json: result as unknown as IDataObject,
                        }];
                        resolve([returnData]);
                    } catch (error: unknown) {
                        const errorMessage = error instanceof Error 
                            ? error.message 
                            : 'Неизвестная ошибка при обработке вывода Python';
                        reject(new Error(`Ошибка обработки вывода Python: ${errorMessage}`));
                    }
                });
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Неизвестная ошибка в узле Six Thinking Hats';
            throw new Error(`Ошибка узла Six Thinking Hats: ${errorMessage}`);
        }
    }
}