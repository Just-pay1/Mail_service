import express, { Express } from 'express';
import bodyParser from 'body-parser';
import emailRoutes from './routes/mail';

const app: Express = express();

app.use(bodyParser.json());
app.use(emailRoutes);

const PORT: number = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 