// src/services/StorageService.js
const fs = require('fs');
const path = require('path');
const { getCurrentTimestamp } = require('../utils/time');
const eventService = require('./EventService');

const storageFilePath = path.join(__dirname, '../../data.json');

class StorageService {
  constructor() {
    this.data = [];
    this.loadDataFromFile();
  }

  async loadDataFromFile() {
    try {
      if (fs.existsSync(storageFilePath)) {
        const rawData = fs.readFileSync(storageFilePath, 'utf-8');
        this.data = JSON.parse(rawData);
        console.log('Data loaded from file');
      } else {
        this.data = [];
        console.log('No data file found, starting with empty data');
      }
    } catch (error) {
      console.error('Error loading data from file:', error);
    }
  }

  async saveDataToFile() {
    try {
      const jsonData = JSON.stringify(this.data, null, 2); // Pretty print
      fs.writeFileSync(storageFilePath, jsonData);
      console.log('Data saved to file');
    } catch (error) {
      console.error('Error saving data to file:', error);
    }
  }

  async saveData(processedData, service) {
    try {
      const dataEntry = {
        ...processedData,
        ...service,
        collected_at: getCurrentTimestamp()
      };

      this.data.push(dataEntry);

      await this.saveDataToFile();

      // Event log
      eventService.logInfo('storage', `Data saved for service ${service.service_id}`, dataEntry);

      return { success: true };
    } catch (error) {
      eventService.logError('storage', `Error saving data for service ${service.service_id}`, error);
      return { success: false, message: error.message };
    }
  }

  getData() {
    return this.data;
  }
}

module.exports = new StorageService();
