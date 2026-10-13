const express = require('express');
const { getShow, createShow, deleteShow } = require('../controllers/showController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/:id', getShow);
router.post('/', protect, adminOnly, createShow);
router.delete('/:id', protect, adminOnly, deleteShow);

module.exports = router;
