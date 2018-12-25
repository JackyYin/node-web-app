  const passport = require('passport');

  var JWTAuthentication = (req, res, next) => {
    passport.authenticate('jwt', {session: false}, (err, payload, info) => {
      if (err || !payload) {
          res.status(401).send({
            error: info.message
          });
      }

      console.log(payload);
      req.payload = payload;
      next();
    })(req, res, next);
  };

module.exports.JWTAuthentication = JWTAuthentication;
