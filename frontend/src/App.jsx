import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-primary-600 mb-4">
          🚗 AutoConnect
        </h1>
        <p className="text-gray-600">
          Plateforme de gestion de concessions automobiles
        </p>
        <div className="mt-6 space-x-4">
          <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition">
            Catalogue
          </button>
          <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition">
            Connexion
          </button>
        </div>
      </div>
    </div>
  );
}

export default App