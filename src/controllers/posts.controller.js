import { ObjectId } from "mongodb";
import {
  sessionsCollection,
  usersCollection,
  postsCollection,
} from "../database/db.js";
import { v4 as uuidV4 } from "uuid";
import { postsSchema } from "../models/posts.model.js";

export async function createPost(req, res) {
  const { title, text } = req.body;
  const user = req.user;

  try {
    const newPost = {
      title,
      text,
      user: user._id,
      comments: [],
    };

    const { error } = postsSchema.validate(newPost, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).send(errors);
    }

    await postsCollection.insertOne(newPost);

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
    const session = await sessionsCollection.findOne({ token });
    const user = await usersCollection.findOne({ _id: session?.userId });

    if (!user) {
      return res.sendStatus(401);
    }

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
