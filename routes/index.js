// Retrieve Modules.
const express = require('express'),
  router      = express.Router();
  
// Function that checks if user logged in correctly, if so, invoke next(), 
// else, redirect user to stay on the login.handlebars page.
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/users/login');
  }
}  
  
// If user trys to redirect to specific directories, invoke function
// ensureAuthenticated,  if ensureAuthenticated invokes the next() method,
// render dashboard.handlebars.
router.get('/', ensureAuthenticated, (req, res) => {
  res.render('dashboard');
});


// Export the router methods.
module.exports = router;