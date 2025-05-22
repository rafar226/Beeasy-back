import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PineconeService } from 'src/pinecone/pinecone.service';
import { PineconeModule } from 'src/pinecone/pinecone.module';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
  imports: [PineconeModule]
})
export class ChatModule {}
