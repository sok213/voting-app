// Retrieve modules.
const mongoose = require('mongoose'),
  bcrypt     = require('bcryptjs');

// Define user Schema for mongoose model.
const UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true
  },
  password: {
    type: String
  },
  email: {
    type: String
  },
  name: {
    type: String
  },
  pollsVoted: {
    type: Array
  }
});

// Export the mongoose model for database usage.
const User = module.exports = mongoose.model('User', UserSchema);

/*
* Exported functions.
*--------------------
* 1) createUser - bcrypt the user password and save the password to the 
*  database.
*
* 2) getUserByUsername - return the found user that matches the query and run a 
*  callback function.
*
* 3) getUserById - return the found user that matches the query id parameter 
*  and run a callback funtion.
*
* 4) comparePassword - Checks to see if the provided password matches the 
*  hashed password, if matched, invoke the callback function, else, throw error.
*/

module.exports.createUser = (newUser, callback) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
        newUser.password = hash;
        newUser.save(callback);
    });
  });
};

module.exports.getUserByUsername = (username, callback) => {
  var query = { username: username };
  User.findOne(query, callback);
};

module.exports.getUserById = (id, callback) => {
  User.findById(id, callback);
};

module.exports.comparePassword = (candidatePassword, hash, callback) => {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if(err) throw error;
    callback(null, isMatch);
  });
};