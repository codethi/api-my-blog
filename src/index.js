import express from "express";
import cors from "cors";
import usersRoutes from "./routes/users.routes.js";
import postsRoutes from "./routes/posts.routes.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use(usersRoutes);
app.use(postsRoutes);

const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`Server running in port: ${port}`));
