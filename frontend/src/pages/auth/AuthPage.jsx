import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AuthPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { register, login, error, setError } = useAuth();

    // Toggle entre Sign Up et Log In (via URL param)
    const mode = searchParams.get('mode') || 'login';
    const isLoginMode = mode === 'login';

    // État du formulaire
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        password2: '',
        nom: '',
        prenom: '',
        type_utilisateur: 'CLIENT'
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Carrousel d'images (côté droit)
    const [currentSlide, setCurrentSlide] = useState(0);
    // Carrousel de cartes (pour les superpositions)
    const [currentCard, setCurrentCard] = useState(0);
    // Direction de l'animation (pour l'effet slide)
    const [slideDirection, setSlideDirection] = useState('right');

    // Fonction pour passer à la carte suivante (clic sur flèche)
    const nextCard = () => {
        setCurrentCard((prev) => (prev + 1) % floatingCards.length);
    };

    const slides = [
        {
            image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop',
            theme: 'Location'
        },
        {
            image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop',
            theme: 'Vente'
        }
    ];

    // Cartes indépendantes (pas liées aux images)
    const floatingCards = [
        {
            title: 'Louez en Toute Simplicité',
            description: 'Découvrez notre large sélection de véhicules. Réservez en quelques clics et prenez la route !'
        },
        {
            title: 'Réservation Rapide',
            description: 'Trouvez le véhicule parfait en quelques minutes. Simple, rapide et sécurisé.'
        },
        {
            title: 'Prix Transparents',
            description: 'Aucun frais caché. Comparez les offres et choisissez la meilleure pour vous.'
        },
        {
            title: 'Vendez Plus Rapidement',
            description: 'Gérez vos véhicules, vos locations et développez votre activité avec AutoConnect.'
        },
        {
            title: 'Gestion Simplifiée',
            description: 'Tableau de bord intuitif pour gérer vos annonces, réservations et paiements.'
        },
        {
            title: 'Visibilité Maximale',
            description: 'Votre parc automobile visible par des milliers de clients potentiels.'
        }
    ];

    // Carrousel Sign Up - Étapes (0 à 4)
    const [signupStep, setSignupStep] = useState(0);


    // Auto-rotation carrousel IMAGES SEULEMENT (5 secondes)
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [slides.length]);

    // Auto-rotation CARTES SEULEMENT (3 secondes) - INDÉPENDANT
    useEffect(() => {
        const cardInterval = setInterval(() => {
            setCurrentCard((prev) => (prev + 1) % floatingCards.length);
        }, 3000);

        return () => clearInterval(cardInterval);
    }, [floatingCards.length]);

    // Reset du carrousel d'inscription quand on change de mode
    useEffect(() => {
        if (!isLoginMode) {
            setSignupStep(0);
        }
    }, [isLoginMode]);

    // Changer de mode (Login <-> Sign Up)
    const toggleMode = (newMode) => {
        setSearchParams({ mode: newMode });
        setError(null);
        setFormData({
            email: '',
            password: '',
            password2: '',
            nom: '',
            prenom: '',
            type_utilisateur: 'CLIENT'
        });
        setSignupStep(0);
    };

    // Gérer les changements dans les inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError(null);
    };

    // Navigation carrousel Sign Up
    // Navigation carrousel Sign Up avec direction
    const nextStep = () => {
        // Validation selon l'étape
        if (signupStep === 0 && !formData.type_utilisateur) {
            setError('Veuillez choisir un type de compte');
            return;
        }
        if (signupStep === 1 && (!formData.prenom || !formData.nom)) {
            setError('Veuillez remplir votre nom et prénom');
            return;
        }
        if (signupStep === 2 && !formData.email) {
            setError('Veuillez renseigner votre email');
            return;
        }
        if (signupStep === 2 && !/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Email invalide');
            return;
        }
        if (signupStep === 3) {
            if (!formData.password || !formData.password2) {
                setError('Veuillez remplir les deux champs mot de passe');
                return;
            }
            if (formData.password !== formData.password2) {
                setError('Les mots de passe ne correspondent pas');
                return;
            }
            if (formData.password.length < 8) {
                setError('Le mot de passe doit contenir au moins 8 caractères');
                return;
            }
        }

        setError(null);
        setSlideDirection('right'); // Animation vers la droite (suivant)
        setSignupStep(prev => Math.min(prev + 1, 4));
    };

    const prevStep = () => {
        setError(null);
        setSlideDirection('left'); // Animation vers la gauche (retour)
        setSignupStep(prev => Math.max(prev - 1, 0));
    };

    // Soumettre le formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLoginMode) {
            // LOGIN
            if (!formData.email || !formData.password) {
                setError('Veuillez remplir tous les champs');
                return;
            }

            try {
                setLoading(true);
                await login(formData.email, formData.password);
                navigate('/dashboard');
            } catch (err) {
                console.error('Erreur de connexion:', err);
            } finally {
                setLoading(false);
            }
        } else {
            // SIGN UP (depuis l'étape 4 - récapitulatif)
            try {
                setLoading(true);
                await register(formData);
                navigate('/dashboard');
            } catch (err) {
                console.error('Erreur d\'inscription:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    // Navigation carrousel images
    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    // Calculer le pourcentage de progression
    const progressPercentage = ((signupStep + 1) / 5) * 100;

    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{
                background: 'linear-gradient(135deg, #0A5C6B 0%, #0D7A8F 100%)',
                backgroundAttachment: 'fixed'
            }}
        >
            <div
                className="bg-white shadow-2xl rounded-[30px] overflow-hidden grid grid-cols-1 lg:grid-cols-2"
                style={{
                    width: 'calc(100% - 40vw)',
                    height: '75vh', // ← FIXE : hauteur constante
                    minWidth: '320px',
                    maxWidth: '1400px'
                }}
            >

                {/* ========================================
            GAUCHE - FORMULAIRE
        ======================================== */}
                <div className="h-full p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center bg-white overflow-hidden">
                    <div className="w-full max-w-xs">

                        {/* Header */}
                        <div className="mb-4 text-center">
                            <h1 className="text-xl font-semibold text-gray-900">AutoConnect</h1>
                            <p className="text-xs text-gray-500 mt-1">Drive More. Experience Life.</p>
                        </div>

                        {/* Toggle Sign Up / Log In - ESPACÉ */}
                        <div className="flex items-center justify-center gap-3 mb-5">
                            <button
                                type="button"
                                onClick={() => toggleMode('signup')}
                                className={`px-6 py-1.5 rounded-full border-2 text-sm font-medium transition ${!isLoginMode
                                        ? 'bg-black text-white border-black shadow-lg'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 bg-white'
                                    }`}
                            >
                                Sign Up
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleMode('login')}
                                className={`px-8 py-1.5 rounded-full text-sm font-medium transition border-2 ${isLoginMode
                                        ? 'bg-black text-white border-black shadow-lg'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 bg-white'
                                    }`}
                            >
                                Log In
                            </button>
                        </div>

                        {/* ========================================
                MODE LOGIN
            ======================================== */}
                        {isLoginMode ? (
                            <>
                                {/* Titre */}
                                <div className="mb-4 text-center">
                                    <h2 className="text-lg font-semibold text-gray-900">Journey Begins</h2>
                                    <p className="text-xs text-gray-500 mt-1">Log in with Open account</p>
                                </div>

                                {/* Social Login Buttons - PLUS PETITS */}
                                <div className="flex justify-center gap-2.5 mb-4">
                                    <button type="button" className="w-[38px] h-[38px] flex items-center justify-center bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition hover:-translate-y-0.5">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                        </svg>
                                    </button>
                                    <button type="button" className="w-[38px] h-[38px] flex items-center justify-center bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition hover:-translate-y-0.5">
                                        <svg className="w-5 h-5" viewBox="0 0 18 18">
                                            <path d="M17.64 9.20455C17.64 8.56682 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.9705 13.0009 12.9232 12.0477 13.5618V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4" />
                                            <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5618C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.96182 14.4205 5.23818 13.0182 4.50455 11.1873H1.515V13.5059C2.98182 16.2232 5.75091 18 9 18Z" fill="#34A853" />
                                            <path d="M4.50455 11.1873C4.28864 10.5832 4.16364 9.93045 4.16364 9.27273C4.16364 8.615 4.28864 7.96227 4.50455 7.35818V5.03955H1.515C0.542727 6.95318 0 8.98045 0 11.2727C0 13.565 0.542727 15.5923 1.515 17.4859L4.50455 15.1673V11.1873Z" fill="#FBBC05" />
                                            <path d="M9 4.125C10.3214 4.125 11.5077 4.59545 12.4786 5.52273L15.0218 2.98C13.4618 1.51955 11.4255 0.545455 9 0.545455C5.75091 0.545455 2.98182 2.32273 1.515 5.03955L4.50455 7.35818C5.23818 5.52727 6.96182 4.125 9 4.125Z" fill="#EA4335" />
                                        </svg>
                                    </button>
                                    <button type="button" className="w-[38px] h-[38px] flex items-center justify-center bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition hover:-translate-y-0.5">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    </button>
                                </div>

                                {/* OR Divider */}
                                <div className="flex items-center my-3">
                                    <hr className="w-full border-gray-300" />
                                    <span className="px-3 text-xs font-medium text-gray-400">or</span>
                                    <hr className="w-full border-gray-300" />
                                </div>

                                {/* Message d'erreur */}
                                {error && (
                                    <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
                                        {error}
                                    </div>
                                )}

                                {/* Formulaire Login - PLUS PETIT */}
                                <form onSubmit={handleSubmit} className="space-y-2.5 w-full">
                                    <div className="text-left">
                                        <label className="text-xs font-medium text-gray-600 mb-1 block">Email *</label>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            placeholder="exemple@email.com"
                                        />
                                    </div>

                                    <div className="text-left">
                                        <label className="text-xs font-medium text-gray-600 mb-1 block">Password *</label>
                                        <div className="relative">
                                            <input
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="block w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? '👁️' : '👁️‍🗨️'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs pt-1">
                                        <div className="flex items-center">
                                            <input
                                                id="remember-me"
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="h-3.5 w-3.5 text-black border-gray-300 rounded focus:ring-black"
                                            />
                                            <label htmlFor="remember-me" className="ml-2 text-gray-600">Remember me</label>
                                        </div>
                                        <button type="button" className="font-medium text-gray-900 hover:text-gray-700 underline-offset-2 hover:underline">
                                            Forgot Password?
                                        </button>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-1.5 px-4 rounded-full text-sm font-medium text-white bg-black hover:bg-gray-900 transition shadow-lg disabled:opacity-50"
                                        >
                                            {loading ? 'Logging in...' : 'Log In'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <>
                                {/* ========================================
                    MODE SIGN UP - CARROUSEL AVEC ANIMATIONS
                ======================================== */}

                                {/* Barre de progression */}
                                <div className="mb-4">
                                    <div className="flex justify-center items-center gap-2 mb-2">
                                        {[0, 1, 2, 3, 4].map((step) => (
                                            <div
                                                key={step}
                                                className={`h-2 rounded-full transition-all ${step === signupStep ? 'bg-black w-6' : 'bg-gray-300 w-2'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-center text-xs text-gray-500">Étape {signupStep + 1}/5</p>
                                </div>

                                {/* Message d'erreur */}
                                {error && (
                                    <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
                                        {error}
                                    </div>
                                )}

                                {/* Contenu selon l'étape AVEC ANIMATION */}
                                <div className="relative overflow-hidden min-h-[280px]">
                                    {[0, 1, 2, 3, 4].map((stepIndex) => (
                                        <div
                                            key={stepIndex}
                                            className={`absolute w-full transition-all duration-500 ease-in-out ${stepIndex === signupStep
                                                    ? 'translate-x-0 opacity-100'
                                                    : stepIndex < signupStep
                                                        ? slideDirection === 'right' ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'
                                                        : slideDirection === 'right' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0'
                                                }`}
                                        >
                                            {/* ÉTAPE 0 : Type d'utilisateur */}
                                            {stepIndex === 0 && (
                                                <div className="text-center">
                                                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Rejoignez AutoConnect</h2>
                                                    <p className="text-xs text-gray-500 mb-4">Choisissez votre profil</p>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, type_utilisateur: 'CLIENT' }));
                                                                setTimeout(() => {
                                                                    setSlideDirection('right');
                                                                    nextStep();
                                                                }, 300);
                                                            }}
                                                            className={`p-4 rounded-xl border-2 transition ${formData.type_utilisateur === 'CLIENT'
                                                                    ? 'border-black bg-gray-50'
                                                                    : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <div className="text-3xl mb-2">👤</div>
                                                            <div className="font-medium text-gray-900 text-sm">Client</div>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, type_utilisateur: 'CONCESSIONNAIRE' }));
                                                                setTimeout(() => {
                                                                    setSlideDirection('right');
                                                                    nextStep();
                                                                }, 300);
                                                            }}
                                                            className={`p-4 rounded-xl border-2 transition ${formData.type_utilisateur === 'CONCESSIONNAIRE'
                                                                    ? 'border-black bg-gray-50'
                                                                    : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <div className="text-3xl mb-2">🏢</div>
                                                            <div className="font-medium text-gray-900 text-sm">Concessionnaire</div>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ÉTAPE 1 : Nom et Prénom */}
                                            {stepIndex === 1 && (
                                                <div>
                                                    <h2 className="text-lg font-semibold text-gray-900 mb-1 text-center">Vos informations</h2>
                                                    <p className="text-xs text-gray-500 mb-3 text-center">Comment vous appelez-vous ?</p>

                                                    <div className="space-y-2.5">
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-600 mb-1 block">Prénom *</label>
                                                            <input
                                                                name="prenom"
                                                                type="text"
                                                                required
                                                                value={formData.prenom}
                                                                onChange={handleChange}
                                                                className="block w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                                placeholder="Aminata"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-600 mb-1 block">Nom *</label>
                                                            <input
                                                                name="nom"
                                                                type="text"
                                                                required
                                                                value={formData.nom}
                                                                onChange={handleChange}
                                                                className="block w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                                placeholder="Diop"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ÉTAPE 2 : Email */}
                                            {stepIndex === 2 && (
                                                <div>
                                                    <h2 className="text-lg font-semibold text-gray-900 mb-1 text-center">Votre email</h2>
                                                    <p className="text-xs text-gray-500 mb-3 text-center">Nous l'utiliserons pour vous contacter</p>

                                                    <div>
                                                        <label className="text-xs font-medium text-gray-600 mb-1 block">Adresse email *</label>
                                                        <input
                                                            name="email"
                                                            type="email"
                                                            required
                                                            value={formData.email}
                                                            onChange={handleChange}
                                                            className="block w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                            placeholder="exemple@email.com"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* ÉTAPE 3 : Mots de passe */}
                                            {stepIndex === 3 && (
                                                <div>
                                                    <h2 className="text-lg font-semibold text-gray-900 mb-1 text-center">Sécurisez votre compte</h2>
                                                    <p className="text-xs text-gray-500 mb-3 text-center">Choisissez un mot de passe sécurisé</p>

                                                    <div className="space-y-2.5">
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-600 mb-1 block">Mot de passe *</label>
                                                            <div className="relative">
                                                                <input
                                                                    name="password"
                                                                    type={showPassword ? "text" : "password"}
                                                                    required
                                                                    value={formData.password}
                                                                    onChange={handleChange}
                                                                    className="block w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                                    placeholder="Minimum 8 caractères"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                                                                >
                                                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-600 mb-1 block">Confirmer le mot de passe *</label>
                                                            <input
                                                                name="password2"
                                                                type={showPassword ? "text" : "password"}
                                                                required
                                                                value={formData.password2}
                                                                onChange={handleChange}
                                                                className="block w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                                placeholder="Confirmez le mot de passe"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ÉTAPE 4 : Récapitulatif - PLUS COMPACT */}
                                            {stepIndex === 4 && (
                                                <div>
                                                    <h2 className="text-base font-semibold text-gray-900 mb-1 text-center">Vérifiez vos informations</h2>
                                                    <p className="text-xs text-gray-500 mb-3 text-center">Dernière étape !</p>

                                                    <div className="bg-gray-50 rounded-lg p-2.5 space-y-1.5 mb-3">
                                                        <div className="flex items-center justify-between py-1.5 border-b border-gray-200">
                                                            <span className="text-[10px] text-gray-600">Type de compte</span>
                                                            <span className="text-xs font-medium text-gray-900">
                                                                {formData.type_utilisateur === 'CLIENT' ? '👤 Client' : '🏢 Concessionnaire'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between py-1.5 border-b border-gray-200">
                                                            <span className="text-[10px] text-gray-600">Nom complet</span>
                                                            <span className="text-xs font-medium text-gray-900">{formData.prenom} {formData.nom}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between py-1.5 border-b border-gray-200">
                                                            <span className="text-[10px] text-gray-600">Email</span>
                                                            <span className="text-xs font-medium text-gray-900 truncate max-w-[180px]">{formData.email}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between py-1.5">
                                                            <span className="text-[10px] text-gray-600">Mot de passe</span>
                                                            <span className="text-xs font-medium text-gray-900">••••••••</span>
                                                        </div>
                                                    </div>

                                                    <form onSubmit={handleSubmit}>
                                                        <button
                                                            type="submit"
                                                            disabled={loading}
                                                            className="w-full py-2 px-4 rounded-full text-sm font-medium text-white bg-black hover:bg-gray-900 transition shadow-lg disabled:opacity-50"
                                                        >
                                                            {loading ? 'Création...' : 'Créer mon compte ✓'}
                                                        </button>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Boutons de navigation - PLUS COURTS ET CENTRÉS */}
                                {signupStep !== 0 && signupStep !== 4 && (
                                    <div className="flex items-center justify-center gap-3 mt-3">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="w-32 py-1.5 px-3 rounded-full text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                                        >
                                            ← Retour
                                        </button>
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="w-32 py-1.5 px-3 rounded-full text-sm font-medium text-white bg-black hover:bg-gray-900 transition"
                                        >
                                            Suivant →
                                        </button>
                                    </div>
                                )}

                                {/* Bouton retour pour étape 4 - PLUS COURT ET CENTRÉ */}
                                {signupStep === 4 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="w-48 mx-auto block mt-2 py-1.5 px-3 rounded-full text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                                    >
                                        ← Modifier mes informations
                                    </button>
                                )}
                            </>
                        )}

                    </div>
                </div>

                {/* ========================================
            DROITE - IMAGE CARROUSEL (INCHANGÉ)
        ======================================== */}
                <div className="hidden lg:block relative bg-white p-5 rounded-r-[30px]">
                    <div className="relative h-full bg-gradient-to-br from-teal-600 to-teal-800 overflow-hidden rounded-[20px]">
                        {/* Images du carrousel */}
                        <div className="relative h-full">
                            {slides.map((slide, slideIndex) => (
                                <div
                                    key={slideIndex}
                                    className={`absolute inset-0 transition-opacity duration-1000 ${slideIndex === currentSlide ? 'opacity-100' : 'opacity-0'
                                        }`}
                                >
                                    {/* Image */}
                                    <img
                                        src={slide.image}
                                        alt={slide.theme}
                                        className="absolute inset-0 w-full h-full object-cover opacity-90"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>


                                    {/* Cartes flottantes empilées (INDÉPENDANTES de l'image) */}
                                    <div className="absolute top-8 right-8 w-[240px]">
                                        {floatingCards.map((card, cardIndex) => {
                                            // Calculer le décalage pour l'effet d'empilement
                                            const isActive = cardIndex === currentCard;
                                            const isNext = cardIndex === (currentCard + 1) % floatingCards.length;
                                            const isAfterNext = cardIndex === (currentCard + 2) % floatingCards.length;

                                            // Position selon l'état de la carte
                                            let zIndex = 10;
                                            let opacity = 0;
                                            let translateX = 0;
                                            let translateY = 0;
                                            let scale = 0.9;

                                            if (isActive) {
                                                zIndex = 30;
                                                opacity = 1;
                                                translateX = 0;
                                                translateY = 0;
                                                scale = 1;
                                            } else if (isNext) {
                                                zIndex = 20;
                                                opacity = 0.7;
                                                translateX = -6;
                                                translateY = 6;
                                                scale = 0.95;
                                            } else if (isAfterNext) {
                                                zIndex = 10;
                                                opacity = 0.4;
                                                translateX = -12;
                                                translateY = 12;
                                                scale = 0.9;
                                            }

                                            return (
                                                <div
                                                    key={cardIndex}
                                                    className="absolute top-0 left-0 w-full transition-all duration-500 ease-in-out"
                                                    style={{
                                                        zIndex,
                                                        opacity,
                                                        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                                                        animation: isActive ? 'float 3s ease-in-out infinite' : 'none'
                                                    }}
                                                >
                                                    {/* Superposition (overlay) - seulement pour les cartes derrière */}
                                                    {!isActive && (
                                                        <div className="absolute -top-2 -left-2 w-full h-full bg-white/20 backdrop-blur-sm rounded-xl shadow-md"></div>
                                                    )}

                                                    {/* Carte principale */}
                                                    <div className="relative bg-white/95 backdrop-blur-sm rounded-xl p-3.5 shadow-xl">
                                                        <div>
                                                            <h3 className="text-xs font-bold text-gray-900 leading-tight mb-1.5 pr-6">
                                                                {card.title}
                                                            </h3>
                                                            <p className="text-[9px] text-gray-600 leading-relaxed line-clamp-3">
                                                                {card.description}
                                                            </p>
                                                        </div>

                                                        {/* Flèche vers la droite (seulement sur la carte active) - CLIQUABLE */}
                                                        {isActive && (
                                                            <button
                                                                onClick={nextCard}
                                                                className="absolute bottom-2.5 right-2.5 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-md hover:bg-red-600 transition"
                                                            >
                                                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Texte en bas */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-white leading-tight mb-2 drop-shadow-lg">
                                    Escape the Ordinary,<br />
                                    Embrace the Journey!
                                </h2>
                                <p className="text-white/90 text-sm font-light">
                                    Experience the road your way!
                                </p>
                            </div>

                            {/* Navigation carrousel */}
                            <div className="flex items-center justify-between">
                                {/* Dots indicateurs pour les images */}
                                <div className="flex gap-2">
                                    {slides.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setCurrentSlide(index);
                                                setCurrentCard(0);
                                            }}
                                            className={`h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-6' : 'bg-white/50 w-2'
                                                }`}
                                        />
                                    ))}
                                </div>



                                {/* Boutons navigation */}
                                {/* Boutons navigation IMAGES */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={prevSlide}
                                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition border border-white/30"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition border border-white/30"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
        </div>
    );
}