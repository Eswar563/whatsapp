const cron = require('node-cron');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

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

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});


client.initialize();

const generateQrcode = async (req, res) => {
    
    res.send('qr')

}

const sendMessage = async (req, res) => {
    const { number, message, scheduleTime } = req.body;

    const formattedNumbers = Array.isArray(number) 
        ? number.map(num => num.includes('@c.us') ? num : `91${num}@c.us`)
        : [number.includes('@c.us') ? number : `91${number}@c.us`]; 

    if (!isClientReady) {
        return res.status(503).send({ error: 'Client is not ready yet' });
    }

    if (scheduleTime) {
        cron.schedule(scheduleTime, async () => {
            for (let formattedNumber of formattedNumbers) {
                try {
                    await new Promise(resolve => setTimeout(resolve, 5000)); 
                    await client.sendMessage(formattedNumber, message);
                    console.log(`Scheduled message sent to ${formattedNumber}`);
                } catch (error) {
                    console.error(`Failed to send scheduled message to ${formattedNumber}: ${error.message}`);
                }
            }
        });

        res.send({ status: `Message scheduled at ${scheduleTime}` });
    } else {
        try {
            for (let formattedNumber of formattedNumbers) {
                await new Promise(resolve => setTimeout(resolve, 5000)); 
                await client.sendMessage(formattedNumber, message);
                console.log(`Message sent to ${formattedNumber}`);
            }
            res.send({ status: 'Message(s) sent!' });
        } catch (error) {
            res.status(500).send({ error: 'Failed to send message(s)', details: error.message });
        }
    }
};

module.exports = {sendMessage, generateQrcode}