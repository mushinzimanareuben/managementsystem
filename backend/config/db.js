import { Sequelize } from 'sequelize';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbType = process.env.DB_TYPE || 'sqlite';
let sequelize;

if (dbType === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false, // Set to console.log to see SQL queries
  });
  console.log('Database Config: Initialized Sequelize with SQLite.');
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'company_management',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
    }
  );
  console.log(`Database Config: Initialized Sequelize with MySQL at ${process.env.DB_HOST}.`);
}

let isMongoConnected = false;
const mongoUri = process.env.MONGODB_URI;

const connectMongo = async () => {
  if (!mongoUri) {
    console.log('Database Config: MONGODB_URI not provided. Submissions will fall back to SQLite storage.');
    return false;
  }
  try {
    await mongoose.connect(mongoUri);
    isMongoConnected = true;
    console.log('Database Config: Successfully connected to MongoDB.');
    return true;
  } catch (error) {
    console.error('Database Config: MongoDB connection error. Falling back to SQLite storage.', error.message);
    return false;
  }
};

export { sequelize, connectMongo, isMongoConnected };
