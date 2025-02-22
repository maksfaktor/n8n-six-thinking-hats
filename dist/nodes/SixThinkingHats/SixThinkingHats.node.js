"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SixThinkingHats = void 0;
const types_1 = require("./types");
const child_process_1 = require("child_process");
const path_1 = require("path");
const express_1 = __importDefault(require("express"));
// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
class SixThinkingHats {
    constructor() {
        this.visualizationServer = null;
        this.description = {
            displayName: 'Six Thinking Hats',
            name: 'sixThinkingHats',
            group: ['transform'],
            version: 1,
            description: 'Метод 6 шляп мышления с последовательным диалогом',
            defaults: {
                name: 'Six Thinking Hats',
            },
            inputs: [{
                    type: "main" /* NodeConnectionType.Main */,
                }],
            outputs: [{
                    type: "main" /* NodeConnectionType.Main */,
                }],
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
                    options: Object.entries(types_1.hatColors).map(([key, value]) => ({
                        name: key.charAt(0).toUpperCase() + key.slice(1),
                        value: key,
                    })),
                    default: types_1.defaultHatsOrder,
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
    }
    setupVisualizationServer() {
        if (this.visualizationServer)
            return;
        const app = (0, express_1.default)();
        const visualizerPath = (0, path_1.join)(__dirname, 'web_visualizer');
        app.use(express_1.default.static(visualizerPath));
        const serverPort = Number(process.env.VISUALIZER_PORT || 3001);
        app.listen(serverPort, '0.0.0.0', () => {
            console.log(`Visualization server running on port ${serverPort}`);
        });
        this.visualizationServer = app;
    }
    async execute() {
        global.latestConversation = null;
        try {
            const topic = this.getNodeParameter('topic', 0);
            const hatsOrder = this.getNodeParameter('hatsOrder', 0);
            const dialogMode = this.getNodeParameter('dialogMode', 0);
            // Validate API key
            const apiKey = process.env.ANTHROPIC_API_KEY;
            if (!apiKey) {
                throw new Error('ANTHROPIC_API_KEY не найден в переменных окружения');
            }
            // Spawn Python process for analysis
            const pythonScript = (0, path_1.join)(__dirname, 'six_hats_prompt.py');
            const pythonProcess = (0, child_process_1.spawn)('python', [
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
                        const result = JSON.parse(outputData);
                        if (result.status === 'success') {
                            global.latestConversation = result;
                            // Get instance reference and call visualization server setup
                            const nodeInstance = this;
                            nodeInstance.setupVisualizationServer();
                        }
                        const returnData = [{
                                json: result,
                            }];
                        resolve([returnData]);
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error
                            ? error.message
                            : 'Неизвестная ошибка при обработке вывода Python';
                        reject(new Error(`Ошибка обработки вывода Python: ${errorMessage}`));
                    }
                });
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Неизвестная ошибка в узле Six Thinking Hats';
            throw new Error(`Ошибка узла Six Thinking Hats: ${errorMessage}`);
        }
    }
}
exports.SixThinkingHats = SixThinkingHats;
