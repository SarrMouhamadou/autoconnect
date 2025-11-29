import { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

// Créer le contexte
const AuthContext = createContext(null);

/**
 * Vérifier le type d'utilisateur
 */
const isClient = () => {
  return user?.type_utilisateur === 'CLIENT';
};

const isConcessionnaire = () => {
  // Si is_superuser ou is_staff est true, ce n'est PAS un concessionnaire
  if (user?.is_superuser || user?.is_staff) {
    return false;
  }
  return user?.type_utilisateur === 'CONCESSIONNAIRE';
};

const isAdmin = () => {
  // Vérifier d'abord is_superuser et is_staff
  if (user?.is_superuser === true || user?.is_staff === true) {
    return true;
  }

  // Puis vérifier le type_utilisateur et niveau_acces
  return (
    user?.type_utilisateur === 'ADMINISTRATEUR' ||
    user?.niveau_acces === 'SUPER'
  );
};
/**
 * Provider du contexte d'authentification
 * Enveloppe l'application et fournit l'état d'authentification à tous les composants
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger l'utilisateur au montage du composant
  useEffect(() => {
    loadUser();
  }, []);

  /**
   * Charger l'utilisateur depuis le localStorage
   */
  const loadUser = async () => {
    try {
      setLoading(true);

      // Vérifier si un token existe
      if (authService.isAuthenticated()) {
        const savedUser = authService.getUser();

        if (savedUser) {
          setUser(savedUser);

          // Optionnel : Récupérer le profil depuis l'API pour s'assurer qu'il est à jour
          try {
            const profile = await authService.getProfile();
            setUser(profile);
          } catch (err) {
            console.error('Erreur lors du chargement du profil:', err);
            // Si erreur 401, le token est invalide
            if (err.status === 401) {
              logout();
            }
          }
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement de l\'utilisateur:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inscription
   */
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const data = await authService.register(userData);
      setUser(data.user);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Connexion
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const data = await authService.login(email, password);
      setUser(data.user);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Déconnexion
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  /**
   * Mettre à jour le profil
   */
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const data = await authService.updateProfile(userData);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Vérifier si l'utilisateur est connecté
   */
  const isAuthenticated = () => {
    return !!user && authService.isAuthenticated();
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du profil:', error);
    }
  };

  /**
   * Vérifier le type d'utilisateur
   * ✅ CORRIGÉ : Gestion de ADMINISTRATEUR et niveau_acces SUPER
   */
  const isClient = () => {
    return user?.type_utilisateur === 'CLIENT';
  };

  const isConcessionnaire = () => {
    return user?.type_utilisateur === 'CONCESSIONNAIRE' && !isAdmin();
  };

  const isAdmin = () => {
    // ✅ Vérifie à la fois type_utilisateur ET niveau_acces
    return (
      user?.type_utilisateur === 'ADMINISTRATEUR' ||
      user?.niveau_acces === 'SUPER' ||
      user?.is_superuser === true
    );
  };

  // Valeurs exposées par le contexte
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    refreshUser,
    isAuthenticated,
    isClient,
    isConcessionnaire,
    isAdmin,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personnalisé pour utiliser le contexte d'authentification
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }

  return context;
};

export default AuthContext;