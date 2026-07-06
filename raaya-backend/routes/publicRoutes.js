const express = require('express');
const router = express.Router();
const { getActiveNurses, getNurseById } = require('../controllers/publicController');

router.get('/nurses', getActiveNurses);
router.get('/nurses/:id', getNurseById);

module.exports = router;
