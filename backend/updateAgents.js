const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const updateAgents = async () => {
    await connectDB();

    try {
        const agents = await User.find({ role: 'Agent' });
        
        for (let agent of agents) {
            if (!agent.agentId) {
                const randomNum = Math.floor(1000 + Math.random() * 9000);
                agent.agentId = `AGT-${randomNum}`;
                await agent.save();
                console.log(`Updated agent ${agent.email} with ID ${agent.agentId}`);
            }
        }
        
        console.log('Agent migration completed!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

updateAgents();
