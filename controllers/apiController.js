const mongoose = require('mongoose');

module.exports = app => {
  app.get('/api/:pollId', (req, res) => {
    Poll.find({_id: req.params.pollId}, (err, result) => {
      if(err) throw err;
      res.send(result);
    });
  });
};