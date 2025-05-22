import { Injectable, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FileUploadModule } from './file-uploader/file-upload.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FileUploadModule,
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {
    constructor(private configService: ConfigService) {}

  getIndexName() {
    return this.configService.get('PINECONE_INDEX');
  }
}
