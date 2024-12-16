const EventEmitter = require('events');
const { createLogEntry } = require('../utils/logger');

class EventService extends EventEmitter {
  logInfo(step, message, data) {   
    this.emit('step', createLogEntry('info', step, message, data));
  }

  logError(step, message, error) {
    this.emit('step', createLogEntry('error', step, message, error));
  }
}

module.exports = new EventService();