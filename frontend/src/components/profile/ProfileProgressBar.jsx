export default function ProfileProgressBar({ pourcentage, etapesManquantes = [] }) {
  // Déterminer la couleur selon le pourcentage
  const getColor = () => {
    if (pourcentage < 40) return 'red';
    if (pourcentage < 70) return 'yellow';
    return 'green';
  };

  const color = getColor();
  
  const colorClasses = {
    red: {
      bg: 'bg-red-500',
      text: 'text-red-700',
      bgLight: 'bg-red-50',
      border: 'border-red-200'
    },
    yellow: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-700',
      bgLight: 'bg-yellow-50',
      border: 'border-yellow-200'
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-green-700',
      bgLight: 'bg-green-50',
      border: 'border-green-200'
    }
  };

  return (
    <div className={`${colorClasses[color].bgLight} border ${colorClasses[color].border} rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-sm font-medium ${colorClasses[color].text}`}>
          Complétez votre profil
        </h3>
        <span className={`text-2xl font-bold ${colorClasses[color].text}`}>
          {pourcentage}%
        </span>
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div 
          className={`${colorClasses[color].bg} h-3 rounded-full transition-all duration-500 ease-out flex items-center justify-end`}
          style={{ width: `${pourcentage}%` }}
        >
          {pourcentage > 10 && (
            <span className="text-white text-xs font-bold mr-2">{pourcentage}%</span>
          )}
        </div>
      </div>

      {/* Étapes manquantes */}
      {etapesManquantes && etapesManquantes.length > 0 && (
        <div className="mt-4">
          <h4 className={`text-sm font-medium ${colorClasses[color].text} mb-3`}>
            {pourcentage < 100 ? 'Étapes restantes :' : 'Profil complet ! 🎉'}
          </h4>
          <div className="space-y-2">
            {etapesManquantes.map((etape, index) => (
              <div 
                key={index}
                className="flex items-start bg-white rounded-lg p-3 border border-gray-200"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`w-2 h-2 rounded-full ${
                    etape.importance === 'Haute' ? 'bg-red-500' :
                    etape.importance === 'Moyenne' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900">{etape.titre}</p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      etape.importance === 'Haute' ? 'bg-red-100 text-red-700' :
                      etape.importance === 'Moyenne' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {etape.importance}
                    </span>
                    <span className="text-xs text-green-600 font-medium">
                      {etape.points}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message selon le statut */}
      {pourcentage === 100 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-green-700 font-medium">
            🎉 Votre profil est complet ! En attente de validation...
          </p>
        </div>
      )}
    </div>
  );
}