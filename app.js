import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { PORT, NODE_ENV, CLIENT_URL } from './config/env.js';

// Middleware Imports
import errorMiddleware from './middleware/error.middleware.js';
import arcjetMiddleware from './middleware/arcjet.middleware.js';
import { notFoundMiddleware } from './middleware/notFound.middleware.js';

// Route Imports
import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import categoryRoute from './routes/category.route.js';
import transactionRouter from './routes/transaction.route.js';
import budgetRoute from './routes/budget.route.js';
import settingsRoute from './routes/settings.route.js';
import analyticsRoute from './routes/analytics.route.js';

const app = express();

// ==========================================
// 1. GLOBAL MIDDLEWARE
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS: Security configuration
app.use(cors({
  origin: [
    CLIENT_URL,              // Production Frontend
    "http://localhost:8081", // Expo Web
    "http://localhost:19006",// Expo Web (Alt)
    "expo://*",              // Expo Mobile Go
    "http://localhost:3000"  // Standard React Dev (Optional addition)
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
}));
app.options("*", cors()); // Enable Pre-flight across-the-board

// Security / Rate Limiting (Arcjet)
app.use(arcjetMiddleware);

// ==========================================
// 2. ROUTES
// ==========================================

// Health Check (Must be before 404)
app.get('/', (req, res) => {
  res.send(`Welcome to the Personal Finance API (${NODE_ENV})`);
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/budgets", budgetRoute);
app.use("/api/v1/settings", settingsRoute);
app.use("/api/v1/analytics", analyticsRoute);


// Catch 404 (Requests that didn't match any route above)
app.use(notFoundMiddleware);

// Global Error Handler (Catches errors from next(err))
app.use(errorMiddleware);


const port = PORT || 5000;

// Only listen if this file is run directly (not imported by tests)
if (NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`🚀 Server is running on port: http://localhost:${port} in ${NODE_ENV} mode`);
  });
}

export default app;