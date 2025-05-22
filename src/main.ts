import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
// pcsk_K7UDk_E5Z1qXfyx3bMdWV7kyzqEGuHzxUyTgSNFyvUDiqZJyDKm2UYfAEayitMWf6AbJ5