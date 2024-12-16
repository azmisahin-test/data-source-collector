const eventService = require('./EventService');

class SchedulerService {
  scheduleJob(service, jobFunction) {
    if (service.fetch_frequency > 0) {
      this._scheduleRecurringJob(service, jobFunction);
    } else {
      this._executeImmediateJob(service, jobFunction);
    }
  }

  _scheduleRecurringJob(service, jobFunction) {
    eventService.logInfo(
      'scheduler', 
      `Scheduled job for service ${service.service_id} with frequency ${service.fetch_frequency}s`
    );

    setInterval(
      () => this._executeJob(service, jobFunction),
      service.fetch_frequency * 1000
    );
  }

  _executeImmediateJob(service, jobFunction) {
    this._executeJob(service, jobFunction);
  }

  async _executeJob(service, jobFunction) {
    try {
      await jobFunction(service);
    } catch (error) {
      eventService.logError(
        'scheduler',
        `Error executing job for service ${service.service_id}`,
        error
      );
    }
  }
}

module.exports = new SchedulerService();