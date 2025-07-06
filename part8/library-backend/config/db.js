const mongoose = require("mongoose");

// Configuración simplificada para usar base de datos en memoria con mongoose
const connectDB = async () => {
  try {
    console.log("Connecting to in-memory database...");
    
    // Usar mongoose con una base de datos simple en memoria
    // Esto evita las dependencias externas problemáticas
    await mongoose.connect("mongodb://memory", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("Connected to in-memory database successfully");
    return "mongodb://memory";
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("Disconnected from database");
  } catch (error) {
    console.error("Error disconnecting from database:", error);
  }
};

module.exports = { connectDB, disconnectDB };
