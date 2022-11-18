import express from "express";
import joi from "joi";
import usersRoutes from "./routes/users.routes.js";
import postsRoutes from "./routes/posts.routes.js";

const app = express();
app.use(express.json());
app.use(usersRoutes);
app.use(postsRoutes);

export const usersSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
});

export const postsSchema = joi.object({
  title: joi.string().required(),
  text: joi.string().required(),
  user: joi.string().required(),
  comments: joi.array(),
});

const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`Server running in port: ${port}`));
