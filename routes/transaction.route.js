import { Router } from "express";
import {
  createTransaction,
  getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
} from "../controllers/transaction.controller.js";  

import { authorize } from "../middleware/auth.middleware.js";

const transactionRoute = Router();
      
// Route to create a new transaction
transactionRoute.post("/", createTransaction);
// Route to get all transactions
transactionRoute.get("/", authorize, getTransactions); 
// Route to get a transaction by ID
transactionRoute.get("/:id", authorize, getTransactionById);
// Route to update a transaction by ID
transactionRoute.put("/:id", authorize, updateTransaction);
// Route to delete a transaction by ID
transactionRoute.delete("/:id", authorize, deleteTransaction);

export default transactionRoute;

