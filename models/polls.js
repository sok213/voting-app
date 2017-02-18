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
  },
  voters: {
    type: Array
  },
  restricted: {
    type: Boolean
  }
});

const Poll = module.exports = mongoose.model('Poll', PollSchema);

module.exports.createPoll = (newPoll, callback) => {
  newPoll.save(callback);
};

module.exports.updatePoll = (updatedPoll, callback) => {
  updatePoll.save(callback);
};