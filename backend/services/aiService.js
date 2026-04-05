/**
 * AI Service Mock
 * In a real app, this would call OpenAI or a Python microservice.
 */

const classifyTicket = (text) => {
    const t = text.toLowerCase();
    if (t.includes('network') || t.includes('wifi') || t.includes('internet') || t.includes('vpn')) return 'Network';
    if (t.includes('hardware') || t.includes('monitor') || t.includes('laptop') || t.includes('keyboard')) return 'Hardware';
    if (t.includes('software') || t.includes('app') || t.includes('crash') || t.includes('error')) return 'Software';
    if (t.includes('login') || t.includes('access') || t.includes('password') || t.includes('auth')) return 'Access';
    return 'General';
};

const predictPriority = (text) => {
    const t = text.toLowerCase();
    if (t.includes('urgent') || t.includes('critical') || t.includes('immediately') || t.includes('server down')) return 'Critical';
    if (t.includes('high') || t.includes('blocker')) return 'High';
    if (t.includes('low') || t.includes('minor')) return 'Low';
    return 'Medium';
};

module.exports = { classifyTicket, predictPriority };
