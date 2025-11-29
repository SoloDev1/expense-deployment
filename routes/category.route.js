import { Router } from "express";
import {
    createCategory,
    getCategories,
    getCategoryById,
    deleteCategory,
    updateCategory
} from '../controllers/category.controller.js';

import { authorize } from "../middleware/auth.middleware.js";


const categoryRouter = Router();

categoryRouter.get("/", authorize, getCategories);
categoryRouter.get("/:id", authorize, getCategoryById);
categoryRouter.post("/", authorize, createCategory);
categoryRouter.put("/:id", authorize, updateCategory);
categoryRouter.delete("/:id", authorize, deleteCategory);
export default categoryRouter;