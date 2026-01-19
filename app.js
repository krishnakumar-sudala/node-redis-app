const express = require('express');
const redis = require('redis');
const app = express();
app.use(express.json());

const client = redis.createClient({
  url: `redis://:${process.env.REDIS_PASSWORD}@redis-master:6379`,
  socket: {
    reconnectStrategy: (retries) => {
      console.log(`Redis reconnect attempt #${retries}`);
      return Math.min(retries * 100, 3000);
    }
  }
});


// Prevent crashes on startup
client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

// Connect with retry logic
(async () => {
  try {
    await client.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("Initial Redis connection failed", err);
  }
})();


app.post('/set', async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || !value) return res.status(400).send("key and value required");
    await client.set(key, value);
    res.send(`Stored ${key} = ${value}`);
  } catch (err) {
    console.error("Error in /set:", err);
    res.status(500).send("Internal server error");
  }
});

app.get('/get/:key', async (req, res) => {
  try {
    const value = await client.get(req.params.key);
    res.send(value ? `${req.params.key} = ${value}` : 'Key not found');
  } catch (err) {
    console.error("Error in /get:", err);
    res.status(500).send("Internal server error");
  }
});


app.listen(3000, "0.0.0.0", () => console.log("API running on port 3000"));


