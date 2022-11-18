import { sessionsCollection, usersCollection } from "../database/db.js";

export async function sessionValidation(req, res, next) {
  const { authorization } = req.headers;

  const token = authorization?.replace("Bearer ", "");

  const session = await sessionsCollection.findOne({ token });
  const user = await usersCollection.findOne({ _id: session?.userId });

  if (!user) {
    return res.sendStatus(401);
  }

  next();
}
