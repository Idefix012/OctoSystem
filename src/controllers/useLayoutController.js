// src/controllers/useLayoutController.js
import { useState } from 'react';
import { menuItems } from '../models/MenuModel';

// Ce hook agit comme le CONTRÔLEUR
export const useLayoutController = () => {
    // Gestion de l'état (Ouvert/Fermé)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Logique métier
    const toggleMenu = () => setIsSidebarOpen(!isSidebarOpen);
    const closeMenu = () => setIsSidebarOpen(false);

    // On prépare ce qu'on envoie à la Vue
    // On peut aussi ajouter d'autres logiques ici plus tard (ex: changer de page)
    return {
        isSidebarOpen,
        toggleMenu,
        closeMenu,
        menuItems // On passe aussi les données du modèle
    };
};