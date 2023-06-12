import dotenv from 'dotenv' 
dotenv.config();
import express from 'express';
import routes from './routes';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/operation',routes.operation);
app.use('/api/result',routes.result);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`The application starts on port ${port}`);
  });