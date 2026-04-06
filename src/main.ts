import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // ← enables @Type() and @Transform() decorators
      whitelist: true, // ← strips unknown fields
    }),
  );
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
