import express from "express";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { v4 as uuidV4 } from "uuid";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
dotenv.config();

// Conexão com o MongoDB
const mongoClient = new MongoClient(process.env.MONGO_URI);
try {
  await mongoClient.connect();
  console.log("MongoDB conectado com sucesso!");
} catch (err) {
  console.log(err);
}

// Criação do banco e coleções
const db = mongoClient.db("myBlog");
const usersCollection = db.collection("users");
const postsCollection = db.collection("posts");
const sessionsCollection = db.collection("sessions");

// Rotas
app.post("/sign-up", async (req, res) => {
  const user = req.body; // name, email and password

  try {
    const userExists = await usersCollection.findOne({ email: user.email });
    if (userExists) {
      return res.status(409).send({ message: "Esse usuário já existe" });
    }

    const hashPassword = bcrypt.hashSync(user.password, 10);

    await usersCollection.insertOne({ ...user, password: hashPassword });
    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

  const token = uuidV4();

  try {
    const userExists = await usersCollection.findOne({ email });

    if (!userExists) {
      return res.sendStatus(401);
    }

    const passwordOk = bcrypt.compareSync(password, userExists.password);

    if (!passwordOk) {
      return res.sendStatus(401);
    }

    await sessionsCollection.insertOne({
      token,
      userId: userExists._id,
    });

    res.send({ token });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.post("/posts", (req, res) => {});

app.get("/posts", (req, res) => {});

const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`Server running in port: ${port}`));
