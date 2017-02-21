// Retrieve modules.
const express   = require('express'),
  router        = express.Router(),
  passport      = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  User          = require('../models/users');

// When user directs to '/register', render refister.handlebars.
router.get('/register', (req, res) => {
  res.render('register');
});

// When user directs to '/login', render login.handlebars.
router.get('/login', (req, res) => {
  res.render('login');
});

// Function to check to see if a user is signed in before directing.
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/users/login');
  }
}

// Users can only direct to '/createpoll' if user is authenticated.
router.get('/createpoll', ensureAuthenticated, (req, res) => {
  res.render('createpoll');
});

// When a post request gets posted to '/register' via the form from 
// register.handlebars, invoke the callback function.
router.post('/register', (req, res) => {
  // Getting values from form and store in variables.
  let name    = req.body.name,
    email     = req.body.email,
    username  = req.body.username,
    password  = req.body.password,
    password2 = req.body.password2;
    
  // Checks if form was properly filled out (validation).
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match')
    .equals(req.body.password);
  
  // If form was incorrectly filled out, store the errors in 
  // variable errors.
  let errors = req.validationErrors();
  
  // If errors conists of any errors, render register.handlebars passing in
  // the values from errors as a global variable. Else, create a new user
  // using the form values passed in by the user. 
  if(errors) {
    res.render('register', {
      errors: errors
    });
    return;
  }
  
  // Creates a new user using the mongoose User schema defined in 
  // './models/users.js'.
  let newUser = new User({
    name: name,
    email: email,
    username: username,
    password: password
  });
  
  // Invokes createUser method from './models/users.js' which saves
  // the newly created user to the mLab database.
  User.createUser(newUser, (err, user) => {
    if(err) throw err;
    console.log("New user registered!");
  });
  
  // After new user is created and saved to database, show a success 
  // message via flash() method.
  req.flash('success_msg', 'You are registered and can now login.');
  // redirect to login.handlebars.
  res.redirect('/users/login');
});

// Configure the Passport LocalStrategy for username/password authentication.
passport.use(new LocalStrategy(
  (username, password, done) => {
    
    // Invoke getUserByUsername function from './models/users.js'.
    User.getUserByUsername(username, (err, user) => {
      //If user not found, return done() method with message of 'Unknown User'.
      if(err) throw err;
      if(!user) {
        return done(null, false, {message: 'Unknown user'});
      }
      
      // If user found, run comparePassword() function 
      // from './models/users.js'.
      User.comparePassword(password, user.password, (err, isMatch) => {
        if(err) throw err;
        
        // If provided password matches the hashed password, retrun done() with
        // user passes in as parameter. Else, return done() with 
        // 'Invalid password'.
        if(isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {message: 'Invalid password'});
        }
      });
    });
  }
));

// Serialize and deserialize user instances to and from the Passport session.
// A session will be established and maintained via a cookie set in the 
// user's browser.
passport.serializeUser((user, done) => {
  // The user ID is serialized to the session.
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.getUserById(id, (err, user) => {
    done(err, user);
  });
});

// When a the form values are posted form '/login' page, if values are 
// valid, redirect user to '/', else stay on '/users/login' page.
router.post('/login', passport.authenticate('local', 
  {successRedirect: '/', failureRedirect: '/users/login', failureFlash: true}), 
  (req, res) => {
    res.redirect('/');
});

// When a user redirects to '/logout' page, invoke the logout() method, then
// flash 'You are logged out' to the view, then redirect user back to
// 'users/login' page.
router.get('/logout', ensureAuthenticated, (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

// Export all the router methods.
module.exports = router;