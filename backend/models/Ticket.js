const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'],
        default: 'Open'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    impact: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Low'
    },
    urgency: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    category: {
        type: String,
        required: true
    },
    // SLA Management
    slaDeadline: {
        type: Date
    },
    slaStatus: {
        type: String,
        enum: ['On Track', 'Warning', 'Breached', 'N/A'],
        default: 'N/A'
    },
    slaBreachTime: {
        type: Date
    },
    // Workflow & Assignment
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    escalationLevel: {
        type: Number,
        default: 0
    },
    reopenCount: {
        type: Number,
        default: 0
    },
    // Root Cause Analysis (RCA) & Resolution
    rootCauseCategory: {
        type: String // e.g., 'Hardware Failure', 'Human Error'
    },
    resolutionDetails: {
        type: String
    },
    resolution: {
        type: String // Deprecated in favor of resolutionDetails but kept for compatibility or summary
    },
    // Legacy logs (kept for backward compatibility, but we will move to AuditLogs)
    logs: [{
        action: String,
        timestamp: { type: Date, default: Date.now },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
}, {
    timestamps: true
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
