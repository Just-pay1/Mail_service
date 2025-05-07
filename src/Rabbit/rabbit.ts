import amqp, { Channel, ChannelModel, ConsumeMessage } from "amqplib";
import { ACTIVE_MERCHANTS, RABBITMQ_IP, MAILS_QUEUE, RABBITMQ_PORT, RABBITMQ_PASSWORD, RABBITMQ_USERNAME, MERCHANT_USERS_QUEUE } from "../config";


class RabbitMQ {
  private static instance: RabbitMQ;
  private connection!: ChannelModel;
  // private readonly url = RABBITMQ_IP || "amqp://localhost";
  private mailChannel: Channel | null = null;
  private activeMerchantsChannel: Channel | null = null;
  private merchantUsersChannel: Channel | null = null;



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

      this.activeMerchantsChannel = await this.connection.createChannel();
      this.mailChannel = await this.connection.createChannel();
      this.merchantUsersChannel = await this.connection.createChannel();

      // assert each queue to its channel
      await this.activeMerchantsChannel.assertQueue(ACTIVE_MERCHANTS!);
      await this.mailChannel.assertQueue(MAILS_QUEUE!)
      await this.merchantUsersChannel.assertQueue(MERCHANT_USERS_QUEUE!)

      console.log('== RabbitMQ Connected ==');
    } catch (error) {
      console.error('RabbitMQ Connection Error:', error);
    }
  }

  public async sendMail(message: object) {
    await this.mailChannel?.sendToQueue(MAILS_QUEUE!, Buffer.from(JSON.stringify(message)))
  }

  public async pushActiveMerchant(context: MerchantAttributes) {
    await this.activeMerchantsChannel?.sendToQueue(ACTIVE_MERCHANTS!, Buffer.from(JSON.stringify(context)))
  }

  // public async pushMerchantUser(user: MerchantUsers) {
  //     await this.merchantUsersChannel?.sendToQueue(MERCHANT_USERS_QUEUE!,  Buffer.from(JSON.stringify(user)))
  //     console.log('pushed to q');
  // }
}

export default RabbitMQ;