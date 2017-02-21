const express = require('express'),
  mongoose    = require('mongoose'),
  router      = express.Router(),
  User        = require('../models/users'),
  Poll        = require('../models/polls');
  
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/users/login');
  }
}  

// Route for users to view created polls.
router.get('/mypolls', ensureAuthenticated,(req, res) => {
  let pollsCreated = [];
  Poll.find({creator: res.locals.user.name}, (err, result) => {
    if(err) throw err;
    pollsCreated = result.map( d => {
      return {
        topic: d.topic,
        id: d._id
      };
    });
    res.render('mypolls', {
      pollsCreated
    });
  });
});

// Route for users send a delete request for a poll.
router.post('/mypolls/delete', (req, res) => {
  console.log(req.body.deleted);
  Poll.remove({_id: req.body.deleted}, (err) => {
    if(err) throw err;
    req.flash('success_msg', 'Poll has been deleted');
    res.redirect('/users/mypolls');
  });
});
  
module.exports = router;