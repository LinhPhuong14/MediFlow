import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

async function bootstrap() {
  let httpsOptions: any;

  // TLS certificates (for local / MVP)
  const keyPath = path.resolve(__dirname, '..', 'secrets', 'key.pem');
  const certPath = path.resolve(__dirname, '..', 'secrets', 'cert.pem');

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
      minVersion: 'TLSv1.3',
      maxVersion: 'TLSv1.3',
    };
    console.log('HTTPS enabled (TLS 1.3)');
  } else {
    console.log('TLS certificates not found. Running in HTTP mode.');
  }

  const app = await NestFactory.create(AppModule, httpsOptions ? { httpsOptions } : undefined);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
