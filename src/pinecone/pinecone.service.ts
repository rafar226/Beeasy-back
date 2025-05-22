import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';

@Injectable()
export class PineconeService {
    private pinecone: Pinecone;
    private indexName: string;

    constructor(private readonly configService: ConfigService) {
        this.pinecone = new Pinecone({
        apiKey: this.configService.get<string>('PINECONE_API_KEY') || '',
        });
        this.indexName = this.configService.get<string>('PINECONE_INDEX') || '';
    }

    async upsertEmbeddings(vectors: PineconeRecord<Record<string, string | number | boolean>>[]) {
        const index = this.pinecone.Index(this.indexName);
        await index.upsert(vectors);
    }

    async querySimilarVectors(queryEmbedding: number[], topK: number) {
    const index = this.pinecone.Index(this.indexName);

    const queryResponse = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        includeValues: false,
    });

    return queryResponse.matches;
    }
}
