import express from "express";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

const app = express();
app.use(express.json());
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
try {
  await mongoClient.connect();
  console.log("MongoDB conectado com sucesso!");
} catch (err) {
  console.log(err);
}

const db = mongoClient.db("myBlog");
const usersCollection = db.collection("users");
const postsCollection = db.collection("posts");



const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`Server running in port: ${port}`));
