const express = require('express');
const bcrypt = require('bcrypt');
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

module.exports = router;
