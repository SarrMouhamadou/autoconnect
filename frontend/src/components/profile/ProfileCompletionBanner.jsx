import { Link } from 'react-router-dom';

export default function ProfileCompletionBanner({ user, progress }) {
  // Ne rien afficher si l'utilisateur est validé
  if (user.statut_compte === 'VALIDE') {
    return null;
  }

  // Bannière pour profil incomplet
  if (user.statut_compte === 'INCOMPLETE') {
    const pourcentage = progress?.pourcentage_completion || user.pourcentage_completion || 0;
    
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-r-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              {user.type_utilisateur === 'CONCESSIONNAIRE' 
                ? '⚠️ Complétez votre profil professionnel'
                : '⚠️ Complétez votre profil'}
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Votre profil est incomplet à <span className="font-bold">{pourcentage}%</span>.
                {user.type_utilisateur === 'CONCESSIONNAIRE' && (
                  <> Complétez vos informations d'entreprise pour commencer à proposer vos véhicules.</>
                )}
              </p>
              
              {/* Barre de progression */}
              <div className="mt-3 w-full bg-yellow-200 rounded-full h-2.5">
                <div 
                  className="bg-yellow-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${pourcentage}%` }}
                />
              </div>
              
              {/* Liste des étapes manquantes */}
              {progress?.etapes_manquantes && progress.etapes_manquantes.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium mb-2">Étapes manquantes :</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    {progress.etapes_manquantes.slice(0, 3).map((etape, index) => (
                      <li key={index}>
                        {etape.titre} <span className="text-yellow-600">({etape.points})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Link
                to="/profile/edit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition"
              >
                Compléter mon profil →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bannière pour en attente de validation
  if (user.statut_compte === 'EN_ATTENTE_VALIDATION') {
    return (
      <div className="bg-orange-50 border-l-4 border-orange-400 p-6 mb-6 rounded-r-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-orange-800">
              ⏳ Compte en attente de validation
            </h3>
            <div className="mt-2 text-sm text-orange-700">
              <p>
                Votre profil est complet ! Un administrateur va vérifier vos informations sous 24-48h. 
                Vous pourrez ajouter des véhicules et gérer vos locations après validation.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bannière pour compte rejeté
  if (user.statut_compte === 'REJETE') {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-6 rounded-r-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              ❌ Compte non validé
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p className="mb-2">
                Votre demande a été rejetée pour la raison suivante :
              </p>
              <div className="bg-red-100 border border-red-200 rounded p-3 italic">
                {user.raison_rejet || 'Aucune raison spécifiée'}
              </div>
              <p className="mt-2">
                Veuillez corriger les informations et soumettre à nouveau votre profil.
              </p>
            </div>
            <div className="mt-4">
              <Link
                to="/profile/edit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
              >
                Modifier mes informations →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
