const mongoose = require('mongoose');
const { config } = require('../config/secrets');

main().catch(err => console.log(err));

async function main() {
  mongoose.set('strictQuery', false);
  // for Windows 11
  await mongoose.connect(config.db_url);
  console.log("mongo connect design1 ");
}