import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPlus, FaEdit, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

export default function MesConcessionsWidget({ concessions, loading }) {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    const getStatutIcon = (statut) => {
        switch (statut) {
            case 'VALIDE':
                return <FaCheckCircle className="text-green-500" />;
            case 'EN_ATTENTE':
                return <FaClock className="text-yellow-500" />;
            case 'REJETE':
                return <FaTimesCircle className="text-red-500" />;
            case 'SUSPENDU':
                return <FaTimesCircle className="text-orange-500" />;
            default:
                return <FaClock className="text-gray-500" />;
        }
    };

    const getStatutLabel = (statut) => {
        const labels = {
            'VALIDE': 'Validée',
            'EN_ATTENTE': 'En attente',
            'REJETE': 'Rejetée',
            'SUSPENDU': 'Suspendue'
        };
        return labels[statut] || statut;
    };

    const getStatutColor = (statut) => {
        const colors = {
            'VALIDE': 'bg-green-50 text-green-700 border-green-200',
            'EN_ATTENTE': 'bg-yellow-50 text-yellow-700 border-yellow-200',
            'REJETE': 'bg-red-50 text-red-700 border-red-200',
            'SUSPENDU': 'bg-orange-50 text-orange-700 border-orange-200'
        };
        return colors[statut] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const concessionsValidees = concessions?.filter(c => c.statut === 'VALIDE').length || 0;
    const concessionsEnAttente = concessions?.filter(c => c.statut === 'EN_ATTENTE').length || 0;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-teal-600 text-xl" />
                    <h3 className="text-lg font-semibold text-gray-900">Mes Concessions</h3>
                </div>
                <Link
                    to="/my-concessions"
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                    Voir tout →
                </Link>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
                    <div className="text-2xl font-bold text-teal-700">{concessionsValidees}</div>
                    <div className="text-xs text-teal-600">Validée{concessionsValidees > 1 ? 's' : ''}</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                    <div className="text-2xl font-bold text-yellow-700">{concessionsEnAttente}</div>
                    <div className="text-xs text-yellow-600">En attente</div>
                </div>
            </div>

            {/* Liste des concessions */}
            {!concessions || concessions.length === 0 ? (
                <div className="text-center py-8">
                    <FaMapMarkerAlt className="text-gray-300 text-4xl mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-4">Aucune concession</p>
                    <Link
                        to="/my-concessions/add"
                        className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                        <FaPlus /> Créer ma première concession
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {concessions.slice(0, 3).map((concession) => (
                        <div
                            key={concession.id}
                            className={`border rounded-lg p-3 transition hover:shadow-md ${getStatutColor(concession.statut)}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {getStatutIcon(concession.statut)}
                                        <h4 className="font-semibold text-sm truncate">
                                            {concession.nom}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-gray-600 truncate">
                                        {concession.ville}, {concession.region?.nom}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                        <span>🚗 {concession.nombre_vehicules} véhicules</span>
                                        <span>👁️ {concession.nombre_vues} vues</span>
                                    </div>
                                </div>
                                <Link
                                    to={`/my-concessions/edit/${concession.id}`}
                                    className="text-gray-400 hover:text-gray-600 transition"
                                >
                                    <FaEdit />
                                </Link>
                            </div>
                        </div>
                    ))}

                    {concessions.length > 3 && (
                        <Link
                            to="/my-concessions"
                            className="block text-center text-sm text-teal-600 hover:text-teal-700 font-medium pt-2"
                        >
                            Voir {concessions.length - 3} autre{concessions.length - 3 > 1 ? 's' : ''} →
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}