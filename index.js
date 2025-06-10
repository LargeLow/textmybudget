// Export the Express app for Vercel serverless deployment
const path = require('path');

// Set environment variable for Vercel detection
process.env.VERCEL = '1';

module.exports = require('../dist/index.js');