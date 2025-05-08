import amqp, { Channel, ChannelModel, ConsumeMessage } from "amqplib";
import { RABBITMQ_IP, MAILS_QUEUE, RABBITMQ_PORT, RABBITMQ_PASSWORD, RABBITMQ_USERNAME} from "../config/variables";
import sendEmail from "../utils/mail";


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
      this.connection = await amqp.connect({
        protocol: 'amqps',
        hostname: RABBITMQ_IP || 'localhost',
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

  public async sendMail(message: object) {
    await this.mailChannel?.sendToQueue(MAILS_QUEUE!, Buffer.from(JSON.stringify(message)))
  }

  public async startMailConsumer() {
    if (!this.mailChannel) throw new Error('Mail channel not initialized.');
  
    await this.mailChannel.assertQueue(MAILS_QUEUE);
  
    this.mailChannel.consume(MAILS_QUEUE, async(msg) => {
      if (msg) {
        const { to, subject, content } = JSON.parse(msg.content.toString());
        try {
          await sendEmail({ to, subject, content });
          this.mailChannel.ack(msg);
        } catch (error) {
          console.error('Failed to send email from consumer:', error);
        }
      }
    });
  
    console.log('Waiting for email jobs...');
  }
}

export default RabbitMQ;