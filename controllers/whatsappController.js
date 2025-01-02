const cron = require('node-cron');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');

let isClientReady = false;

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: 'session'
    })
});

client.on('ready', () => {
    console.log('Client is ready!');
    isClientReady = true;
});

client.initialize();

const generateQrcode = async (req, res) => {
    client.on('qr', async (qr) => {
        try {
            const qrImageBuffer = await qrcode.toBuffer(qr);
            res.set('Content-Type', 'image/png');
            res.send(qrImageBuffer);  
        } catch (err) {
            res.status(500).send('Error generating QR code');
        }
    });
};


const sendMessage = async (req, res) => {
    const { number, message, scheduleTime, imageUrl } = req.body;

    const formattedNumbers = Array.isArray(number) 
        ? number.map(num => num.includes('@c.us') ? num : `91${num}@c.us`)
        : [number.includes('@c.us') ? number : `91${number}@c.us`]; 

    if (!isClientReady) {
        return res.status(503).send({ error: 'Client is not ready yet' });
    }

    const send = async (formattedNumber) => {
        try {
            if (imageUrl) {
                const media = await MessageMedia.fromUrl(imageUrl);
                await client.sendMessage(formattedNumber, media, { caption: message });
                console.log(`Image sent to ${formattedNumber}`);
            } else {
                await client.sendMessage(formattedNumber, message);
                console.log(`Message sent to ${formattedNumber}`);
            }
        } catch (error) {
            console.error(`Failed to send message to ${formattedNumber}: ${error.message}`);
        }
    };

    if (scheduleTime) {
        cron.schedule(scheduleTime, async () => {
            for (let formattedNumber of formattedNumbers) {
                await send(formattedNumber);
            }
        });

        res.send({ status: `Message scheduled at ${scheduleTime}` });
    } else {
        try {
            for (let formattedNumber of formattedNumbers) {
                await send(formattedNumber);
            }
            res.send({ status: 'Message(s) sent!' });
        } catch (error) {
            res.status(500).send({ error: 'Failed to send message(s)', details: error.message });
        }
    }
};

module.exports = {sendMessage, generateQrcode}