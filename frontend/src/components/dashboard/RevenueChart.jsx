import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiMaximize2 } from 'react-icons/fi';

export default function RevenueChart({ data, title = 'Total Revenue' }) {

    // Formatter pour les tooltips
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{payload[0].payload.month}</p>
                    <p className="text-sm text-teal-600 font-semibold">
                        {payload[0].value.toLocaleString('fr-FR')} FCFA
                    </p>
                </div>
            );
        }
        return null;
    };

    // Formatter pour l'axe Y
    const formatYAxis = (value) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}K`;
        }
        return value;
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition">
                    <FiMaximize2 className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="month"
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <YAxis
                            tickFormatter={formatYAxis}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(10, 92, 107, 0.1)' }} />
                        <Bar
                            dataKey="revenue"
                            fill="url(#colorRevenue)"
                            radius={[8, 8, 0, 0]}
                            maxBarSize={60}
                        />
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0A5C6B" stopOpacity={1} />
                                <stop offset="100%" stopColor="#0D7A8F" stopOpacity={0.8} />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}