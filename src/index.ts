import express, { Express } from 'express';
const app: Express = express();
import * as dotenv from 'dotenv';
dotenv.config();
const PORT: number = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${process.env.PORT || PORT}`);
});