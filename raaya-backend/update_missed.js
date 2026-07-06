require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        try {
            const res = await mongoose.connection.db.collection('bookings').updateMany(
                { status: 'no-show' },
                { $set: { status: 'missed' } }
            );
            console.log('Updated records:', res.modifiedCount);
        } catch (error) {
            console.error(error);
        } finally {
            process.exit(0);
        }
    })
    .catch(console.error);
