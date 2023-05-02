const mongoose = require('mongoose');
const { config } = require('../config/secrets');

main().catch(err => console.log(err));

async function main() {
  // כדי למנוע הצגת אזהרה
  mongoose.set('strictQuery', false);
  // וזה לווינדוס 11
  await mongoose.connect(config.db_url);
  // await mongoose.connect('mongodb://127.0.0.1:27017/design1');
  // await mongoose.connect('mongodb://127.0.0.1:27017/atid22');
 // await mongoose.connect('mongodb+srv://moshe:1234@cluster0.ccae1es.mongodb.net/atid22');
  console.log("mongo connect design1 ");
  // console.log("mongo connect atid22 ");

  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}