import { model, models, Schema } from "mongoose";
const postSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jsonId: {
      type: Number,
    },
    title: {
      type: String,
    },
    body: {
      type: String,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Post = models.Post || model("Post", postSchema);
export default Post;
