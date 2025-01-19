const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  console.log(token);

  if (!token) {
    console.log("No token found in cookies");
    return res.redirect('/admin/login'); // Redirect to login if no token found
  }

  try {
    const verified = jwt.verify(token, "mynameisashraf!23_9&");
    console.log("Token verified successfully:", verified); // Log the verified token

    // Attach user details to request object for access in route handlers
    req.user = verified;

    // Check for the user’s role and current path
    

    // If the user is trying to access their designated page or any allowed page, proceed
    next();

  } catch (error) {
    console.log("Token verification failed:", error.message); // Log the error message
    res.redirect('/admin/login'); // Redirect to login if token verification fails
  }
};

module.exports = { authenticateToken };
