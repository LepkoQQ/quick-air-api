const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');

const db = knex(require('./knexfile'));

const app = express();
app.enable('trust proxy');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function setLocation(sensorId, loc) {
  const row = await db('sensors')
    .where('sensor_id', String(sensorId))
    .first();

  if (row) {
    await db('sensors')
      .where('sensor_id', String(sensorId))
      .update({
        lat: loc.lat,
        lng: loc.lng,
      });
  } else {
    await db('sensors')
      .insert({
        sensor_id: String(sensorId),
        lat: loc.lat,
        lng: loc.lng,
      });
  }
}

async function getLocation(sensorId) {
  const row = await db('sensors')
    .where('sensor_id', String(sensorId))
    .first();

  if (row && row.lat && row.lng) {
    return {
      latitude: row.lat,
      longitude: row.lng,
    };
  }

  return {
    latitude: '46.049816',
    longitude: '14.489918',
  };
}

async function setData(sensorId, data) {
  const row = await db('sensors')
    .where('sensor_id', String(sensorId))
    .first();

  if (row) {
    await db('sensors')
      .where('sensor_id', String(sensorId))
      .update({
        data_p1: data.data_p1,
        data_p2: data.data_p2,
      });
  } else {
    await db('sensors')
      .insert({
        sensor_id: String(sensorId),
        data_p1: data.data_p1,
        data_p2: data.data_p2,
      });
  }
}

app.post('/api/data', async (req, res) => {
  console.log(req.ip);
  console.log(req.body);
  console.log();

  const sensorId = req.body && req.body.esp8266id;

  if (sensorId) {
    const dataValues = req.body.sensordatavalues || [];
    const p1data = dataValues.find(o => o.value_type === 'SDS_P1');
    const p2data = dataValues.find(o => o.value_type === 'SDS_P2');

    if (p1data && p2data) {
      const updateData = {
        data_p1: p1data.value || '-1',
        data_p2: p2data.value || '-1',
      };

      await setData(sensorId, updateData);

      res.send('Posodobljeno!');
      return;
    }
  }

  res.send('Napaka!');
});

app.get('/api/air-dust-data', async (req, res) => {
  const rows = await db('sensors')
    .select();

  if (rows) {
    const data = rows
      .filter(row => row.data_p1 && row.data_p2)
      .map(async (row) => {
        const loc = await getLocation(row.sensor_id);
        return {
          location: loc,
          sensor: {
            id: row.sensor_id,
          },
          sensordatavalues: [
            {
              value: row.data_p1,
              value_type: 'P1',
            },
            {
              value: row.data_p1,
              value_type: 'P2',
            },
          ],
        };
      });

    //console.log(data);
    //console.log(row);

    const done_data = await Promise.all(data);

    res.json(done_data);
    return;
  }

  res.json([]);
});

app.get('/api/set-location', (req, res) => {
  res.send(`
    <form method="post">
      User: <input name="user"><br>
      Password: <input name="pass" type="password"><br>
      latitude: <input name="lat"><br>
      longitude: <input name="lng"><br>
      <button>Pošlji</button>
    </form>
  `);
});

app.post('/api/set-location', async (req, res) => {
  if (req.body.user === req.body.pass) {
    if (/^\d+$/.test(req.body.user)) {
      const sensorId = req.body.user;
      const loc = {
        lat: req.body.lat,
        lng: req.body.lng,
      };
      await setLocation(sensorId, loc);
      res.send('Posodobljeno!');
      return;
    }
  }
  res.send('Napaka!');
});

app.listen(3300, '127.0.0.1', (err) => {
  if (!err) {
    console.log('Server started: http://localhost:3300/air-dust-data');
  }
});
