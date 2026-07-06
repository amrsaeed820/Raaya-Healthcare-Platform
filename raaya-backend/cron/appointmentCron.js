const cron = require('node-cron');
const Booking = require('../models/Booking');

// Run every hour
cron.schedule('0 * * * *', async () => {
    try {
        console.log('Running Stale Appointments Check Cron Job...');
        
        // Find bookings that are 'upcoming', 'confirmed', or 'in-progress'
        const bookings = await Booking.find({
            status: { $in: ['upcoming', 'confirmed', 'in-progress'] }
        });

        let updatedCount = 0;
        
        for (const booking of bookings) {
            if (!booking.date || !booking.time) continue;
            
            const dateStr = booking.date; // e.g. "2024-05-15"
            const timeStr = booking.time; // e.g. "10:00 AM"

            try {
                // Parse Date
                let year, month, day;
                if (dateStr.includes('-')) {
                    [year, month, day] = dateStr.split('-');
                } else {
                    // Just in case it's another format, fallback to standard date parsing
                    const d = new Date(dateStr);
                    year = d.getFullYear();
                    month = d.getMonth() + 1;
                    day = d.getDate();
                }

                // Parse Time
                let hours = 0;
                let minutes = 0;
                if (timeStr && timeStr.includes(':')) {
                    const timeParts = timeStr.split(' ');
                    const [h, m] = timeParts[0].split(':');
                    hours = parseInt(h, 10);
                    minutes = parseInt(m, 10) || 0;
                    const modifier = timeParts[1] ? timeParts[1].toUpperCase() : '';
                    
                    if (hours === 12 && modifier === 'AM') hours = 0;
                    if (hours !== 12 && modifier === 'PM') hours += 12;
                }

                const appointmentDate = new Date(year, month - 1, day, hours, minutes);
                const now = new Date();
                
                // Check if appointment is older than 3 hours
                const diffInMs = now - appointmentDate;
                const diffInHours = diffInMs / (1000 * 60 * 60);

                if (diffInHours >= 3) {
                    booking.status = booking.status === 'in-progress' ? 'expired' : 'missed';
                    await booking.save();
                    updatedCount++;
                }
            } catch (err) {
                console.error(`Failed to parse date/time for booking ${booking._id}:`, err);
            }
        }

        if (updatedCount > 0) {
            console.log(`Updated ${updatedCount} stale appointments.`);
        }
    } catch (error) {
        console.error('Error in Stale Appointments Cron Job:', error);
    }
});

console.log('✅ Stale Appointments Cron Job Scheduled');
