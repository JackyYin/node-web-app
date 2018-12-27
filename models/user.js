const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    index: true,
    unique: true,
    dropDups: true,
    required: true,
  },
  passwordHash: { //salted and hashed using bcrypt
    type: String,
    required: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.passwordHash, (err, passwordMatch) => {
    if (err) return cb(err);
    cb(null, passwordMatch);
  });
};

const User = mongoose.model('User', userSchema);
module.exports = User;
