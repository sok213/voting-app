const mongoose = require('mongoose');

module.exports = app => {
  app.post('/users/createpoll', function(req, res) {
    console.log("Topic: ", req.body.topic);
    console.log("Options: ", req.body.options);
  });
};