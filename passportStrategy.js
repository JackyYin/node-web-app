module.exports = (passport) => {
  const LocalStrategy = require('passport-local').Strategy;
  const passportJWT = require('passport-jwt');
  const JWTStrategy = passportJWT.Strategy;
  const ExtractJwt = passportJWT.ExtractJwt;
  const bcrypt = require('bcrypt');

  const User = require('./models/user');

  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      await User.findOne({ email: email }, (err, user) => {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'Incorrect email.' });

        user.comparePassword(password, (err, passwordMatch) => {
          if (passwordMatch) {
            return done(null, user);
          } else {
            console.log(err);
            return done(null, false, { message: 'Incorrect password.' });
          }
        });
      });
    }
  ));

  passport.use(new JWTStrategy({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    (jwtPayload, done) => {
      if (jwtPayload.exp < Date.now() / 1000) {
        return done('jwt expired');
      }

      return done(null, jwtPayload);
    }
  ));
};
