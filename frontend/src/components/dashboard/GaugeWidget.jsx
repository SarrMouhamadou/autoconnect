import { FiTrendingUp } from 'react-icons/fi';

export default function GaugeWidget({
    title = 'Community growth',
    value = 65,
    change = 0.9,
    trend = 'up'
}) {

    const circumference = 2 * Math.PI * 45; // rayon = 45
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>

            <div className="flex items-center justify-center">
                {/* SVG Circular Progress */}
                <div className="relative">
                    <svg width="120" height="120" className="transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="60"
                            cy="60"
                            r="45"
                            fill="none"
                            stroke="#E5E7EB"
                            strokeWidth="10"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="60"
                            cy="60"
                            r="45"
                            fill="none"
                            stroke="url(#gaugeGradient)"
                            strokeWidth="10"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#0A5C6B" />
                                <stop offset="100%" stopColor="#0D7A8F" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Center text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900">{value}%</span>
                    </div>
                </div>
            </div>

            {/* Change indicator */}
            <div className="flex items-center justify-center space-x-2 mt-4">
                <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-50 text-green-600">
                    <FiTrendingUp className="w-3 h-3" />
                    <span className="text-xs font-medium">{change}%</span>
                </div>
                <span className="text-xs text-gray-500">from last month</span>
            </div>
        </div>
    );
}