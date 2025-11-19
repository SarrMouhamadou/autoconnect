import { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

// Créer le contexte
const AuthContext = createContext(null);

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
   */
  const isClient = () => user?.type_utilisateur === 'CLIENT';
  const isConcessionnaire = () => user?.type_utilisateur === 'CONCESSIONNAIRE';
  const isAdmin = () => user?.type_utilisateur === 'ADMINISTRATEUR';

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
    <AuthContext.Provider value=
    {value}>
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