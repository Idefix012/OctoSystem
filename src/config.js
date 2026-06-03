// src/config.js
// Point d'accès unique à la configuration runtime.
// L'URL de l'API (REST + Socket.IO) est lue depuis la variable d'environnement
// VITE_API_URL définie dans le fichier .env à la racine du projet.
export const API_URL = import.meta.env.VITE_API_URL;
