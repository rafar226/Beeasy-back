import { Module } from '@nestjs/common';
import { FileUploadController } from './file-upload.controller';
import { UploadService } from './upload.service';
import { PineconeModule } from 'src/pinecone/pinecone.module';

@Module({
  controllers: [FileUploadController],
  providers: [UploadService],
  imports: [PineconeModule]
})
export class FileUploadModule {}
