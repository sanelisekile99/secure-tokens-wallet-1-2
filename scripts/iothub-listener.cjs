const { Client } = require('azure-iothub');
const axios = require('axios');

const connectionString = process.env.IOTHUB_CONNECTION_STRING;
const API_URL = process.env.API_URL || 'http://localhost:3001';

if (!connectionString || connectionString === 'YOUR_IOTHUB_CONNECTION_STRING') {
  console.error('Missing IOTHUB_CONNECTION_STRING environment variable.');
  process.exit(1);
}

const client = Client.fromConnectionString(connectionString);

// Listen for messages from Raspberry Pi.
client.open((err) => {
  if (err) {
    console.error('Failed to connect to IoT Hub:', err.message || err);
    process.exit(1);
  }

  console.log('Connected to IoT Hub. Waiting for messages...');

  client.on('message', async (msg) => {
    const data = msg.getData().toString();
    console.log('Received:', data);

    try {
      const payload = JSON.parse(data);
      if (payload.action === 'tap' && payload.userId) {
        console.log(`Processing tap for userId: ${payload.userId}`);
        try {
          const response = await axios.post(`${API_URL}/deduct`, {
            userId: payload.userId,
            amount: 10, // Deduct 10 tokens for a tap
          });
          console.log('Deduction successful:', response.data);
        } catch (apiError) {
          console.error('Failed to call deduct API:', apiError.response ? apiError.response.data : apiError.message);
        }
      }
    } catch (parseError) {
      console.error('Failed to parse incoming message:', parseError);
    }
  });

  client.on('error', (clientErr) => {
    console.error('IoT Hub client error:', clientErr.message || clientErr);
  });
});
