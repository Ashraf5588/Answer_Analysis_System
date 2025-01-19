const mongoose = require('mongoose');
url = "mongodb://4.240.115.66:27017/aes"

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(url);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
module.exports = connectDB;