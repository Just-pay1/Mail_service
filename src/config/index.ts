import * as dotenv from 'dotenv';


// RABBITMQ 
export const RABBITMQ_IP = process.env.RABBITMQ_IP;
export const RABBITMQ_PORT = process.env.RABBITMQ_PORT;
export const RABBITMQ_USERNAME = process.env.RABBITMQ_USERNAME;
export const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD;
export const ACTIVE_MERCHANTS = process.env.ACTIVE_MERCHANTS;
export const MAILS_QUEUE = process.env.MAILS_QUEUE
export const MERCHANT_USERS_QUEUE = process.env.MERCHANT_USERS_QUEUE