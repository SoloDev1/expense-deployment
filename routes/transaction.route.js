import { Router } from "express";
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getDashboardSummary
} from "../controllers/transaction.controller.js";  

import { authorize } from "../middleware/auth.middleware.js";

const transactionRoute = Router();
      
// 1. FIXED: Added 'authorize' here
transactionRoute.post("/", authorize, createTransaction);

// 2. Get all transactions (supports ?page=1&limit=20&type=expense)
transactionRoute.get("/", authorize, getTransactions); 

transactionRoute.get('/summary', getDashboardSummary)

// 3. Get specific transaction
transactionRoute.get("/:id", authorize, getTransactionById);

// 4. Update transaction
transactionRoute.put("/:id", authorize, updateTransaction);

// 5. Delete transaction
transactionRoute.delete("/:id", authorize, deleteTransaction);

export default transactionRoute;