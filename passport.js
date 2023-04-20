const passport = require("passport");
const User = require("./models/userModel");
const jwt = require("jsonwebtoken");

require("dotenv").config({ path: "./.env" });
const GoogleStrategy = require("passport-google-oauth20").Strategy;
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ google_ID: profile.id }).then((currentUser) => {
        if (currentUser) {
          const user = { id: currentUser.id }; // create a user object for JWT token
          const secretKey = process.env.JWT_SECRET; // set your own secret key
          const token = jwt.sign(user, secretKey); // generate JWT token
          done(null, [token, currentUser.id]);
          //   done(null, currentUser);
        } else {
          new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            google_ID: profile.id,
          })
            .save()
            .then((newUser) => {
              console.log("new user created: ", newUser);
              const user = { id: newUser.id }; // create a user object for JWT token
              const secretKey = process.env.JWT_SECRET; // set your own secret key
              const token = jwt.sign(user, secretKey); // generate JWT token
              console.log(token);
              done(null, token);
              //   done(null, newUser);
            });
        }
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
  //   Here in mongodb save user in userModel
  // const user={
  // username:profile.displayName,
  // avataar: profile.photos[0]
  // }
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
