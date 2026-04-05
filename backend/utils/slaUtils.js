/**
 * Calculate SLA Deadline based on Priority
 * @param {string} priority - Low, Medium, High, Critical
 * @returns {Date} - The deadline date
 */
const calculateSLA = (priority) => {
    const now = new Date();
    let hoursToAdd = 48; // Default Low

    switch (priority) {
        case 'Critical':
            hoursToAdd = 4;
            break;
        case 'High':
            hoursToAdd = 8;
            break;
        case 'Medium':
            hoursToAdd = 24;
            break;
        case 'Low':
        default:
            hoursToAdd = 48;
            break;
    }

    return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
};

module.exports = { calculateSLA };
