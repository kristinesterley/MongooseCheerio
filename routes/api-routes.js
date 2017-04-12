// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");


// bring in the Article and Note mongoose models
var Article = require('../models/Article');
var Note = require('../models/Note');

// Routes
// ======
module.exports = function(app) {
// A GET request to scrape the Scientific American website

  

app.get("/", function(req, res) {
  // First, we grab the body of the html with request
  request("https://www.scientificamerican.com/section/news/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $(".t_listing-title").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      //check to see if the article is already in the database

      Article.findOne({ "title": result.title }, function(error, doc) {
        if (!doc){
      //no matching article
      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
          var entry = new Article(result);

          // Now, save that entry to the db
          entry.save(function(err, doc) {
            // Log any errors
            if (err) {
              console.log(err);
            }
            // Or log the doc
            else {
              console.log(doc);
            }
          });
        } //end if error

    });//end of Article.findOne
  });
    //now get them all for display
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
        res.render("index", {article: doc});
    }
  });

  // res.render("index");
  // Tell the browser that we finished scraping the text
  // res.send("Scrape Complete");
});


});


// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// This will get the saved articles 
app.get("/savedarticles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({"saved": true}, function(error, doc) {

    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {

      res.render("myarticles", {sa: doc});
      // res.json(doc); //I want to send doc to save.handlebar and display what's in doc  ********************
    }
  });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("notes")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {

      res.json(doc);
    }
  });
});

//update an article's saved flag

app.post("/article/:id", function(req, res) {

      // Use the article id to find and update it's saved flag
      Article.findOneAndUpdate({ "_id": req.params.id }, {"saved": req.body.saved }, function(err,doc){
     
      
        // Log any errors
        if (err) {
          res.send(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    
  });





// Create a new note or replace an existing note - the id in req.params.id is the id of the article to which the note is attached
app.post("/note/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, { $push: {"notes": doc._id }}, {new: true}, function(err,doc){
     
      
        // Log any errors
        if (err) {
          res.send(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});

};
