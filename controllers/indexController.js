const { body, validationResult } = require("express-validator");
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.signupPost = [
    body("first_name")
    .trim()
    .isLength({min: 2})
    .escape()
    .withMessage("Must be atleast 2 characters")
    .isAlpha()
    .withMessage("Must be alphabet letters"),
    body("last_name")
    .optional({checkFalsy: true})
    .trim()
    .isLength({min: 2})
    .escape()
    .withMessage("Must be atleast 2 characters")
    .isAlpha()
    .withMessage("Must be alphabet letters"),
    body("username")
    .trim()
    .isLength({min: 6, max: 30})
    .escape()
    .withMessage("Username Must be between 6 and 30 characters")
    .isAlphanumeric()
    .withMessage("Must be alpha-numeric")
    .custom((value)=>{
      return User.findOne({username: new RegExp(`${value}`, 'i')}).then((user, err)=> {
        console.log('we in baby!')
        console.log(user)
        console.log(err)
        if (err) {
          return Promise.reject(err);
        }
        if (user) {
          return Promise.reject("Username is already taken.")
        }
      })
    }),
    body("password")
    .isLength({min: 6, max: 30}).escape()
    .withMessage("Password must be between 6 and 30 characters"),
    body("confirm_password")
    .custom((value, {req}) => (value === req.body.password))
    .withMessage("Passwords are not the same."),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('sign-up', {title: "Sign up", user: req.body ,errors: errors.array()})
        return;
      }
  
      bcrypt.hash(req.body.password, 10, (err, hashedPass) => {
  
        if (err) {
          return next(err);
        }
        console.log(req.body.last_name == true)
  
        const user = new User({
          first_name: req.body.first_name,
          username: req.body.username,
          password: hashedPass
        });

        if (req.body.last_name) {
            user.last_name = req.body.last_name;
        }
  
        user.save((err)=> {
          if (err) {
            return next(err);
          }
          req.login(user, function(err) {
            if (err) {
              return next(err)
            } 
              res.redirect('/');
            
          })
        })
  
  
      })
  
      
  
    }
  
  
  ]