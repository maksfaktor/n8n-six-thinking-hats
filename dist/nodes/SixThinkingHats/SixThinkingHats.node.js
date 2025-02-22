"use strict";
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
        this.description = {
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
                    type: "main" /* NodeConnectionType.Main */,
                    required: true,
                },
            ],
            outputs: [
                {
                    type: "main" /* NodeConnectionType.Main */,
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
        }
    }
}
exports.SixThinkingHats = SixThinkingHats;
