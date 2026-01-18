const express = require('express');
const redis = require('redis');
const app = express();
app.use(express.json());

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://redis-master:6379'
});
client.connect();

app.post('/set', async (req, res) => {
  const { key, value } = req.body;
  await client.set(key, value);
  res.send(`Stored ${key} = ${value}`);
});

app.get('/get/:key', async (req, res) => {
  const value = await client.get(req.params.key);
  res.send(value ? `${req.params.key} = ${value}` : 'Key not found');
});

app.listen(3000, () => console.log('API running on port number 3000'));
