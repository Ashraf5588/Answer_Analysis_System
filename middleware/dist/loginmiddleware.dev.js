"use strict";

var jwt = require("jsonwebtoken");

var authenticateToken = function authenticateToken(req, res, next) {
  var token = req.cookies.token;
  console.log(token);

  if (!token) {
    console.log("No token found in cookies");
    res.redirect('/admin/login');
  }

  ;

  try {
    var verified = jwt.verify(token, "mynameisashraf!23_9&"); // Add user details to the request object

    console.log("Token verified successfully:", verified); // Log the verified token

    next();
  } catch (error) {
    console.log("Token verification failed:", error.message); // Log the error message

    res.redirect('/admin/login');
  }
};

module.exports = {
  authenticateToken: authenticateToken
};