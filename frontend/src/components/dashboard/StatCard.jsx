import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

export default function StatCard({
    title,
    value,
    change,
    trend = 'neutral',
    icon,
    featured = false
}) {

    // Formater la valeur (avec séparateurs de milliers)
    const formatValue = (val) => {
        // Si c'est déjà une string (comme "1,250 FCFA"), la retourner telle quelle
        if (typeof val === 'string') {
            return val;
        }
        // Si c'est un nombre, le formater
        if (typeof val === 'number') {
            return val.toLocaleString('fr-FR');
        }
        // Si c'est un objet ou autre chose, convertir en string
        return String(val || 0);
    };

    // Déterminer l'icône de tendance
    const TrendIcon = trend === 'up' ? FiTrendingUp : trend === 'down' ? FiTrendingDown : FiMinus;

    // Couleurs selon la tendance
    const trendColors = {
        up: 'text-green-600',
        down: 'text-red-600',
        neutral: 'text-gray-600'
    };

    const trendBgColors = {
        up: 'bg-green-50',
        down: 'bg-red-50',
        neutral: 'bg-gray-50'
    };

    return (
        <div
            className={`group rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl ${featured
                    ? 'bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-lg'
                    : 'bg-white shadow-md hover:shadow-lg hover:bg-gradient-to-br hover:from-teal-600 hover:to-teal-800'
                }`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className={`text-sm font-medium transition-colors ${featured
                            ? 'text-teal-100'
                            : 'text-gray-600 group-hover:text-white'
                        }`}>
                        {title}
                    </p>
                </div>
                {icon && (
                    <div className={`text-3xl transition-all ${featured
                            ? 'opacity-80'
                            : 'opacity-50 group-hover:opacity-100 group-hover:scale-110'
                        }`}>
                        {icon}
                    </div>
                )}
            </div>

            <div className="mb-3">
                <h3 className={`text-3xl font-bold transition-colors ${featured
                        ? 'text-white'
                        : 'text-gray-900 group-hover:text-white'
                    }`}>
                    {formatValue(value)}
                    {title.toLowerCase().includes('taux') && '%'}
                </h3>
            </div>

            {change !== undefined && change !== null && (
                <div className="flex items-center space-x-2">
                    <div
                        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${featured
                                ? 'bg-white/20 text-white'
                                : `${trendBgColors[trend]} ${trendColors[trend]} group-hover:bg-white/20 group-hover:text-white`
                            }`}
                    >
                        <TrendIcon className="w-3 h-3" />
                        <span>
                            {Math.abs(change)}
                            {typeof change === 'number' && !title.toLowerCase().includes('taux') ? '' : '%'}
                        </span>
                    </div>
                    <span className={`text-xs transition-colors ${featured
                            ? 'text-teal-100'
                            : 'text-gray-500 group-hover:text-teal-100'
                        }`}>
                        vs mois dernier
                    </span>
                </div>
            )}
        </div>
    );
}