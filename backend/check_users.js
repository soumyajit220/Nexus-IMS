const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-incident-db');
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const users = await User.find({});
        console.log('Users found:', users.map(u => ({ email: u.email, role: u.role, _id: u._id })));

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
