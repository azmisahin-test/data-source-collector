const xml2js = require('xml2js');
const eventService = require('./EventService');

class DataProcessingService {
  async parseXML(xml) {
    try {
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(xml);
      eventService.logInfo('parseXML', 'XML parsed successfully');
      return result;
    } catch (error) {
      eventService.logError('parseXML', 'Error parsing XML', error);
      return null;
    }
  }

  processFeed(feed) {
    const channel = feed.rss.channel[0];
    const items = this._processItems(channel.item);

    return {
      channelTitle: channel.title[0],
      channelDescription: channel.description[0],
      channelLink: channel.link[0],
      items
    };
  }

  _processItems(items) {
    return items.map(entry => ({
      title: entry.title[0],
      link: entry.link[0],
      pubDate: entry.pubDate[0],
      traffic: this._parseTraffic(entry['ht:approx_traffic']?.[0]),
      picture: entry['ht:picture']?.[0] || null,
      newsItems: this._processNewsItems(entry['ht:news_item'])
    }));
  }

  _parseTraffic(traffic) {
    if (!traffic) return 'N/A';
    if (traffic.includes('+')) {
      return parseInt(traffic.split('+')[0], 10);
    }
    return parseInt(traffic, 10);
  }

  _processNewsItems(newsItems) {
    if (!newsItems) return [];
    return newsItems.map(item => ({
      title: item['ht:news_item_title'][0],
      url: item['ht:news_item_url'][0],
      source: item['ht:news_item_source'][0],
      picture: item['ht:news_item_picture']?.[0] || null
    }));
  }
}

module.exports = new DataProcessingService();