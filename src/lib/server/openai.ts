import { OpenAI } from 'langchain/llms/openai';
import { OPENAI_API_KEY } from '$env/static/private';

export const model = new OpenAI({ openAIApiKey: OPENAI_API_KEY, temperature: 0.5 });
