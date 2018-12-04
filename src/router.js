const express = require('express');
const db = require('knex')(require('../knexfile'));
const { caught, rowToJson, rowsToCsv } = require('./utils');

const router = express.Router();

// main api endpoint that the map uses,
// returns latest measurement for each sensor
router.get(
  '/air-dust-data',
  caught(async (req, res) => {
    const rows = await db('measurements')
      .select('*')
      .max('timestamp as timestamp')
      .groupBy('sensor_id');

    const data = rows.map(rowToJson);

    res.json(data);
  }),
);

// post endpoint for sensor to send data to
// adds a new measurement to the db
router.post(
  '/data',
  caught(async (req, res) => {
    if (req.body) {
      const sensorId = req.body.esp8266id;
      const dataValues = req.body.sensordatavalues;
      if (sensorId && dataValues) {
        const p1data = dataValues.find(o => o.value_type === 'SDS_P1');
        const p2data = dataValues.find(o => o.value_type === 'SDS_P2');
        if (p1data && p1data.value && p2data && p2data.value) {
          // get location
          let loc = await db('current_locations')
            .where('sensor_id', sensorId)
            .first('lat', 'lng');
          if (!loc || !loc.lat || !loc.lng) {
            loc = {
              lat: 46.049816,
              lng: 14.489918,
            };
          }
          // store measurement
          await db('measurements').insert({
            sensor_id: sensorId,
            data_p1: p1data.value,
            data_p2: p2data.value,
            lat: loc.lat,
            lng: loc.lng,
          });
          res.send('Posodobljeno!');
          return;
        }
      }
    }
    res.send('Napaka!');
  }),
);

// simple endpoint to update location for a specific sensor id
const formHTML = `
  <form method="post">
    id: <input name="id"><br>
    pw: <input name="pass" type="password"><br>
    lat: <input name="lat"><br>
    lng: <input name="lng"><br>
    <button>Pošlji</button>
  </form>
`;

router.get('/set-location', (req, res) => {
  res.send(formHTML);
});

router.post(
  '/set-location',
  caught(async (req, res) => {
    if (req.body) {
      const id = String(req.body.id);
      const pass = String(req.body.pass);
      const lat = Number(req.body.lat);
      const lng = Number(req.body.lng);
      if (pass === process.env.LOC_PASSWORD && id && lat && lng) {
        const exists = await db('measurements')
          .where('sensor_id', id)
          .first(1);

        if (exists) {
          const hasLoc = await db('current_locations')
            .where('sensor_id', id)
            .first(1);

          if (hasLoc) {
            // update location
            await db('current_locations')
              .where('sensor_id', id)
              .update({
                lat,
                lng,
              });
          } else {
            // insert new location
            await db('current_locations').insert({
              sensor_id: id,
              lat,
              lng,
            });
          }

          res.send(`
            ${formHTML}
            <strong>Posodobljeno!</strong>
          `);
          return;
        }
      }
      res.send(`
        ${formHTML}
        <strong>Napaka!</strong>
      `);
    }
  }),
);

// history endpoint that returns history data for one sensor
router.get(
  '/history/:sensor_id',
  caught(async (req, res) => {
    if (req.params && req.params.sensor_id) {
      const id = String(req.params.sensor_id);
      const limit = Math.max(1, Math.min(200, Number(req.query.limit) || 20));
      const offset = Math.max(0, Number(req.query.offset) || 0);
      const format = req.query.format === 'csv' ? 'csv' : 'json';
      const rows = await db('measurements')
        .where('sensor_id', id)
        .orderBy('timestamp', 'desc')
        .select('*')
        .limit(limit)
        .offset(offset);

      if (format === 'json') {
        res.json(rows.map(rowToJson));
        return;
      }
      if (format === 'csv') {
        res.set('Content-Type', 'text/plain');
        res.send(rowsToCsv(rows));
        return;
      }
    }
    res.send('Napaka!');
  }),
);

module.exports = router;
