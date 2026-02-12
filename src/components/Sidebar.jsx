// src/components/Sidebar.jsx
import React from 'react';

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* OVERLAY (Le fond sombre quand le menu est ouvert) */}
      <div 
        className={`overlay ${isOpen ? 'active' : ''}`} 
        onClick={onClose}
      ></div>

      {/* LE MENU LATÉRAL */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
            <h3>Menu</h3>
            <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <nav>
          <ul className="nav-links">
            <li className="active"><i className="fa-solid fa-house"></i> Accueil</li>
            <li><i className="fa-solid fa-chart-line"></i> Historique</li>
            <li><i className="fa-solid fa-users"></i> Communauté</li>
            <li><i className="fa-solid fa-gear"></i> Paramètres</li>
          </ul>
        </nav>

        <div className="sidebar-footer">
            <p>Octo'System V1.0</p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;