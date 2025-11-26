export default function VehiculeSpecs({ vehicule }) {
    const specs = [
        {
            label: 'Type de carburant',
            value: vehicule.type_carburant || 'N/A',
            icon: '⛽',
        },
        {
            label: 'Consommation',
            value: vehicule.consommation ? `${vehicule.consommation} L/100km` : 'N/A',
            icon: '📊',
        },
        {
            label: 'Transmission',
            value: vehicule.transmission || 'N/A',
            icon: '⚙️',
        },
        {
            label: 'Moteur',
            value: vehicule.type_moteur || 'N/A',
            icon: '🔧',
        },
        {
            label: 'Cylindrée',
            value: vehicule.cylindree ? `${vehicule.cylindree}L` : 'N/A',
            icon: '🏎️',
        },
        {
            label: 'Puissance',
            value: vehicule.puissance ? `${vehicule.puissance} ch` : 'N/A',
            icon: '⚡',
        },
        {
            label: 'Couleur extérieure',
            value: vehicule.couleur || 'N/A',
            icon: '🎨',
        },
        {
            label: 'Couleur intérieure',
            value: vehicule.couleur_interieur || 'N/A',
            icon: '🪑',
        },
        {
            label: 'Kilométrage',
            value: vehicule.kilometrage
                ? `${parseInt(vehicule.kilometrage).toLocaleString('fr-FR')} km`
                : 'N/A',
            icon: '📏',
        },
        {
            label: 'Année',
            value: vehicule.annee || 'N/A',
            icon: '📅',
        },
        {
            label: 'Type de véhicule',
            value: vehicule.type_vehicule || 'N/A',
            icon: '🚗',
        },
        {
            label: 'Nombre de places',
            value: vehicule.nombre_places ? `${vehicule.nombre_places} places` : 'N/A',
            icon: '👥',
        },
        {
            label: 'Nombre de portes',
            value: vehicule.nombre_portes ? `${vehicule.nombre_portes} portes` : 'N/A',
            icon: '🚪',
        },
        {
            label: 'Climatisation',
            value: vehicule.climatisation ? 'Oui' : 'Non',
            icon: '❄️',
        },
    ];

    // Filtrer les specs qui ont une valeur
    const validSpecs = specs.filter(spec => spec.value !== 'N/A');

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Caractéristiques techniques
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {validSpecs.map((spec, index) => (
                    <div
                        key={index}
                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <span className="text-3xl">{spec.icon}</span>
                        <div className="flex-1">
                            <div className="text-sm text-gray-600 mb-1">{spec.label}</div>
                            <div className="text-lg font-semibold text-gray-900">{spec.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Description du véhicule */}
            {vehicule.description && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                        À propos de ce véhicule
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {vehicule.description}
                    </p>
                </div>
            )}
        </div>
    );
}