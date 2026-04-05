const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const fixDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-incident-db');
        console.log('Connected to DB');
        
        await mongoose.connection.collection('users').dropIndex('agentId_1').catch(e => console.log('Index not found or already dropped'));
        console.log('Successfully dropped restrictive index!');
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit();
    }
}
fixDb();
