import express, { Express } from 'express';
import { PORT } from './config/variables';
import RabbitMQ from './Rabbit/rabbit';


const app: Express = express();
const port = PORT || 4000

const server = app.listen(port, async () => {
  console.log(`Listening on ${port}`);
  const rabbitMQ = await RabbitMQ.getInstance();
  rabbitMQ.consumeFromMailsQueue();
});