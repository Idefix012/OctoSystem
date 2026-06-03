// src/controllers/useLayoutController.js
// Importation du Hook natif useState pour la gestion de l'état local
import { useState } from 'react';
// Importation des données statiques représentant le Modèle (MVC)
import { menuItems } from '../models/MenuModel';

/**
 * Hook personnalisé (Custom Hook) useLayoutController
 * Agit en tant que Contrôleur dans l'architecture MVC pour gérer la logique d'état de la mise en page.
 * Son rôle est d'encapsuler la logique d'ouverture et de fermeture du menu latéral (Sidebar)
 * afin de séparer la logique métier des composants d'affichage (Vues).
 */
// Ce hook agit comme le CONTRÔLEUR
export const useLayoutController = () => {
    // Initialisation de l'état booléen déterminant la visibilité de la barre latérale.
    // La valeur par défaut est 'false' (menu fermé au chargement initial).
    // Gestion de l'état (Ouvert/Fermé)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Logique métier
    // Fonction de mutation permettant d'inverser l'état actuel (bascule ouvert/fermé).
    const toggleMenu = () => setIsSidebarOpen(!isSidebarOpen);
    
    // Fonction de mutation forçant la fermeture du menu (assignation stricte de l'état à false).
    const closeMenu = () => setIsSidebarOpen(false);

    // Retourne un objet contenant la valeur de l'état, les fonctions de mutation et les données du Modèle.
    // Cette structure d'objet permet une déstructuration ciblée dans les composants consommateurs (ex: App.jsx).
    // On prépare ce qu'on envoie à la Vue
    // On peut aussi ajouter d'autres logiques ici plus tard (ex: changer de page)
    return {
        isSidebarOpen,
        toggleMenu,
        closeMenu,
        menuItems // On passe aussi les données du modèle
    };
};