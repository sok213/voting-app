const express = require('express'),
  router = express.Router(),
  User = require('../models/users'),
  Poll = require('../models/polls');
  
// When user directs to '/createpoll', render register.handlebars.
router.get('/createpoll', (req, res) => {
  res.render('createpoll');
});

router.post('/createpoll', (req, res) => {
  let topic = req.body.topic,
    options = req.body.options.split(',');
    
  req.checkBody('topic', 'Topic is required').notEmpty();
  req.checkBody('options', 'At least one option is required').notEmpty();
  
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
    });
    
    res.redirect('/');
  }
  
});

module.exports = router;