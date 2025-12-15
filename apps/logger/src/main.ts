import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AsyncApiDocumentBuilder, AsyncApiModule, AsyncServerObject } from 'nestjs-asyncapi';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://user:password@localhost:5672'],
      queue: 'logger_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  if (process.env.NODE_ENV !== 'production') {
    const asyncApiOptions = new AsyncApiDocumentBuilder()
      .setTitle('Logger Service')
      .setDescription('Сервіс логування через RabbitMQ')
      .setVersion('1.0')
      .setDefaultContentType('application/json')
      .addServer('rabbitmq', {
        url: 'amqp://localhost:5672',
        protocol: 'amqp',
        description: 'RabbitMQ Server',
      } as AsyncServerObject)
      .build();

    const asyncApiDocument = AsyncApiModule.createDocument(
      app,
      asyncApiOptions,
    );
    await AsyncApiModule.setup('async-api', app, asyncApiDocument);
  }

  await app.startAllMicroservices();

  Logger.log(`✅ Microservice Logger is listening on queue: logger_queue`);

  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.LOGGER_PORT || 3001;
    await app.listen(port);
    Logger.log(
      `📑 AsyncAPI documentation available at: http://localhost:${port}/async-api`,
    );
  }
}

bootstrap();
