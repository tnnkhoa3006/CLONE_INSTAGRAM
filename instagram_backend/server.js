import express, { json } from 'express';
import connectDB from './config/db.js';
import { config } from 'dotenv';
import cors from 'cors';
import corsOptions from './utils/cors.js';
import indexRoute from './routes/index.route.js';
import cookieParser from "cookie-parser";
import path from 'path';
import { app, server } from './socket/socket.js';

const _dirname = path.resolve();

config();
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Middleware
app.use(json());
app.use(cors(corsOptions));

// Tăng body parser limits
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Timeout
app.use((req, res, next) => {
  req.setTimeout(300000); // 5 phút
  res.setTimeout(300000); // 5 phút
  next();
});

// Route
app.use('/api/v1', indexRoute);

app.use(express.static(path.join(_dirname, '/thread/dist')));

app.get('/{*any}', (req, res) => {
    res.sendFile(path.join(_dirname, "thread", "dist", "index.html"));
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server started on port ${port}`));