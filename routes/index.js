var express = require('express');
var router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require('../models/user');
const Message = require('../models/message');
const bcrypt = require('bcryptjs');
const indexController = require('../controllers/indexController');
const passport = require("passport");
const async = require('async');
require('dotenv').config();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/messages');
});

router.get('/messages', (req, res, next) => {
  Message.find().populate('author').exec((err, messages) => {
    if (err) {
      return next(err);
    }

    if (messages == false) {
      messages = [];
    }
    console.log(messages[1])
    res.render('messages', {messages: messages, title: "Main Page", user: req.user});
  })
})

router.get('/sign-up', (req, res, next)=> {
  res.render('sign-up', {title: "Sign up", user: req.user, errors: null});
})

router.get('/member-join', (req, res, next) => {
  res.render('joinclub', {title: "Become a member", user: req.user})
})

router.get('/login', (req, res, next) => {
  res.render('login', {title: "Log in", user: req.user})
})

router.post('/sign-up', indexController.signupPost);

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
  })
);

router.get('/logout',
(req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
  
});

router.post('/member-join', [
  body("passcode")
  .escape(),
  (req, res, next) => {
    if (req.body.passcode === process.env.MEMBER_CODE) {
      console.log(req.user)
      User.findByIdAndUpdate(req.user._id, 
        {user_level: "Member"}, {}, (err, user) => {
          res.redirect('/member-join')
        })
    } else {
      res.redirect('/logout')
    }
  }
]);


router.post('/admin-join', [
  body("passcode")
  .escape(),
  (req, res, next) => {
    if (req.body.passcode === process.env.ADMIN_CODE) {
      console.log(req.user)
      User.findByIdAndUpdate(req.user._id, 
        {user_level: "Admin"}, {}, (err, user) => {
          res.redirect('/messages')
        })
    } else {
      res.redirect('/member-join')
    }
  }
]);

router.post('/delete-message', (req, res, next) => {
  User.findById(req.user._id).exec((err, user) => {
    if (err) {
      return next(err);
    }
    if (user.user_level !== "Admin") {
      res.redirect('/member-join');
    } else {
      Message.findByIdAndDelete(req.body.messageid).exec((err, result) => {
        if (err) {
          return next(err);
        }
        res.redirect('/messages')
      })
    }
  })

})

router.get('/create-message', (req, res, next) => {
  res.render('create-message', {user: req.user, message: null, title: "Create message", errors: null})
});

router.post('/create-message', [
  body("title")
  .unescape()
  .trim()
  .isLength({min: 3, max:100})
  .withMessage("Title must be between 3 and 100 characters"),
  body("message")
  .unescape()
  .trim()
  .isLength({min: 3})
  .withMessage("Message must be atleast 3 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('create-message', {errors: errors.array(), message: {title: req.body.title, msg: req.body.message}, 
    user: req.user, title: "Create message"})
    return;
    }

    const message = new Message({
      author: req.user._id, 
      title: req.body.title,
      message: req.body.message
    });

    message.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    })




  }
  
])
module.exports = router;
