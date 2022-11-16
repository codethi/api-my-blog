import express from "express";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
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

app.post("/posts", async (req, res) => {
  const { title, text } = req.body;
  const { authorization } = req.headers;

  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const session = await sessionsCollection.findOne({ token });
    const user = await usersCollection.findOne({ _id: session?.userId });

    if (!user) {
      return res.sendStatus(401);
    }

    await postsCollection.insertOne({
      title,
      text,
      userId: user._id,
      comments: [],
    });

    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.get("/posts", async (req, res) => {
  const { authorization } = req.headers;

  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    //const posts = await postsCollection.find().toArray();
    const posts = await postsCollection
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        {
          $unwind: "$userId",
        },
        { $unset: "userId.password" },
      ])
      .sort({ _id: -1 })
      .toArray();

    res.send(posts);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.patch("/comment/:idPost", async (req, res) => {
  const { text } = req.body;
  const { idPost } = req.params;
  const { authorization } = req.headers;

  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const session = await sessionsCollection.findOne({ token });
    const user = await usersCollection.findOne({ _id: session?.userId });

    if (!user) {
      return res.sendStatus(401);
    }
    const post = await postsCollection.findOne({ _id: ObjectId(idPost) });

    if (!post) {
      return res.status(404).send({ message: "Esse post não existe!" });
    }

    await postsCollection.updateOne(
      { _id: ObjectId(idPost) },
      { $push: { comments: { commentId: uuidV4(), text, user: user._id } } }
    );

    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`Server running in port: ${port}`));
