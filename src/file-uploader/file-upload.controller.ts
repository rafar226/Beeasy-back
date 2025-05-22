import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Express } from 'express';

@Controller('upload')
export class FileUploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))

  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('ingreso')
    const result = await this.uploadService.handleFile(file);
    return { success: true, result };
  }

}
