/**
 * Construit l'URL complète pour une image
 */
export const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
  return `${baseUrl}${path}`;
};

/**
 * Obtient les initiales d'un nom
 */
export const getInitials = (prenom, nom) => {
  const firstInitial = prenom?.[0]?.toUpperCase() || '';
  const lastInitial = nom?.[0]?.toUpperCase() || '';
  return firstInitial + lastInitial || 'U';
};