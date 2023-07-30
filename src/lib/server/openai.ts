import { OpenAI } from 'langchain/llms/openai';
import { OPENAI_API_KEY } from '$env/static/private';
import { Configuration, OpenAIApi } from 'openai';

export const model = new OpenAI({
	openAIApiKey: OPENAI_API_KEY,
	temperature: 0.5,
	maxTokens: 500
});

const configuration = new Configuration({
	apiKey: OPENAI_API_KEY
});
export const openai = new OpenAIApi(configuration);

export const DEFAULT_MODEL_SETTINGS = {
	model: 'gpt-3.5-turbo',
	temperature: 1,
	max_tokens: 256
	// top_p: 1,
	// frequency_penalty: 0,
	// presence_penalty: 0
};
