import { Router } from "express";
import {
  createPost,
  findPosts,
  commentPost,
} from "../controllers/posts.controller.js";
import { authValidation } from "../middlewares/authValidation.middleware.js";
import { sessionValidation } from "../middlewares/sessionValidation.middleware.js";

const router = Router();

router.use(authValidation);
router.use(sessionValidation);

router.post("/posts", createPost);
router.get("/posts", findPosts);
router.put("/comment/:idPost", commentPost);

export default router;
