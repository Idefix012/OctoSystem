// src/views/SidebarView.jsx
import React from 'react';
import { NavLink } from 'react-router-dom'; // 1. On importe NavLink

const SidebarView = ({ isOpen, onClose, menuItems }) => {
  return (
    <>
      <div className={`overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
            <h3>Menu</h3>
            <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <nav>
          <ul className="nav-links">
            {menuItems.map((item) => (
              /* 2. On entoure notre <li> avec un NavLink */
              <NavLink 
                key={item.id} 
                to={item.path} 
                onClick={onClose} /* Ferme le menu sur mobile quand on clique ! */
                className={({ isActive }) => isActive ? 'active-link' : ''}
              >
                {({ isActive }) => (
                  <li className={isActive ? 'active' : ''}>
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