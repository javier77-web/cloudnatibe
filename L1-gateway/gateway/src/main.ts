import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { readFileSync } from 'node:fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      key: readFileSync('./cert/llave.pem'),
      cert: readFileSync('./cert/certificado.pem'),
    },
  });
  app.enableCors({ origin: 'http://localhost:4200' });
  await app.listen(8080);
  console.log('gateway escuchando en https://localhost:8080');
}
bootstrap();
