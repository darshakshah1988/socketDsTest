const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const axios = require('axios');
const nodemailer = require('nodemailer');
const cors = require('cors');

app.use(cors());
// Replace with your API key or preferred method for fetching Bitcoin price
const coinGeckoApi = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3/',
});

// Configure email transport (replace with your email credentials)
const transporter = nodemailer.createTransport({
  host: "smtp.google.com",
  port: 465,
  secure: true,
  service: 'gmail', // Adjust based on your email provider
  auth: {
    user: 'rentacoder2010@gmail.com',
    pass: 'beit2011',
  },
});

// Function to fetch Bitcoin price
async function getBitcoinPrice() {
  try {
    const a = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    //console.log(a.data.bitcoin.usd);
    return a.data.bitcoin.usd;
  } catch(error) {
    console.log(error);
  }
  
  // try {
  //   const response = await coinGeckoApi.get('simple/price', {
  //     ids: 'bitcoin',
  //     vs_currencies: 'usd',
  //   });
  //   return response.data.bitcoin.usd;
  // } catch (error) {
  //   console.error('Error fetching Bitcoin price:', error);
  //   return null; // Indicate error
  // }
}

// Function to send email notification
async function sendEmailNotification(price) {
  try {
    const mailOptions = {
      from: 'rentacoder2010@gmail.com',
      to: 'smartdarshak88@gmail.com', // Replace with recipient's email
      subject: 'Bitcoin Price Update',
      text: `The current Bitcoin price is $${price}.`,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

// Interval to fetch and send updates
setInterval(async () => {
  const price = await getBitcoinPrice();
  if (price !== null) {
    io.emit('price-update', price); // Emit event to connected clients
    await sendEmailNotification(price); // Optionally send email notification
  }
}, 60000); // Set interval to 1 minute (60 seconds * 1000 milliseconds)

app.get('/', async (req, res) => {
  res.send('Bitcoin Price App');
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

http.listen(3000, () => {
  console.log('Server listening on port 3000');
});
