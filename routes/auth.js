const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const async = require('async');
const crypto = require('crypto');
const emailService = require('../email');
const User = require('../models/user');
const JWTMiddleware = require('../middleware/passportJWT');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  const saltRounds = 10;

  try {
    var passwordHash = await bcrypt.hash(password, saltRounds);
    var user = new User({ email, passwordHash });
    await user.save();
    res.status(200).send({ email });

  } catch (error) {
    res.status(400).send({
      error: error,
    });
  }
});

router.post('/login',
  passport.authenticate('local', {session: false}),
  (req, res) => {

    /** This is what ends up in our JWT */
    try {
      var payload = {
        email: req.user.email,
      };
    } catch (error) {
      res.status(400).send({
        error: error,
      });
    }


      /** generate a signed json web token and return it in the response */
      const token = jwt.sign(payload,
        process.env.JWT_SECRET,
        {
          expiresIn: '1h',
          notBefore: 0
        }
      );

      /** assign our jwt to the cookie */
      return res.send({ token: token });
  }
);

router.post('/forgot', (req, res) => {
  async.waterfall([
    (done) => {
      crypto.randomBytes(20, (err, buf) => {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    (token, done) => {
      User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
          return res.status(400).send({
            'error': 'No account with that email address exists.'
          });
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save((err) => {
          done(err, token, user);
        });
      });
    },
    async (token, user, done) => {
      var html = '<body>' +
        'You are receiving this because you (or someone else) have requested the reset of the password for your account.<p>' +
        'Please click on the following link, or paste this into your browser to complete the process:<p>' +
        '<a href="http://' + req.headers.host + '/reset/' + token  + '">Reset</a><p>' +
        'If you did not request this, please ignore this email and your password will remain unchanged.</body>'

      await emailService.send(user.email, 'Password Reset Link', html, (err, info) => {
        if(err) {
          console.log('Unable to send email: ' + err);
        }
        done(err);
      });
    }
  ], (err) => {
    if (err) {
      console.log(err);
      res.status(500).send({
        'error': err
      });
    }
    res.status(200).send({
      'message': 'The Password Reset Email Has Been Sent.'
    });
  });
});

router.get('/protected', JWTMiddleware.JWTAuthentication, (req, res) => {
  res.status(200).send({
    user: req.payload
  });
});

module.exports = router;
