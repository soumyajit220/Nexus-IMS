const StatCard = ({ title, value, icon, color, trend }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-sm font-medium ${trend > 0 ? 'text-success' : 'text-danger'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide">{title}</h3>
            <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
    );
};

export default StatCard;
