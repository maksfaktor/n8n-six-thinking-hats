import { INodeProperties, NodePropertyTypes, IDataObject } from 'n8n-workflow';

export interface IHatResponse {
    color: string;
    content: string;
    timestamp: string;
}

// Обновляем интерфейс для корректной работы с IDataObject
export interface IAnalysisResult {
    status: 'success' | 'error';
    conversation: IHatResponse[];
    error?: string;
    [key: string]: IHatResponse[] | string | undefined;
}

export const hatColors = {
    blue: '#0000FF',
    white: '#FFFFFF',
    red: '#FF0000',
    black: '#000000',
    yellow: '#FFFF00',
    green: '#00FF00',
} as const;

export const defaultHatsOrder = ['blue', 'white', 'red', 'black', 'yellow', 'green'];

export interface IHatProperties extends INodeProperties {
    displayName: string;
    name: string;
    type: NodePropertyTypes;
    default: any;
    description: string;
}