require('dotenv').config();
const express = require('express');
const cors = require('cors')
const whatsappRoutes = require('./routes/whatsappRoutes');

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/whatsapp', whatsappRoutes);

app.listen(process.env.port, () => {
    console.log(`Server is running on http://localhost:${process.env.port}`)
})
