import express from 'express';
import { PORT, NODE_ENV, CLIENT_URL } from './config/env.js';
import connectDB from './database/mongodb.js';
import authRoute from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import errorMiddleware from './middleware/error.middleware.js';
import arcjetMiddleware from './middleware/arcjet.middleware.js';
import { notFoundMiddleware } from './middleware/notFound.middleware.js';
import userRoute from './routes/user.route.js';
import categoryRoute from './routes/category.route.js';
import transactionRouter from './routes/transaction.route.js';
import budgetRoute from './routes/budget.route.js';
import settingsRoute from './routes/settings.route.js';
import analyticsRoute from './routes/analytics.route.js';
import cors from 'cors'





const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Cors
app.use(cors({
  origin: [
    CLIENT_URL,              // Your frontend (prod)
    "http://localhost:8081", // Expo web
    "http://localhost:19006",// Expo web alt port
    "expo://*",              // Native Expo mobile
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
}));

app.options("*", cors()); // Allow preflight


// Arcjet middleware for security
app.use(arcjetMiddleware);


// Routes
// API Routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/transaction", transactionRouter);
app.use("/api/v1/budget", budgetRoute);
app.use("/api/v1/settings", settingsRoute);
app.use("/api/v1/analytics", analyticsRoute);
// Error handling middleware
app.use(errorMiddleware);

// Not Found Middleware
app.use(notFoundMiddleware);

const port = PORT  || 5000
app.get('/', (req, res) => {
    res.send('Hello, welcome to the backend of my application');
});

app.listen(port, async () => {
    console.log(`Server is running on port: http://localhost:${port} in ${NODE_ENV} mode`);
    await connectDB();
});

export default app;