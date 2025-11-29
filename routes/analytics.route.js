import { Router } from "express";
import {
    getSpendingAnalytics,
    getIncomeAnalytics,
    getMonthlyTrendsAnalytics,
    getChartsData
} from '../controllers/analytics.controller.js';

import { authorize } from "../middleware/auth.middleware.js";

const analyticsRouter = Router();

// Route for Spending by Category Analytics
analyticsRouter.get('/spending/:userId', authorize, getSpendingAnalytics);
// Route for Income by Category Analytics
analyticsRouter.get('/income/:userId', authorize, getIncomeAnalytics);

// Route for Monthly Trends Analytics
analyticsRouter.get('/monthly-trends/:userId', authorize, getMonthlyTrendsAnalytics);

// Route for Charts Data
analyticsRouter.get('/charts/:userId', authorize, getChartsData);

export default analyticsRouter;