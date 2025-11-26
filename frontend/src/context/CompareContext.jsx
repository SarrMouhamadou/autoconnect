// OPTIONNEL : Context pour gérer la comparaison globalement dans l'app
// frontend/src/context/CompareContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CompareContext = createContext();

export function CompareProvider({ children }) {
    const [compareList, setCompareList] = useState([]);
    const navigate = useNavigate();

    // Charger depuis localStorage au démarrage
    useEffect(() => {
        const saved = localStorage.getItem('compareList');
        if (saved) {
            try {
                setCompareList(JSON.parse(saved));
            } catch (e) {
                console.error('Erreur lors du chargement de la liste de comparaison:', e);
            }
        }
    }, []);

    // Sauvegarder dans localStorage à chaque changement
    useEffect(() => {
        localStorage.setItem('compareList', JSON.stringify(compareList));
    }, [compareList]);

    // Ajouter un véhicule
    const addToCompare = (vehiculeId) => {
        if (compareList.length >= 4) {
            alert('Vous pouvez comparer maximum 4 véhicules.');
            return false;
        }

        if (compareList.includes(vehiculeId)) {
            alert('Ce véhicule est déjà dans la comparaison.');
            return false;
        }

        setCompareList([...compareList, vehiculeId]);
        return true;
    };

    // Retirer un véhicule
    const removeFromCompare = (vehiculeId) => {
        setCompareList(compareList.filter(id => id !== vehiculeId));
    };

    // Vérifier si un véhicule est dans la liste
    const isInCompare = (vehiculeId) => {
        return compareList.includes(vehiculeId);
    };

    // Aller vers la page de comparaison
    const goToCompare = () => {
        if (compareList.length === 0) {
            alert('Ajoutez au moins un véhicule pour comparer.');
            return;
        }

        navigate(`/compare?ids=${compareList.join(',')}`);
    };

    // Vider la liste
    const clearCompareList = () => {
        setCompareList([]);
    };

    const value = {
        compareList,
        addToCompare,
        removeFromCompare,
        isInCompare,
        goToCompare,
        clearCompareList,
        count: compareList.length,
    };

    return (
        <CompareContext.Provider value={value}>
            {children}
        </CompareContext.Provider>
    );
}

// Hook personnalisé
export function useCompare() {
    const context = useContext(CompareContext);
    if (!context) {
        throw new Error('useCompare doit être utilisé dans un CompareProvider');
    }
    return context;
}