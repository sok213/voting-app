// Retrieve Modules.
const express = require('express'),
  router      = express.Router(),
  Poll        = require('../models/polls');
  
// Function that checks if user logged in correctly, if so, invoke next(), 
// else, redirect user to stay on the login.handlebars page.
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/users/login');
  }
} 

function ensureNotAuth(req, res, next) {
  if(req.isAuthenticated()) {
    res.redirect('/');
  } else {
    return next();
  }
}
  
// If user trys to redirect to specific directories, invoke function
// ensureAuthenticated,  if ensureAuthenticated invokes the next() method,
// render dashboard.handlebars.
router.get('/', ensureAuthenticated, (req, res) => {
  res.render('dashboard');
});

router.get('/users/login', ensureNotAuth, (req, res) => {
  let findRecent10 = Poll.find({}).sort('-date').limit(10);
  findRecent10.exec((err, polls) => {
    console.log(polls)
    res.render('login', {
      recentPolls: polls
    });
  });
});



// Export the router methods.
module.exports = router;