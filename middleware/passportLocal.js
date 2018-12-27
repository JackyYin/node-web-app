  const passport = require('passport');

  var LocalAuthentication = (req, res, next) => {
    passport.authenticate('local', {session: false}, (err, user, info) => {
      if (err || !user) {
          res.status(401).send({
            error: info.message
          });
      }

      console.log(user);
      req.user = user;
      next();
    })(req, res, next);
  };

module.exports.LocalAuthentication = LocalAuthentication;
