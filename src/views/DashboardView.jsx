// src/views/DashboardView.jsx
import React from 'react';
import WeightCard from './widgets/WeightCard';
import HistoryChart from './widgets/HistoryChart';
// On importe le nouveau widget
import GoalChart from './widgets/GoalChart'; 

const DashboardView = () => {
  const fakeData = {
      weight: 1.2,
      totalWeight: 45.8,
      date: "06/03/2026 à 10h45"
  };

  return (
    <div style={styles.dashboard}>
      <div style={styles.welcome}>
        <h1 style={styles.title}>Bonjour Evan ! 👋</h1>
        <p style={styles.subtitle}>Voici le résumé de votre poubelle connectée.</p>
      </div>

      {/* La grille principale : 
        Sur PC, on aura 3 colonnes : Poids du jour | Total | Objectif
      */}
      <div style={styles.topGrid}>
        <WeightCard weight={fakeData.weight} date={fakeData.date} />
        
        {/* On réutilise le composant WeightCard pour afficher le Total ! */}
        <WeightCard weight={fakeData.totalWeight} date="Depuis le 1er Mars" />
        
        <GoalChart />
      </div>

      {/* La grille du bas : 
        On met le grand graphique d'historique en dessous pour qu'il prenne toute la largeur 
      */}
      <div style={styles.bottomGrid}>
        <HistoryChart />
      </div>

    </div>
  );
};

const styles = {
    dashboard: { padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%' },
    welcome: { marginBottom: '30px' },
    title: { fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '5px' },
    subtitle: { color: 'var(--text-muted)' },
    topGrid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '20px' // Espace avec le graphique du bas
    },
    bottomGrid: {
        height: '350px' // On force une belle hauteur pour la courbe
    }
};

export default DashboardView;