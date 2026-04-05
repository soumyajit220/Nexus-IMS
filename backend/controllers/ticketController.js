const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog');
const { classifyTicket, predictPriority } = require('../services/aiService');
const { calculateSLA } = require('../utils/slaUtils');

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private (User sees own, Admin/Agent sees all)
const getTickets = async (req, res) => {
    let tickets;
    if (req.user.role === 'Admin' || req.user.role === 'Agent') {
        tickets = await Ticket.find({}).populate('createdBy', 'name email').populate('assignedTo', 'name email').sort({ createdAt: -1 });
    } else {
        tickets = await Ticket.find({ createdBy: req.user._id }).populate('createdBy', 'name email').sort({ createdAt: -1 });
    }
    res.json(tickets);
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = async (req, res) => {
    const ticket = await Ticket.findById(req.params.id).populate('createdBy', 'name email').populate('assignedTo', 'name email');

    if (ticket) {
        if (req.user.role !== 'Admin' && req.user.role !== 'Agent' && ticket.createdBy._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to view this ticket' });
        }
        res.json(ticket);
    } else {
        res.status(404).json({ message: 'Ticket not found' });
    }
};

// @desc    Create a ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res) => {
    let { title, description, category, priority, impact, urgency } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: 'Please add title and description' });
    }

    // AI Automation
    if (!category || category === 'General') {
        const aiCategory = classifyTicket(description + ' ' + title);
        if (aiCategory) category = aiCategory;
    }
    if (!priority || priority === 'Medium') {
        const aiPriority = predictPriority(description + ' ' + title);
        if (aiPriority) priority = aiPriority;
    }

    const slaDeadline = calculateSLA(priority);

    const ticket = await Ticket.create({
        title,
        description,
        category: category || 'General',
        priority: priority || 'Medium',
        impact: impact || 'Low',
        urgency: urgency || 'Medium',
        slaDeadline,
        slaStatus: 'On Track',
        createdBy: req.user._id,
        logs: [{ action: `Ticket Created. Priority: ${priority}`, user: req.user._id }]
    });

    // Create Audit Log
    await AuditLog.create({
        ticketId: ticket._id,
        action: 'CREATED',
        performedBy: req.user._id,
        details: `Ticket created with Priority ${priority} and SLA Deadline ${slaDeadline}`
    });

    res.status(201).json(ticket);
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private (Agent/Admin)
const updateTicket = async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
    }

    // Permission check
    if (req.user.role === 'User' && ticket.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    const { status, assignedTo, resolutionDetails, rootCauseCategory, priority, category } = req.body;
    let changes = [];

    // Track changes for AuditLog
    if (status && status !== ticket.status) {
        if (req.user.role === 'Admin') {
            return res.status(403).json({ message: 'Admins cannot update ticket statuses' });
        }
        changes.push({ field: 'status', oldValue: ticket.status, newValue: status });
        ticket.status = status;
    }
    if (priority && priority !== ticket.priority) {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Only an Admin can update ticket priority' });
        }
        changes.push({ field: 'priority', oldValue: ticket.priority, newValue: priority });
        ticket.priority = priority;
        // Recalculate SLA if priority changes
        ticket.slaDeadline = calculateSLA(priority);
        changes.push({ field: 'slaDeadline', oldValue: 'OLD_DATE', newValue: ticket.slaDeadline });
    }
    if (assignedTo && assignedTo !== ticket.assignedTo?.toString()) {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Only an Admin can assign tickets' });
        }

        // Check if the agent already has an active ticket
        const activeTickets = await Ticket.countDocuments({
            assignedTo: assignedTo,
            status: { $nin: ['Resolved', 'Closed'] }
        });

        if (activeTickets > 0) {
            return res.status(400).json({ message: 'This agent is already managing an active ticket' });
        }

        changes.push({ field: 'assignedTo', oldValue: ticket.assignedTo, newValue: assignedTo });
        ticket.assignedTo = assignedTo;
    }
    if (resolutionDetails && resolutionDetails !== ticket.resolutionDetails) {
        if (req.user.role === 'Admin') {
            return res.status(403).json({ message: 'Admins cannot resolve tickets' });
        }
        ticket.resolutionDetails = resolutionDetails;
    }
    if (rootCauseCategory) ticket.rootCauseCategory = rootCauseCategory;
    if (category) ticket.category = category;

    // Legacy logs update
    ticket.logs.push({
        action: `Updated by ${req.user.name || 'User'}`,
        user: req.user._id
    });

    const updatedTicket = await ticket.save();

    // Create Audit Log if there were valid changes
    if (changes.length > 0) {
        await AuditLog.create({
            ticketId: ticket._id,
            action: 'UPDATED',
            performedBy: req.user._id,
            details: `Updated ${changes.map(c => c.field).join(', ')}`,
            changes: changes
        });
    }

    res.json(updatedTicket);
};

module.exports = { getTickets, getTicketById, createTicket, updateTicket };
