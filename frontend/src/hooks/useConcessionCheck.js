import { useState, useEffect } from 'react';
import concessionService from '../services/concessionService';

export const useConcessionCheck = () => {
    const [hasValidConcession, setHasValidConcession] = useState(false);
    const [concessions, setConcessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [validConcession, setValidConcession] = useState(null);

    useEffect(() => {
        checkConcessions();
    }, []);

    const checkConcessions = async () => {
        try {
            setLoading(true);
            const data = await concessionService.getMesConcessions();
            const allConcessions = data.concessions || [];

            setConcessions(allConcessions);

            // Trouver la première concession validée
            const valid = allConcessions.find(c => c.statut === 'VALIDE');
            setValidConcession(valid || null);
            setHasValidConcession(!!valid);
        } catch (error) {
            console.error('Erreur vérification concessions:', error);
            setHasValidConcession(false);
        } finally {
            setLoading(false);
        }
    };

    return {
        hasValidConcession,
        concessions,
        validConcession,
        loading,
        refresh: checkConcessions
    };
};