const mongoose = require('mongoose');
url = "mongodb://20.3.128.131:27017/aes"

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