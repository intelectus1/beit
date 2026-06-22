require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const ssl = process.env.NODE_ENV === 'production'
  ? { rejectUnauthorized: false, checkServerIdentity: () => undefined }
  : false;

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
