// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({
  // title is a required string
  title: {
    type: String,
    required: true
  },
  // link is a required string
  link: {
    type: String,
    required: true
  },
  img:{
    type: String,
    required: true
  },
  saved: {
    type: Boolean,
    default: false
  },
 //ref refers to the Note model

  notes: [{
    type: Schema.Types.ObjectId,
    ref: "Note"
  }],
    date_added: {
    type: Date,
    default: Date.now
  }
});

// Create the Article model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export the model
module.exports = Article;
