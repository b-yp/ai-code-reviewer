import axios, { AxiosInstance } from 'axios';
import { openAiCompletionsConfig, suggestContent, systemContent } from "./utils";

interface ICompletion {
    messages?: { role: string, content: string }[];
    model: string;
}

export class OpenAI {
    private apiClient: AxiosInstance;
    private accessTokens: string[];
    private accessTokenIndex = 0;

    constructor(private apiUrl: string, private accessToken: string, private orgId?: string, private model?: string) {
        this.accessTokens = accessToken.split(',');
        const headers: { 'OpenAI-Organization'?: string } = {};
        if (orgId) {
            headers['OpenAI-Organization'] = orgId;
        }
        this.apiClient = axios.create({
            baseURL: apiUrl,
            headers: {
                ...headers,
            },
        });
    }

    async reviewCodeChange(change: string): Promise<string> {
        const newIndex = this.accessTokenIndex = (this.accessTokenIndex >= this.accessTokens.length - 1 ? 0 : this.accessTokenIndex + 1);
        if (this.model) {
            openAiCompletionsConfig.model = this.model;
        }
        const data: ICompletion = { ...openAiCompletionsConfig };
        data.messages = [
            systemContent,
            suggestContent,
            {
                role: 'user',
                content: change
            }
        ];
        const response = await this.apiClient.post('/v1/chat/completions', data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessTokens[newIndex]}`
            }
        });
        console.log('reviewCodeChange response:', response)
        return response.data.choices?.[0]?.message?.content;
    }
}
