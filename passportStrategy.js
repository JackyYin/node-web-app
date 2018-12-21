module.exports = (passport) => {
  const LocalStrategy = require('passport-local').Strategy;
  const passportJWT = require('passport-jwt');
  const JWTStrategy = passportJWT.Strategy;
  const ExtractJwt = passportJWT.ExtractJwt;
  const bcrypt = require('bcrypt');

  const UserModel = require('./models/user');

  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const userDocument = await UserModel.findOne({email: email}).exec();
        const passwordsMatch = await bcrypt.compare(password, userDocument.passwordHash);

        if (passwordsMatch) {
          return done(null, userDocument);
        } else {
          return done('Incorrect Username / Password');
        }
      } catch (error) {
        done(error);
      }
    }
  ));

  passport.use(new JWTStrategy({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    (jwtPayload, done) => {
      if (jwtPayload.expires > Date.now()) {
        return done('jwt expired');
      }

      return done(null, jwtPayload);
    }
  ));
};
