const mongoose=require('mongoose');
mongoose.connect('mongodb+srv://amrsaeed820:34BN_3iHWagHcs@raaya-db.ajdopoy.mongodb.net/?appName=Raaya-DB').then(async () => {
    const Booking = require('./models/Booking');
    // fetch all bookings to see what's in there
    const bs = await Booking.find().sort({createdAt:-1}).limit(5);
    console.log(bs.map(b => ({id: b._id, time: b.time, date: b.date, shift: b.shift, status: b.status, patientId: b.patientId, nurseId: b.nurseId})));
    process.exit(0);
});
