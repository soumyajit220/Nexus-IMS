const mongoose = require('mongoose');

const fixIds = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/smart-incident-db');
        const db = mongoose.connection.db;
        const users = await db.collection('users').find({ role: 'Agent' }).toArray();
        for (let u of users) {
            if (!u.agentId) {
                const newId = 'AGT-' + Math.floor(1000 + Math.random() * 9000);
                await db.collection('users').updateOne({ _id: u._id }, { $set: { agentId: newId } });
                console.log(`Updated ${u.name} with ${newId}`);
            }
        }
        console.log('Done');
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fixIds();
