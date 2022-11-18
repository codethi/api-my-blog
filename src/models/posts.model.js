import joi from "joi";

export const postsSchema = joi.object({
  title: joi.string().required(),
  text: joi.string().required(),
  user: joi.object().required(),
  comments: joi.array(),
});
