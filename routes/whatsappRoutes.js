const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');


router.post('/sendmessage', whatsappController.sendMessage);
router.get('/generateqrcode', whatsappController.generateQrcode)

module.exports = router;