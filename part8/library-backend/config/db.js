const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongod;

const connectDB = async () => {
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    await mongoose.connect(uri);
    console.log("Connected to MongoDB in memory");

    return uri;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
  }
};

module.exports = { connectDB, disconnectDB };
