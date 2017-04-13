//*********** Home Page ***********************//

// When you click the save article button on the Home Page
$(document).on("click", ".save-article", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/article/" + thisId,
    data: {
      saved: true
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
    });

});


//*************** Saved Articles Page ************************//

// When you click the delete from saved articles button on the Saved Articles page
$(document).on("click", ".unsave-article", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/article/" + thisId,
    data: {
      saved: false
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      location.href = "/savedarticles";
    });

});




//When user clicks on Article Notes for a saved Article on the Saved Articles page
$(document).on("click", ".manage-notes", function() {
 
  // Get the article id stored in the Article Notes button
  var thisId = $(this).attr("data-id");
  location.href = "/articlewithnotes/" + thisId;

});


//***************** Notes page *************************//



// When you click the delete-note button 
$(document).on("click", ".delete-note", function() {
  //Grab the id associated with the article from the url
  var i = window.location.href.indexOf("es/");
  var temp = window.location.href.substring(i + 3);
  var articleId = temp;


  var thisId = $(this).attr("data-id"); //this is the note id


  // Run a POST request to delete the note and the reference to the note in the article
  // sending the article id in params and the note id in the req.body
  $.ajax({
    method: "POST",
    url: "/noteremove/" + articleId,
    data: {
      _id: thisId
    }
  })
    // With that done
    .done(function(data) {
      
      // Refresh the page

      location.href = "/articlewithnotes/" + articleId;
      
      // Remove the values entered in the textarea for note entry

      $("#note-body").val("");

    });

  

});


// When you click the save-note button
$(document).on("click", "#save-note", function() {
  
  //Grab the id associated with the article from the url
  var i = window.location.href.indexOf("es/");
  var temp = window.location.href.substring(i + 3);


  var thisId = temp;

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/note/" + thisId,
    data: {
      // Value taken from title input
      // title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#note-body").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);

    });

  // Remove the values entered in the textarea for note entry

  $("#note-body").val("");
});






