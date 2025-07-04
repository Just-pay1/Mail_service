import amqp, { Channel, ChannelModel, ConsumeMessage } from "amqplib";
import { RABBITMQ_IP, MAILS_QUEUE, RABBITMQ_PORT, RABBITMQ_PASSWORD, RABBITMQ_USERNAME } from "../config/variables";
import sendEmail, { EmailRequest } from "../utils/mail";


class RabbitMQ {
  private static instance: RabbitMQ;
  private connection!: ChannelModel;
  private mailChannel: Channel | null = null;


  public static async getInstance(): Promise<RabbitMQ> {
    if (!RabbitMQ.instance) {
      RabbitMQ.instance = new RabbitMQ();
      await RabbitMQ.instance.init();
    }
    return RabbitMQ.instance;
  }


  private async init(): Promise<void> {
    try {
      console.log(RABBITMQ_IP)
      this.connection = await amqp.connect({
        protocol: 'amqps',
        hostname: RABBITMQ_IP,
        port: Number(RABBITMQ_PORT) || 5672,
        username: RABBITMQ_USERNAME,
        password: RABBITMQ_PASSWORD,
        vhost: RABBITMQ_USERNAME,
        frameMax: 8192 // Ensure this is at least 8192
      });

      this.mailChannel = await this.connection.createChannel();

      // assert each queue to its channel

      await this.mailChannel.assertQueue(MAILS_QUEUE!)

      console.log('== RabbitMQ Connected ==');
    } catch (error) {
      console.error('RabbitMQ Connection Error:', error);
    }
  }

  public async consumeFromMailsQueue(){
    console.log(`== Started to consume from ${MAILS_QUEUE} ==`)
    await this.mailChannel?.consume(MAILS_QUEUE!, async (msg: ConsumeMessage | null) => {
      if (msg) {
        const data = JSON.parse(msg.content.toString());
        const mailObj: EmailRequest = {
          to: data.to,
          subject: data.subject,
          content: data.content
        }
        const ack = await sendEmail(mailObj);
        ack ? this.mailChannel?.ack(msg) : this.mailChannel?.nack(msg);
      }
    })

  }
}

export default RabbitMQ;