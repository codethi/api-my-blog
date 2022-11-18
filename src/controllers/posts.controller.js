import { ObjectId } from "mongodb";
import {
  sessionsCollection,
  usersCollection,
  postsCollection,
} from "../database/db.js";
import { v4 as uuidV4 } from "uuid";

export async function createPost(req, res) {
  const { title, text } = req.body;
  const { authorization } = req.headers;

  const token = authorization?.replace("Bearer ", "");

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
}

export async function findPosts(req, res) {
  const { authorization } = req.headers;

  const token = authorization?.replace("Bearer ", "");

  try {
    const posts = await postsCollection.find().sort({ _id: -1 }).toArray();
    res.send(posts);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

export async function commentPost(req, res) {
  const { text } = req.body;
  const { idPost } = req.params;
  const { authorization } = req.headers;

  const token = authorization?.replace("Bearer ", "");

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
}