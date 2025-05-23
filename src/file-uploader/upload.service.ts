import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PineconeService } from '../pinecone/pinecone.service';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

@Injectable()
export class UploadService {
  constructor(
    private readonly configService: ConfigService,
    private readonly pineconeService: PineconeService,
  ) {}

  async handleFile(file: Express.Multer.File, userId: string) {
    const text = file.buffer.toString('utf-8');
    const chunks = this.chunkText(text, 1000);
    const embeddings = await this.generateEmbeddings(chunks);

    const vectors = embeddings.map((embedding, index) => ({
      id: uuidv4(),
      values: embedding,
      metadata: {
        chunk: chunks[index],
        fileName: file.originalname,
        uploadedAt: Date.now(),
        userId: userId,
      },
    }));

    await this.pineconeService.upsertEmbeddings(vectors, userId);

    return {
      chunksCount: chunks.length,
      embeddingsCount: embeddings.length,
    };
  }

  private chunkText(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
      chunks.push(text.slice(i, i + chunkSize));
      i += chunkSize;
    }
    return chunks;
  }

  private async generateEmbeddings(chunks: string[]): Promise<number[][]> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const endpoint = 'https://api.openai.com/v1/embeddings';

    const embeddings: number[][] = [];

    for (const chunk of chunks) {
      const response = await axios.post(
        endpoint,
        {
          input: chunk,
          model: 'text-embedding-ada-002',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );

      const embedding = response.data.data[0].embedding;
      embeddings.push(embedding);
    }

    return embeddings;
  }
}
