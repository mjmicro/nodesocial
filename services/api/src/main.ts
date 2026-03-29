import 'reflect-metadata'
import { NestFactory }                          from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule }                            from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  )

  app.enableCors({
    origin: [
      'http://localhost:8081',  // Expo web dev
      'http://localhost:19006', // Expo web alt port
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // LAN devices
    ],
    credentials: true,
  })

  await app.listen(process.env['PORT'] ?? 3001, '0.0.0.0')
}

bootstrap()
