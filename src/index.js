require('dotenv').config();
const express = require('express');
const collector = require('./Collector');
const eventService = require('./services/EventService');

const app = express();
const port = process.env.PORT || 3000;

// Set up logging
eventService.on('step', ({ type, timestamp, step, message, data }) => {
  if (type === 'info') {
    // Combine titles into one line if they exist in the 'data' object
    if (step === "storage" && data && data.items) {
      const titles = data.items.map(item => item.title).join(' | '); // Concatenate titles with ' | ' separator
      console.log(`${timestamp} - ${step} - ${message} - Titles: ${titles}`);

      // Emit titles to connected clients via SSE
      sendTitlesToClients(data);
    } else {
      console.log(`${timestamp} - ${step} - ${message}`);
    }
  } else if (type === 'error') {
    console.error(`${timestamp} - ${step} - ${message}`);
  }
});

// SSE clients array
let clients = [];

const sendTitlesToClients = (data) => {
  clients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};

// Endpoint for subscribing to real-time updates via SSE
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Keep connection open
  res.flushHeaders();

  // Add this client to the clients array
  clients.push({ res });

  // Cleanup client connection when closed
  req.on('close', () => {
    clients = clients.filter(client => client.res !== res);
  });
});

// Start the collector
const start = async () => {
  try {
    const result = await collector.start();

    if (result.success) {
      console.log('Collector started successfully');
    } else {
      console.error('Collector failed:', result.message);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
};

start();

// Serve static files (for frontend)
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
