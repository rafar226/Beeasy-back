import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { PineconeService } from 'src/pinecone/pinecone.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly configService: ConfigService,
    private readonly pineconeService: PineconeService,
  ) {}

  async queryRelevantChunks(query: string, userId: string, topK = 3 ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const embeddingResponse = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        input: query,
        model: 'text-embedding-ada-002',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    const queryEmbedding = embeddingResponse.data.data[0].embedding;

    const results = await this.pineconeService.querySimilarVectors(queryEmbedding, topK, userId);

    return results;
  }

    async generateAnswer(contextChunks: string[], query: string): Promise<string> {
    const prompt = `
        You are an assistant that answers questions based only on the provided context.
        Respond clearly and concisely.

        Context:
        ${contextChunks.join('\n\n')}

        Question:
        ${query}

        Answer:
        `.trim();

    const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'You answer questions using only the provided context.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        },
        {
        headers: {
            Authorization: `Bearer ${this.configService.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
        },
        },
    );

    return response.data.choices[0].message.content.trim();
    }


async answerWithContext(
  query: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  userId: string,
  options?: {
    defaultTone?: string;
    rolePrompt?: string;
    defaultInstructions?: string[];
  }
): Promise<string> {
  const relevantChunks = await this.queryRelevantChunks(query, userId);

  const context = relevantChunks.map((r) => {
    const chunk = r.metadata?.chunk;
    return typeof chunk === 'string' ? chunk : String(chunk ?? '');
  });

  const systemParts: string[] = [];

  if (options?.rolePrompt) {
    systemParts.push(options.rolePrompt);
  }

  if (options?.defaultTone) {
    systemParts.push(`Responde con un tono ${options.defaultTone}.`);
  }

  if (options?.defaultInstructions?.length) {
    systemParts.push(...options.defaultInstructions);
  }

  // Incluye el contexto
  if (context.length) {
    systemParts.push(`Basado exclusivamente en el siguiente contexto:\n${context.join('\n\n')}`);
  }

  const systemPrompt = systemParts.join('\n\n');
  console.log('systemPrompt', systemPrompt)
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: query }
      ],
      temperature: 0.3,
    },
    {
      headers: {
        Authorization: `Bearer ${this.configService.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content.trim();
}



    // async answerWithContext(
    //   query: string, 
    //   history: { role: 'user' | 'assistant'; content: string }[], 
    //   userId: string
    // ): Promise<string> {
    // const relevantChunks = await this.queryRelevantChunks(query, userId);

    // const context = relevantChunks.map((r) => {
    //     const chunk = r.metadata?.chunk;
    //     return typeof chunk === 'string' ? chunk : String(chunk ?? '');
    // });

    // const prompt = `
    // You are an assistant that answers questions based only on the provided context and conversation history.
    // Be concise and helpful.

    // Context:
    // ${context.join('\n\n')}

    // Conversation History:
    // ${history.map(m => `${m.role}: ${m.content}`).join('\n')}

    // User: ${query}
    // Assistant:
    // `.trim();

    // const response = await axios.post(
    //     'https://api.openai.com/v1/chat/completions',
    //     {
    //     model: 'gpt-3.5-turbo',
    //     messages: [
    //         { role: 'system', content: 'You are a helpful assistant answering only from the provided context and history.' },
    //         ...history,
    //         { role: 'user', content: prompt }
    //     ],
    //     temperature: 0.3,
    //     },
    //     {
    //     headers: {
    //         Authorization: `Bearer ${this.configService.get('OPENAI_API_KEY')}`,
    //         'Content-Type': 'application/json',
    //     },
    //     },
    // );

    //   return response.data.choices[0].message.content.trim();
    // }
}
