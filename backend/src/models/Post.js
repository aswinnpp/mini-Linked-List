import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
    image: { type: String } // URL/path to uploaded image
  },
  { timestamps: true }
);

export const Post = mongoose.model('Post', postSchema);


