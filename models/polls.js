const mongoose = require('mongoose');

const PollSchema = mongoose.Schema({
  topic: {
    type: String
  },
  options: {
    type: Array
  },
  creator: {
    type: String,
    index: true
  }
});

const Poll = module.exports = mongoose.model('Poll', PollSchema);

module.exports.createPoll = (newPoll, callback) => {
  newPoll.save(callback);
};