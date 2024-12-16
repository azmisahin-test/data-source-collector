const eventService = require('./EventService');
const { delay } = require('../utils/time');
const axios = require('axios');

class DataCollectionService {
  async fetchRSS(url, { rateLimit, timeout }) {
    try {
      if (rateLimit > 0) {
        await delay(1000 / rateLimit);
      }

      const response = await axios.get(url, {
        timeout: timeout * 1000
      });

      eventService.logInfo('fetchRSS', `RSS data fetched from ${url}`);
      return response.data;
    } catch (error) {
      eventService.logError('fetchRSS', `Error fetching RSS data from ${url}`, error);
      return null;
    }
  }
}

module.exports = new DataCollectionService();