const express = require('express');
const router = express.Router();
const { getTickets, getTicketById, createTicket, updateTicket } = require('../controllers/ticketController');
const { protect, admin } = require('../middleware/authMiddleware');


router.route('/')
    .get(protect, getTickets)
    .post(protect, createTicket);

router.route('/:id')
    .get(protect, getTicketById)
    .put(protect, updateTicket);

module.exports = router;
