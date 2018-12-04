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
  })),
  { header: true },
);

module.exports = {
  caught,
  rowToJson,
  rowsToCsv,
};
