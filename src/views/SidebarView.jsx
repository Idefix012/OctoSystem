import React from 'react';

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
            {/* Boucle sur les données du Modèle */}
            {menuItems.map((item) => (
                <li key={item.id} className={item.active ? 'active' : ''}>
                    <i className={`fa-solid ${item.icon}`}></i> {item.label}
                </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default SidebarView;