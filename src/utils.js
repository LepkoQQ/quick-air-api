const csvStringify = require('csv-stringify/lib/sync');

const caught = fn => (...args) => fn(...args).catch(args[2]);

const rowToJson = row => ({
  id: row.id,
  timestamp: row.timestamp,
  location: {
    latitude: row.lat,
    longitude: row.lng,
  },
  sensor: {
    id: row.sensor_id,
  },
  sensordatavalues: [
    {
      value: row.data_p1,
      value_type: 'P1',
    },
    {
      value: row.data_p2,
      value_type: 'P2',
    },
    {
      value: row.data_temperature,
      value_type: 'temperature',
    },
    {
      value: row.data_humidity,
      value_type: 'humidity',
    },
  ],
});

const rowsToCsv = rows => csvStringify(
  rows.map(row => ({
    id: row.id,
    timestamp: row.timestamp,
    latitude: row.lat,
    longitude: row.lng,
    sensor_id: row.sensor_id,
    data_p1: row.data_p1,
    data_p2: row.data_p2,
    data_temperature: row.data_temperature,
    data_humidity: row.data_humidity,
  })),
  { header: true },
);

module.exports = {
  caught,
  rowToJson,
  rowsToCsv,
};
