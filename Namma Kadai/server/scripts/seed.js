const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Customer = require('../models/Customer');
const ServiceRecord = require('../models/ServiceRecord');
const Notification = require('../models/Notification');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Customer.deleteMany({});
    await ServiceRecord.deleteMany({});
    await Notification.deleteMany({});

    console.log('Existing data cleared');

    // Create users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@ro-service.com',
        password: 'admin123',
        role: 'admin',
        phone: '+919876543210'
      },
      {
        name: 'Suresh Kumar',
        email: 'suresh@ro-service.com',
        password: 'tech123',
        role: 'technician',
        phone: '+919876543211'
      }
    ]);

    console.log(`Created ${users.length} users`);

    // Create customers
    const customers = await Customer.create([
      {
        name: 'Ravi Kumar',
        phone: '+919876543210',
        email: 'ravi@example.com',
        address: '12 MG Road, Bangalore, Karnataka 560001',
        model: 'PureRO X20',
        installedOn: new Date('2024-11-01'),
        notes: 'Keep membrane in stock',
        images: []
      },
      {
        name: 'Anita Sharma',
        phone: '+919812345678',
        email: 'anita@example.com',
        address: '45 Park Street, Kolkata, West Bengal 700016',
        model: 'AquaSafe Z5',
        installedOn: new Date('2023-05-10'),
        notes: 'Customer prefers morning appointments',
        images: []
      },
      {
        name: 'Rajesh Patel',
        phone: '+919898989898',
        email: 'rajesh@example.com',
        address: '78 Ring Road, Ahmedabad, Gujarat 380015',
        model: 'HydroClean Pro',
        installedOn: new Date('2024-01-15'),
        notes: 'Check TDS levels regularly',
        images: []
      },
      {
        name: 'Priya Menon',
        phone: '+919123456789',
        email: 'priya@example.com',
        address: '23 Beach Road, Chennai, Tamil Nadu 600001',
        model: 'PureRO X20',
        installedOn: new Date('2024-06-20'),
        notes: 'High water hardness area',
        images: []
      },
      {
        name: 'Amit Singh',
        phone: '+919999888877',
        email: 'amit@example.com',
        address: '56 Civil Lines, Delhi 110054',
        model: 'AquaSafe Z5',
        installedOn: new Date('2023-12-01'),
        notes: 'Commercial installation',
        images: []
      }
    ]);

    console.log(`Created ${customers.length} customers`);

    // Create service records
    const today = new Date();
    const serviceRecords = [];

    // Service due in 2 days (should trigger notification)
    serviceRecords.push({
      customerId: customers[0]._id,
      serviceDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
      technician: 'Suresh Kumar',
      partsReplaced: ['sediment-filter', 'carbon-filter'],
      priorityParts: [
        { part: 'membrane', care: 'Check for scaling, replace if TDS > 50' }
      ],
      nextServiceDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
      notes: 'Water quality improved after service',
      notified: false
    });

    // Service due in 3 days (should trigger notification)
    serviceRecords.push({
      customerId: customers[1]._id,
      serviceDate: new Date(today.getTime() - 85 * 24 * 60 * 60 * 1000),
      technician: 'Suresh Kumar',
      partsReplaced: ['carbon-filter'],
      priorityParts: [
        { part: 'pre-filter', care: 'Check fittings for leaks' }
      ],
      nextServiceDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
      notes: 'Customer reported slow flow',
      notified: false
    });

    // Service due in 7 days
    serviceRecords.push({
      customerId: customers[2]._id,
      serviceDate: new Date(today.getTime() - 83 * 24 * 60 * 60 * 1000),
      technician: 'Suresh Kumar',
      partsReplaced: ['sediment-filter', 'membrane'],
      priorityParts: [
        { part: 'UV lamp', care: 'Check UV lamp hours' }
      ],
      nextServiceDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Membrane replaced due to high TDS',
      notified: false
    });

    // Service due in 15 days
    serviceRecords.push({
      customerId: customers[3]._id,
      serviceDate: new Date(today.getTime() - 75 * 24 * 60 * 60 * 1000),
      technician: 'Suresh Kumar',
      partsReplaced: ['sediment-filter'],
      priorityParts: [],
      nextServiceDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000),
      notes: 'Routine maintenance',
      notified: false
    });

    // Past service (already completed)
    serviceRecords.push({
      customerId: customers[4]._id,
      serviceDate: new Date(today.getTime() - 120 * 24 * 60 * 60 * 1000),
      technician: 'Suresh Kumar',
      partsReplaced: ['carbon-filter', 'post-carbon'],
      priorityParts: [
        { part: 'membrane', care: 'Monitor TDS levels' }
      ],
      nextServiceDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      notes: 'Service overdue - customer needs to be contacted',
      notified: true,
      notifiedAt: new Date(today.getTime() - 33 * 24 * 60 * 60 * 1000)
    });

    const createdRecords = await ServiceRecord.create(serviceRecords);
    console.log(`Created ${createdRecords.length} service records`);

    // Create sample notification
    await Notification.create({
      serviceRecordId: createdRecords[4]._id,
      customerId: customers[4]._id,
      channel: 'both',
      to: '+919876543210 / tech@ro-service.com',
      message: 'Service reminder for Amit Singh - AquaSafe Z5',
      status: 'sent',
      sentAt: new Date(today.getTime() - 33 * 24 * 60 * 60 * 1000)
    });

    console.log('Sample notification created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@ro-service.com / admin123');
    console.log('Technician: suresh@ro-service.com / tech123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
