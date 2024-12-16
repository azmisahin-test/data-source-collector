// Time-related utilities
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getCurrentTimestamp = () => new Date().toISOString();

module.exports = {
  delay,
  getCurrentTimestamp
};