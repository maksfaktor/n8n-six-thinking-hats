"use strict";
<<<<<<< HEAD
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SixThinkingHats = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const python_shell_1 = require("python-shell");
const path = __importStar(require("path"));
class SixThinkingHats {
    constructor() {
=======
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
>>>>>>> 43495dbe6ea205fe94dad8ff3f09aac553caa4fa
        this.description = {
            displayName: 'Six Thinking Hats',
            name: 'sixThinkingHats',
            group: ['transform'],
            version: 1,
<<<<<<< HEAD
            description: 'Применяет методологию шести шляп мышления с помощью LangChain',
            defaults: {
                name: 'Six Thinking Hats',
            },
            inputs: [
                {
                    type: "main" /* NodeConnectionType.Main */,
                    required: true,
                },
            ],
            outputs: [
                {
                    type: "main" /* NodeConnectionType.Main */,
=======
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
>>>>>>> 43495dbe6ea205fe94dad8ff3f09aac553caa4fa
                    required: true,
                },
            ],
            properties: [
                {
<<<<<<< HEAD
                    displayName: 'Тема',
=======
                    displayName: 'Тема для анализа',
>>>>>>> 43495dbe6ea205fe94dad8ff3f09aac553caa4fa
                    name: 'topic',
                    type: 'string',
                    default: '',
                    required: true,
<<<<<<< HEAD
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
    }
    async execute() {
        try {
            const items = this.getInputData();
            const returnData = [];
            const topic = this.getNodeParameter('topic', 0);
            const selectedHats = this.getNodeParameter('selectedHats', 0);
            console.log(`Начало выполнения с параметрами: тема="${topic}", шляпы=${JSON.stringify(selectedHats)}`);
            if (!process.env.ANTHROPIC_API_KEY) {
                throw new Error('ANTHROPIC_API_KEY не найден в переменных окружения');
            }
            const scriptPath = path.join(__dirname, 'six_hats_prompt.py');
            console.log(`Путь к скрипту: ${scriptPath}`);
            const options = {
                mode: 'text',
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
            const results = await new Promise((resolve, reject) => {
                const pyshell = new python_shell_1.PythonShell(path.basename(scriptPath), options);
                const output = [];
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
                    }
                    catch (e) {
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
                }
                else {
                    throw new Error('Не удалось получить валидный JSON от Python-скрипта');
                }
            }
            else {
                throw new Error('Python-скрипт не вернул результатов');
            }
            return [returnData];
        }
        catch (error) {
            console.error('Произошла ошибка:', error);
            if (error instanceof Error) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), error);
            }
            throw error;
=======
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
>>>>>>> 43495dbe6ea205fe94dad8ff3f09aac553caa4fa
        }
    }
}
exports.SixThinkingHats = SixThinkingHats;
