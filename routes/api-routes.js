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
// then put the articles in the database, making sure not to duplicate articles already in the database
// then, get all of the articles in the database to display

  
  app.get("/", function(req, res) {
    // First, we grab the body of the html with request
    request("https://www.scientificamerican.com/section/news/", function(error, response, html) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(html);
      // Now, we grab article tag with a class of listing-wide, and do the following:

      $("article.listing-wide").each(function(i,element){


        // Save an empty result object
        var result = {};

        // Add the title text and href and img src of every article, and save them as properties of the result object


        result.title = $(element).find("h2.t_listing-title").find("a").text();
        result.link = $(element).find("h2.t_listing-title").find("a").attr("href");
        result.img = $(element).find("div.listing-wide__thumb").find("img").attr("src");

        //check to see if the article is already in the database

        Article.findOne({ "title": result.title }, function(error, doc) {
          if (!doc){
        //no matching article
        // Using our Article model, create a new db record
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
      }); //end .each


      //now get them all for display

      // after the first load, as new articles are added to the scientific american website, the most recently 
      // added will be at the top of the list. The first load, the articles will appear roughly in the opposite order
      // as they are on the website.  This isn't quite what I want - need to see if I can get the publication date from the
      // website in a format that I can either use or maniuplate....

     //having an asynchronous issue here! This is a hack, but I don't know how to resolve this problem yet.
     setTimeout(function(){

      Article.find({},null,{sort:{date_added: -1}}, function(error, doc) {
        console.log(doc);
        // Log any errors
        if (error) {
          console.log(error);
        }
        // Send the date to the browser to display using index.handlebars
        else {
            res.render("index", {article: doc});
        }
      });
    },1000);  //wait one second to let posting to the database finish before getting all of the documents for display


    });//end request


  }); //end app.get



  // This will get the saved articles and pass them on to be displayed using myarticles.handlebars


  app.get("/savedarticles", function(req, res) {
    // Grab every doc in the Articles array
    Article.find({"saved": true}, function(error, doc) {

      // Log any errors
      if (error) {
        console.log(error);
      }
      // Or send the doc to the browser as a json object
      else {

        if (doc.length==0){
          //tell user that none have been saved
          //this is awkward here - we're just staying on the home page without notifying the user
          return;
        }

        res.render("myarticles", {sa: doc});
      }
    });
  });

  // Grab all notes with a given article id

  app.get("/articlewithnotes/:id", function(req, res) {
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

        if (doc.notes.length===0){
          doc.notes= [
          {body: "No notes for this article."}
          ]
        }
        //in the case that there are no notes, because we are sending this to handlebars, the No notes message
        //get a delete button - inappropriate. I need to handle this somehow....
        res.render("notes", {paper: doc});  //doc.notes works
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


  // When deleting a note, delete the reference to the note in the article 
  // then delete the note itself

  app.post("/noteremove/:id", function(req, res){

    //update the article to which the note is attached - get rid of the reference to the note we are going to delete

    Article.update( { _id: req.params.id }, { $pullAll: { notes: [req.body._id] } } , function(err,doc){

    });

    //now get rid of the note itself

    Note.findByIdAndRemove(req.body._id, function(err,doc) {
      if (err) {
          console.log(err);
      }
      else {
          //send the updated article back to app.js so that we can use it to update the browser
          res.send(doc);
      }
    });

  });


  // Create a new note and a reference to that note in the article - the id in req.params.id is the id of the article to which the note is attached

  app.post("/note/:id", function(req, res) {
    // Create a new note using the note text passed in during the ajax call
    var newNote = new Note(req.body);

    // And save the new note the db
    newNote.save(function(error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Otherwise
      else {
        // Use the article id to find and update it's notes array using the _id of the note that you just added to the db
        // That _id was just passed back to you after the save in doc._id

        Article.findOneAndUpdate({ "_id": req.params.id }, { $push: {"notes": doc._id }}, {new: true}, function(err,doc){
          // Log any errors
          if (err) {
            console.log("there was an error");
            res.send(err);
          }
          else {

            // Or send the document to the browser 
            res.send(doc);  

            //if I don't send anything back, the .done in the ajax call will not trigger
            //for some reason, if I do not send anything back, the page refreshes anyway and dipslays the updated notes.
          }
          
        });//end findOneAndUpdate
        
      } //end else
     
    }); //end newNote.save
    
  }); //end app.post
  

};//end of export
