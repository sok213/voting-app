const express = require('express'),
  mongoose    = require('mongoose'),
  app         = express();
  router      = express.Router(),
  User        = require('../models/users'),
  Poll        = require('../models/polls');
  
// Find poll id via passed in req.parameter.id and send the JSON data as a 
// response.
router.get('/poll/:id', (req, res) => {
  Poll.find({_id: req.params.id }, (err, result) => {
    if(err) throw err;
    app.use((req, res, next) => {
      res.locals.poll = result[0];
    });
    
    res.locals.poll = result[0];
    
    res.render('viewPoll', {
      pollID: req.params.id
    });
  });
});

router.post('/poll/:id', (req, res) => {
  if(req.user) {
    
    //res.render('viewPoll');
  } else {
    console.log('User is not logged in.');
  }
  
  Poll.findByIdAndUpdate({_id: req.params.id},
    { $push: { votes: req.body.vote } }, { new: true }, (err, poll) => {
    if(err) throw err;
    //poll[0].votes.push(req.body.vote);
    console.log(poll);
  });
});
  
// When user directs to '/createpoll', render register.handlebars.
router.get('/createpoll', (req, res) => {
  res.render('createpoll');
});

router.post('/createpoll', (req, res) => {
  let topic = req.body.topic,
    options = req.body.options.split(',').map(function(option) {
      return {
        "option": option,
        "votes": 0
      };
    });
    
  req.checkBody('topic', 'Topic is required').notEmpty();
  req.checkBody('options', 'Must include options').notEmpty();
  
  let errors = req.validationErrors();
  
  if(errors) {
    res.render('createpoll', {
      errors: errors
    });
  } else {
    let newPoll = new Poll({
      topic,
      options,
      creator: res.locals.user.username
    });
    
    Poll.createPoll(newPoll, (err, poll) => {
      if(err) throw err;
      console.log(`New poll: ${ newPoll.topic } has been created!`);
      
      // When user creates a new poll, redirect to poll address.
      res.redirect('poll/' + poll._id);
    });
    
  }
  
});

module.exports = router;