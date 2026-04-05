const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const AuditLog = require('./models/AuditLog');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-incident-db');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    await connectDB();

    try {
        await AuditLog.deleteMany();
        await Ticket.deleteMany();
        await User.deleteMany();

        console.log('Cleared existing data...');

        // 1. Create Users
        const users = [
            {
                name: 'System Admin',
                email: 'admin@example.com',
                password: 'password123',
                role: 'Admin',
                department: 'IT Operations',
                jobTitle: 'IT Director',
                status: 'Active'
            },
            {
                name: 'Support Agent L1',
                email: 'agent1@example.com',
                password: 'password123',
                role: 'Agent',
                department: 'Help Desk',
                jobTitle: 'L1 Support',
                status: 'Active'
            },
            {
                name: 'Senior Support Agent',
                email: 'agent2@example.com',
                password: 'password123',
                role: 'Agent',
                department: 'T2 Infrastructure',
                jobTitle: 'Senior SysAdmin',
                status: 'Active'
            },
            {
                name: 'Alice Employee',
                email: 'alice@example.com',
                password: 'password123',
                role: 'User',
                department: 'HR',
                jobTitle: 'HR Specialist',
                status: 'Active'
            },
            {
                name: 'Bob Manager',
                email: 'bob@example.com',
                password: 'password123',
                role: 'User',
                department: 'Finance',
                jobTitle: 'Finance Manager',
                status: 'Active'
            }
        ];

        const createdUsers = [];
        for (const user of users) {
            createdUsers.push(await User.create(user));
        }

        const admin = createdUsers[0];
        const agent1 = createdUsers[1];
        const agent2 = createdUsers[2];
        const user1 = createdUsers[3];
        const user2 = createdUsers[4];

        console.log(`Created ${createdUsers.length} users`);

        // 2. Create Tickets
        const tickets = [
            {
                title: 'Email Server Connectivity Issue',
                description: 'Unable to connect to Outlook exchange server since morning.',
                status: 'Open',
                priority: 'High',
                impact: 'High',
                urgency: 'High',
                category: 'Network',
                createdBy: user1._id,
                slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
                slaStatus: 'On Track',
                department: 'HR'
            },
            {
                title: 'Laptop Screen Flickering',
                description: 'My laptop screen is flickering constantly.',
                status: 'In Progress',
                priority: 'Medium',
                impact: 'Medium',
                urgency: 'Medium',
                category: 'Hardware',
                createdBy: user2._id,
                assignedTo: agent1._id,
                slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                slaStatus: 'On Track',
                department: 'Finance'
            },
            {
                title: 'VPN Access Denied',
                description: 'Cannot login to VPN from home network.',
                status: 'Resolved',
                priority: 'High',
                impact: 'Medium',
                urgency: 'High',
                category: 'Access',
                createdBy: user2._id,
                assignedTo: agent2._id,
                slaDeadline: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                slaStatus: 'On Track',
                rootCauseCategory: 'Configuration Error',
                resolutionDetails: 'Reset VPN profile configuration for the user.',
                department: 'Finance'
            },
            {
                title: 'Data Export Failure',
                description: 'Export to CSV is crashing the application.',
                status: 'Closed',
                priority: 'Critical',
                impact: 'Critical',
                urgency: 'High',
                category: 'Software',
                createdBy: user1._id,
                assignedTo: agent2._id,
                slaDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
                slaStatus: 'Breached',
                slaBreachTime: new Date(Date.now() - 20 * 60 * 60 * 1000),
                rootCauseCategory: 'Software Bug',
                resolutionDetails: 'Patched the export module.',
                department: 'HR'
            }
        ];

        for (const ticket of tickets) {
            await Ticket.create(ticket);
        }

        console.log(`Created ${tickets.length} tickets`);
        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    await connectDB();

    try {
        await AuditLog.deleteMany();
        await Ticket.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
