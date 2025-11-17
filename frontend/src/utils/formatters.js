/**
 * Formater un montant en FCFA
 */
export const formatCurrency = (amount) => {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
};

/**
 * Formater une date
 */
export const formatDate = (dateString, format = 'short') => {
    const date = new Date(dateString);

    if (format === 'short') {
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short'
        });
    }

    if (format === 'long') {
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }

    return date.toLocaleDateString('fr-FR');
};

/**
 * Formater un nombre avec séparateurs
 */
export const formatNumber = (number) => {
    return number.toLocaleString('fr-FR');
};

/**
 * Formater un pourcentage
 */
export const formatPercentage = (value, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
};

/**
 * Raccourcir un grand nombre (K, M)
 */
export const formatCompactNumber = (number) => {
    if (number >= 1000000) {
        return `${(number / 1000000).toFixed(1)}M`;
    }
    if (number >= 1000) {
        return `${(number / 1000).toFixed(0)}K`;
    }
    return number.toString();
};