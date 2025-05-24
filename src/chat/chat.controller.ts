import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

@Post('query')
async query(@Body() body: {
  query: string;
  history: { role: string; content: string }[];
  userId: string;
  defaultTone?: string;
  rolePrompt?: string;
  defaultInstructions?: string[];
}) {
  const {
    query,
    history,
    userId,
    defaultTone,
    rolePrompt,
    defaultInstructions
  } = body;

  const typedHistory = history.map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));
  console.log('answer', body);

  const answer = await this.chatService.answerWithContext(
    query,
    typedHistory,
    userId,
    { defaultTone, rolePrompt, defaultInstructions }
  );

  return { answer };
}


    // await index.query({
    //   vector: queryEmbedding,
    //   topK,
    //   includeMetadata: true,
    //   namespace: userId, // ← muy importante
    // });
}
