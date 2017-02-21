const express = require('express'),
  mongoose    = require('mongoose'),
  router      = express.Router(),
  User        = require('../models/users'),
  Poll        = require('../models/polls');
  
// Router to a users profile page.
router.get('/:userId', (req, res) => {
  let userName,
    realName,
    pollsVoted,
    pollsCreated;
  // Find user information to be placed in the html page.
  User.find({_id: req.params.userId}, (err, result) => {
    if(err) throw err;
    // Set user information to variables.
    userName = result[0].username;
    realName = result[0].name;
    pollsVoted = result[0].pollsVoted;
    
    // Find all polls that this user has created.
    Poll.find({creator: userName}, (err, result2) => {
      if(err) throw err;
      pollsCreated = result2.map( d => {
        return { pollsCreatedId: d._id, title: d.topic};
      });
      console.log(pollsVoted);
      res.render('profile', {
        userName,
        realName,
        pollsVoted,
        pollsCreated
      });
    });
  });
});

module.exports = router;