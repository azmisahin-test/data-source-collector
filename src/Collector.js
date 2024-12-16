const services = require('./config/services');
const constants = require('./config/constants');
const eventService = require('./services/EventService');
const dataCollectionService = require('./services/DataCollectionService');
const dataProcessingService = require('./services/DataProcessingService');
const storageService = require('./services/StorageService');
const schedulerService = require('./services/SchedulerService');

class Collector {
  constructor() {
    this.services = services;
  }

  async start() {
    try {
      const activeServices = this._getActiveServices();

      if (activeServices.length === 0) {
        eventService.logInfo('collector', 'No active services available');
        return { success: true, message: 'No services to process' };
      }

      this._scheduleServices(activeServices);
      
      eventService.logInfo('collector', `All services [${activeServices.length}] scheduled`);
      return { success: true };
    } catch (error) {
      eventService.logError('collector', 'Collector initialization failed', error);
      return { success: false, message: error.message };
    }
  }

  _getActiveServices() {
    return this.services.filter(service => service.service_status_id === 1);
  }

  _scheduleServices(services) {
    services.forEach(service => {
      schedulerService.scheduleJob(service, this._processService.bind(this));
    });
  }

  async _processService(service) {
    const rateLimit = service.rate_limit || constants.DEFAULT_RATE_LIMIT;
    const timeout = service.timeout || constants.DEFAULT_TIMEOUT;

    if (this._isXMLService(service)) {
      const xmlData = await dataCollectionService.fetchRSS(service.full_url, { rateLimit, timeout });
      if (xmlData) {
        const jsonData = await dataProcessingService.parseXML(xmlData);
        if (jsonData) {
          const processedData = dataProcessingService.processFeed(jsonData);
          await storageService.saveData(processedData, service);
        }
      }
    }
  }

  _isXMLService(service) {
    return service.access_type_id === 2 || service.data_format_code === 'xml';
  }
}

module.exports = new Collector();