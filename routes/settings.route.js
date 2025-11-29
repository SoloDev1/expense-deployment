import { Router } from "express";
import {
  getUserSettings,
  updateUserSettings
} from "../controllers/settings.controller.js";

import { authorize } from "../middleware/auth.middleware.js";

const settingsRouter = Router();

// Route to get user settings
settingsRouter.get('/:userId', authorize, getUserSettings);

// Route to update user settings
settingsRouter.put('/:userId', authorize, updateUserSettings);

export default settingsRouter;