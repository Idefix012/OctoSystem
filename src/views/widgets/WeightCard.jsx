// src/views/widgets/WeightCard.jsx
import React from 'react';

/**
 * Composant WeightCard
 * Composant de présentation (Dumb Component) dédié à l'affichage d'une métrique ponctuelle (la masse).
 * Il ne gère aucun état interne (stateless) et dépend exclusivement des données transmises par son parent.
 */
// Destructuration des props dans la signature du composant.
// On ajoute 'title' dans les paramètres avec une valeur par défaut (fallback) pour sécuriser l'affichage.
const WeightCard = ({ title = "DERNIÈRE PESÉE", weight, date }) => {
  return (
    // Application des règles de style inline définies dans l'objet 'styles'
    <div style={styles.card}>
      {/* En-tête du composant : titre et icône */}
      <div style={styles.header}>
        {/* On utilise la variable dynamique title ici via l'interpolation JSX */}
        <h4 style={styles.title}>{title}</h4>
        <div style={styles.iconBox}>
            <i className="fa-solid fa-weight-hanging"></i>
        </div>
      </div>

      {/* Corps du composant : affichage de la valeur numérique brute et de son unité */}
      <div style={styles.content}>
        <span style={styles.value}>{weight}</span>
        <span style={styles.unit}> kg</span>
      </div>

      {/* Pied de page : affichage de l'horodatage de la donnée */}
      <div style={styles.footer}>
        <p style={styles.date}>{date}</p>
      </div>
    </div>
  );
};

// Objet de configuration contenant les styles CSS-in-JS.
// L'écriture respecte la norme camelCase requise par React pour les propriétés CSS (ex: flexDirection, borderRadius).
const styles = {
  card: { background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '10px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  title: { fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' },
  iconBox: { width: '35px', height: '35px', borderRadius: '8px', background: '#E8F5E9', color: '#4CAF50', display: 'grid', placeItems: 'center' },
  content: { marginTop: '5px' },
  value: { fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)' },
  unit: { fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: '500' },
  footer: { marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '10px' },
  date: { fontSize: '0.8rem', color: '#aaa', margin: 0 }
};

export default WeightCard;