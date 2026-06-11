import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

import { sequelize, connectMongo } from './config/db.js';
import { User, Employee } from './models/index.js';

import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import jobRoutes from './routes/jobs.js';
import adRoutes from './routes/ads.js';
import submissionRoutes from './routes/submissions.js';
import analyticsRoutes from './routes/analytics.js';
import exportRoutes from './routes/export.js';
import taskRoutes from './routes/tasks.js';
import logRoutes from './routes/logs.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Ensure mock inbox folder exists
const inboxDir = path.join(__dirname, 'inbox_mock');
if (!fs.existsSync(inboxDir)) {
  fs.mkdirSync(inboxDir, { recursive: true });
}

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL // Set this in Render env vars to your deployed frontend URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Static files routing (for served uploaded files)
app.use('/uploads', express.static(uploadDir));

// API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/logs', logRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'Smart Company Management System backend running', api: '/api/health' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Seed default admin account
const seedAdmin = async () => {
  try {
    const adminEmail = 'mushinzimananorbert3@gmail.com';
    
    // Clean up old admin if it exists
    await User.destroy({ where: { email: 'admin@company.com' } });
    await Employee.destroy({ where: { email: 'admin@company.com' } });

    const adminExists = await User.findOne({ where: { email: adminEmail } });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('norbert@123', salt);

    if (!adminExists) {
      const adminUser = await User.create({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });

      await Employee.create({
        fullName: 'System Administrator',
        email: adminEmail,
        position: 'IT Administrator',
        department: 'Operations',
        salary: 120000.00,
        phoneNumber: '+250785037571',
        address: 'Company Headquarters, Suite 100',
        status: 'active',
        employmentDate: new Date().toISOString().split('T')[0],
        userId: adminUser.id
      });

      console.log(`Seeder: Successfully seeded default Admin account: ${adminEmail}`);
    } else {
      // Update password of existing admin to match the user's requested password
      adminExists.password = hashedPassword;
      adminExists.role = 'admin';
      await adminExists.save();
      console.log(`Seeder: Admin user ${adminEmail} updated successfully.`);
    }
  } catch (error) {
    console.error('Seeder: Error seeding default admin:', error.message);
  }
};

// Start Server and Init Databases
const startServer = async () => {
  try {
    // 1. Connect MongoDB (Optional)
    await connectMongo();

    // 2. Connect SQL Database
    await sequelize.authenticate();
    console.log('Sequelize: Database connection established successfully.');

    // 3. Sync Models
    await sequelize.sync({ alter: true });
    console.log('Sequelize: Database models synced successfully.');

    // 4. Seed Admin
    await seedAdmin();

    // 5. Listen
    app.listen(PORT, () => {
      console.log(`Server: Running in active mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
};

startServer();
