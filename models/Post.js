const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
  },
  text: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  pic: {
    type: String, // store image URL or filename
    default: "",
  },
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
      },
    },
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
      },
      text: {
        type: String,
        required: true,
      },
      name: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Post = mongoose.model("Post", postSchema);
