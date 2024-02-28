import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database';
import Router from "./routes";
import cors from "cors";
import cookieParser from "cookie-parser";

//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

const corsOptions: cors.CorsOptions = {
  origin: [
    "https://www.yoursite.com",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "http://localhost:9200",
    "http://localhost:3000"
  ], // Replace with the origin(s) of your client application
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  optionsSuccessStatus: 204, // Respond with a 204 for preflight requests
};

connectDB();

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(Router);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
