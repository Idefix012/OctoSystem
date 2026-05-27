// src/views/SidebarView.jsx
import React from 'react';
// Importation de NavLink, un composant de React Router conçu spécifiquement 
// pour la navigation avec gestion intégrée de l'état "actif" (URL courante).
import { NavLink } from 'react-router-dom'; // 1. On importe NavLink

/**
 * Composant SidebarView
 * Composant de présentation (Dumb Component) gérant le menu latéral de navigation.
 * Il gère son affichage responsive via les propriétés injectées par son composant parent.
 */
const SidebarView = ({ isOpen, onClose, menuItems }) => {
  return (
    // Utilisation d'un Fragment (<>...</>) pour retourner de multiples éléments racines (Overlay + Sidebar)
    <>
      {/* Overlay sombre agissant comme masque de fond sur les écrans mobiles.
          L'événement onClick permet de fermer la barre latérale en cliquant en dehors (hors focus). */}
      <div className={`overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>

      {/* Conteneur principal de la barre de navigation.
          La classe CSS 'open' est conditionnée par la prop isOpen pour déclencher l'animation d'ouverture. */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
            <h3>Menu</h3>
            <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <nav>
          <ul className="nav-links">
            {/* Itération sur le modèle de données du menu injecté via la prop menuItems */}
            {menuItems.map((item) => (
              /* 2. On entoure notre <li> avec un NavLink */
              /* Le composant NavLink intercepte le clic pour faire du routage côté client (SPA)
                 sans recharger complètement la page HTTP. */
              <NavLink 
                key={item.id} // Identifiant unique indispensable pour l'algorithme de réconciliation de React
                to={item.path} 
                onClick={onClose} /* Ferme le menu sur mobile quand on clique ! */
                // Injection dynamique de la classe 'active-link' si l'URL courante correspond au 'path'
                className={({ isActive }) => isActive ? 'active-link' : ''}
              >
                {/* Utilisation du pattern "Render Prop" fourni par NavLink.
                    Permet d'exposer la variable 'isActive' au scope enfant pour styliser le <li> interne. */}
                {({ isActive }) => (
                  <li className={isActive ? 'active' : ''}>
                    {/* Interpolation de la chaîne pour injecter dynamiquement la classe de l'icône FontAwesome */}
                    <i className={`fa-solid ${item.icon}`}></i> {item.label}
                  </li>
                )}
              </NavLink>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default SidebarView;
