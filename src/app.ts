import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/utils/globalErrorHandler/globalErrorHandler';
import router from './app/routes';
import cookieParser from 'cookie-parser';

const app: Application = express();

//parsers
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://sport-ease-client.web.app'],
    credentials: true,
  }),
);

// application routes
app.use('/api', router);

// Global error handler
app.use(globalErrorHandler);

// Catch all middleware for handling undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: 'Not found',
  });
});

export default app;
