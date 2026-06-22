require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const ssl = process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, ssl });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
