// Centralized logging utility
const createLogEntry = (type, step, message, data) => ({
  timestamp: new Date().toISOString(),
  type,
  step,
  message,
  data
});

module.exports = {
  createLogEntry
};