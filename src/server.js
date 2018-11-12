require('dotenv').load({ path: '.env.local' });
require('dotenv').load({ path: '.env' });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require('./router');

const PORT = process.env.PORT || '3000';
const HOST = process.env.HOST || '127.0.0.1';

const app = express();
app.enable('trust proxy');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', router);

const server = app.listen(PORT, HOST, () => {
  console.log(`Server started on http://${HOST}:${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log('Address in use, retrying...');
    setTimeout(() => {
      server.close();
      server.listen(PORT, HOST);
    }, 1000);
  }
});
