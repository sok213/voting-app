const express = require('express'),
  mongoose    = require('mongoose'),
  app         = express();
  router      = express.Router(),
  User        = require('../models/users'),
  Poll        = require('../models/polls');

let voteStatus,
  errorMsg,
  pollTopic,
  creatorId;
  
// NOTE: Poll.findByIdAndUpdate methods in this file need major refactoring.
// Consists of many DRY code.
  
// Find poll id via passed in req.parameter.id and send the JSON data as a 
// response.
router.get('/poll/:id', (req, res) => {
  console.log(req.params.id);
  Poll.find({_id: req.params.id }, (err, result) => {
    if(err || !result[0]){
      res.render('pollNotFound', {
        pollId: req.params.id
      });
    } else {
      console.log(!result[0]);
      User.find({username: result[0].creator}, (err, userResult) => {
        creatorId = userResult[0]._id;
        app.use((req, res, next) => {
          res.locals.poll = result[0];
        });
        pollTopic = result[0].topic;
        res.locals.poll = result[0];
        res.render('viewPoll', {
          pollID: req.params.id,
          creatorId
        });
      });
      
      // If user is signed in.
      if(res.locals.user) {
        let userName = res.locals.user.username;
        // Checks if user already voted on poll.
        Poll.findById({_id: req.params.id}, (err, res) => {
            if(err) throw err;
            voteStatus = false;
            res.voters.filter( obj => {
              if(obj.user == userName) { voteStatus = true; }
            });
            console.log("Vote Status: ", voteStatus);
        });
      }
    }
  });
});

// When user casts a vote on a poll.
router.post('/poll/:id', (req, res) => {
  // If user is signed in, allow user to cast a vote.
  if(req.user) {
    console.log(req.user);
    // Store and initial necessary variables.
    let userVote       = req.body.vote,
      userName         = res.locals.user.username,
      additionalOption = req.body.addOption,
      userId           = req.user._id;
          
    // Checks if user clicked an option or provided an input. If neither or
    // both, store the appropriate error message.
    if(!userVote && !additionalOption) {
      errorMsg = 'Choose an option or provide an additional one.';
    } else if(!userVote === false && !additionalOption === false) {
      errorMsg = 'Users are not allowed to vote for an option ' + 
      'and add an additional one. Please, pick one method.';
    } else if(voteStatus == true) {
      errorMsg = 'You have already voted on this poll.';
    } else {
      errorMsg = undefined;
    }

    // If user already voted on the poll stay re-render poll page and send
    // back error message. Else, allow user to vote or add additional option.
    if(voteStatus === true) {
      req.flash('error_msg', errorMsg);
      res.redirect(req.params.id);
    } else if(!errorMsg) {
      // If additionalOption exists, add the new option and make it count as a
      // vote. Else, count the chosen radio button value.
      if(additionalOption) {
        // Find poll by ID and push in object with voter username and the 
        // option that they voted for.  
        Poll.findByIdAndUpdate({_id: req.params.id}, 
          { $push: { voters: { 
              user: userName, 
              option: additionalOption,
              userId
           }}},
          { safe: true, upsert: true, new : true },
          (err, res) => {
            if(err) throw err;
            console.log('Poll updated.');
        });
        
        // Find poll by ID and push in new object with new additional option 
        // and vote count set to 1.
        Poll.findByIdAndUpdate({_id: req.params.id}, 
          { $push: { options: { option: additionalOption, votes: 1, userId}}},
          { safe: true, upsert: true, new : true },
          (err, res) => { if(err) throw err; }
        );
        
        // Add poll topic and poll id to user database.
        User.findByIdAndUpdate({_id: res.locals.user._id},
          { $push: { pollsVoted: 
            { 
              pollTopic: pollTopic, 
              pollID: req.params.id,
              votedFor:  additionalOption
            }
          }},
          (err, res) => { if(err) throw err;}
        );
        
        req.flash('success_msg', 'You have voted on this poll!');
        res.redirect(req.params.id);
          
      } else if(userVote && !errorMsg){
        // Find poll by ID and push in object with voter username and the 
        // option that they voted for.  
        Poll.findByIdAndUpdate({_id: req.params.id}, 
          { $push: { voters: { user: userName, option: userVote, userId}}},
          { safe: true, upsert: true, new : true },
          (err, res) => {
            if(err) throw err;
            console.log('Poll updated.');
        });
        
        // Add poll topic and poll id to user database.
        User.findByIdAndUpdate({_id: res.locals.user._id},
          { $push: { pollsVoted: 
            { 
              pollTopic: pollTopic, 
              pollID: req.params.id,
              votedFor: userVote
            }
          }},
          (err, res) => { if(err) throw err;}
        );
        
        // Retrieve poll by option name and increment the vote key value pair 
        // by one.
        Poll.update({'options.option': userVote}, 
          {$inc: {'options.$.votes': 1}}, (err, res) => {
            if(err) throw err;
            console.log('Votes incremented.');
          }
        );
        req.flash('success_msg', 'You have voted on this poll!');
        res.redirect(req.params.id);
      }
    } else {
      // If invalid form is submitted.
      req.flash('error_msg', errorMsg);
      res.redirect(req.params.id);
    }
    
  } else {
    console.log('User is not logged in.');
    req.flash('error_msg', 'Must sign in or register to vote.');
    res.redirect(req.params.id);
  }
});
  
// When user directs to '/createpoll', render register.handlebars.
router.get('/createpoll', (req, res) => {
  res.render('createpoll');
});

// When user creates a new poll.
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
      creator: res.locals.user.username,
      restricted: req.body.restricted,
      date: new Date()
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