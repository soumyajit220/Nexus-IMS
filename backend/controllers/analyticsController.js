const Ticket = require('../models/Ticket');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Helper to build a date filter from query param
const getDateFilter = (range) => {
    const now = new Date();
    let start;

    switch (range) {
        case 'today':
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'week':
            start = new Date(now);
            start.setDate(now.getDate() - 7);
            break;
        case 'month':
            start = new Date(now);
            start.setMonth(now.getMonth() - 1);
            break;
        default:
            return {}; // 'all' — no filter
    }

    return { createdAt: { $gte: start } };
};

// @desc    Get comprehensive system dashboard stats
// @route   GET /api/analytics/dashboard?range=today|week|month|all
// @access  Private (Admin/Agent)
const getDashboardStats = async (req, res) => {
    try {
        const dateFilter = getDateFilter(req.query.range);

        const totalTickets = await Ticket.countDocuments(dateFilter);

        // Status Counts
        const statusCounts = await Ticket.aggregate([
            { $match: dateFilter },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // SLA Stats
        const slaStats = await Ticket.aggregate([
            { $match: dateFilter },
            { $group: { _id: "$slaStatus", count: { $sum: 1 } } }
        ]);

        // Priority Breakdown
        const priorityStats = await Ticket.aggregate([
            { $match: dateFilter },
            { $group: { _id: "$priority", count: { $sum: 1 } } }
        ]);

        // Category Breakdown
        const categoryStats = await Ticket.aggregate([
            { $match: dateFilter },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        // Urgency Breakdown
        const urgencyStats = await Ticket.aggregate([
            { $match: dateFilter },
            { $group: { _id: "$urgency", count: { $sum: 1 } } }
        ]);

        // Recent SLA Breaches (Top 5)
        const recentBreaches = await Ticket.find({ ...dateFilter, slaStatus: 'Breached' })
            .select('title priority slaBreachTime assignedTo')
            .populate('assignedTo', 'name')
            .sort({ slaBreachTime: -1 })
            .limit(5);

        res.json({
            totalTickets,
            statusCounts: formatAggregation(statusCounts),
            slaStats: formatAggregation(slaStats),
            priorityStats: formatAggregation(priorityStats),
            categoryStats: formatAggregation(categoryStats),
            urgencyStats: formatAggregation(urgencyStats),
            recentBreaches
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};

// @desc    Get Agent Performance Leaderboard
// @route   GET /api/analytics/agents
// @access  Private (Admin)
const getAgentPerformance = async (req, res) => {
    try {
        const agents = await User.find({ role: 'Agent' }).select('name email');

        const agentStats = await Promise.all(agents.map(async (agent) => {
            const resolvedCount = await Ticket.countDocuments({
                assignedTo: agent._id,
                status: { $in: ['Resolved', 'Closed'] }
            });

            const activeCount = await Ticket.countDocuments({
                assignedTo: agent._id,
                status: { $in: ['Open', 'In Progress'] }
            });

            return {
                _id: agent._id,
                name: agent.name,
                resolvedCount,
                activeCount
            };
        }));

        res.json(agentStats.sort((a, b) => b.resolvedCount - a.resolvedCount));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching agent stats' });
    }
};

// @desc    Get detailed Agent Analytics with time-range filtering
// @route   GET /api/analytics/agent-analytics?range=today|week|month|all
// @access  Private (Admin/Agent)
const getAgentAnalytics = async (req, res) => {
    try {
        const dateFilter = getDateFilter(req.query.range);
        const agents = await User.find({ role: 'Agent' }).select('name email');

        const agentStats = await Promise.all(agents.map(async (agent) => {
            // Ticket counts
            const totalAssigned = await Ticket.countDocuments({ assignedTo: agent._id, ...dateFilter });
            const resolvedCount = await Ticket.countDocuments({
                assignedTo: agent._id,
                status: { $in: ['Resolved', 'Closed'] },
                ...dateFilter
            });
            const activeCount = await Ticket.countDocuments({
                assignedTo: agent._id,
                status: { $in: ['Open', 'In Progress'] },
                ...dateFilter
            });
            const pendingCount = await Ticket.countDocuments({
                assignedTo: agent._id,
                status: 'Pending',
                ...dateFilter
            });

            // Average Resolution Time (hours)
            const resolvedTickets = await Ticket.find({
                assignedTo: agent._id,
                status: { $in: ['Resolved', 'Closed'] },
                ...dateFilter
            }).select('createdAt updatedAt');

            let avgResolutionTime = 0;
            if (resolvedTickets.length > 0) {
                const totalHours = resolvedTickets.reduce((sum, t) => {
                    const hours = (new Date(t.updatedAt) - new Date(t.createdAt)) / (1000 * 60 * 60);
                    return sum + hours;
                }, 0);
                avgResolutionTime = Math.round((totalHours / resolvedTickets.length) * 10) / 10;
            }

            // SLA compliance
            const slaBreached = await Ticket.countDocuments({
                assignedTo: agent._id,
                slaStatus: 'Breached',
                ...dateFilter
            });
            const slaCompliance = totalAssigned > 0
                ? Math.round(((totalAssigned - slaBreached) / totalAssigned) * 100)
                : 100;

            // Audit log activity count
            const activityCount = await AuditLog.countDocuments({
                performedBy: agent._id,
                ...dateFilter
            });

            return {
                _id: agent._id,
                name: agent.name,
                email: agent.email,
                totalAssigned,
                resolvedCount,
                activeCount,
                pendingCount,
                avgResolutionTime,
                slaCompliance,
                slaBreached,
                activityCount
            };
        }));

        // Agent activity over time (last 30 days, grouped by day)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activityTimeline = await AuditLog.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        agent: "$performedBy"
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);

        // Populate agent names for timeline
        const agentMap = {};
        agents.forEach(a => { agentMap[a._id.toString()] = a.name; });

        const formattedTimeline = activityTimeline.map(item => ({
            date: item._id.date,
            agentId: item._id.agent,
            agentName: agentMap[item._id.agent?.toString()] || 'Unknown',
            count: item.count
        }));

        res.json({
            agents: agentStats.sort((a, b) => b.resolvedCount - a.resolvedCount),
            activityTimeline: formattedTimeline
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching agent analytics' });
    }
};

// Helper to format mongo aggregation output
const formatAggregation = (data) => {
    const formatted = {};
    data.forEach(item => {
        formatted[item._id] = item.count;
    });
    return formatted;
};

module.exports = { getDashboardStats, getAgentPerformance, getAgentAnalytics };
