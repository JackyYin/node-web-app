const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const saltRounds = 10;

  try {
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const userDocument = new UserModel({ email, passwordHash });
    await userDocument.save();
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

router.get('/protected',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    const { user } = req;

    res.status(200).send({ user });
  }
);

module.exports = router;
