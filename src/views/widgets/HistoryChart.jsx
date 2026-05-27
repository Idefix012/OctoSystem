// src/views/widgets/HistoryChart.jsx
import React from 'react';
// Importation modulaire des éléments spécifiques de chart.js. 
// Cette approche permet de n'importer que le strict nécessaire pour un graphique en courbe (Line).
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Enregistrement des modules dans l'instance globale de Chart.js pour permettre le rendu.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

/**
 * Composant HistoryChart
 * Composant d'affichage (Vue) dédié à la représentation graphique de l'historique des pesées.
 * Il reçoit ses données (props) du composant conteneur parent.
 */
// Il accepte maintenant labels et dataPoints
const HistoryChart = ({ labels, dataPoints }) => {
  
  // Formatage de l'objet data requis par la bibliothèque Chart.js
  const data = {
    labels: labels, // Utilise les jours dynamiques (Axe X)
    datasets: [
      {
        label: 'Masse jetée (kg)',
        data: dataPoints, // Utilise les masses dynamiques (Axe Y)
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        // La tension à 0.4 applique un lissage de type courbe de Bézier pour adoucir les angles
        tension: 0.4,
        // L'attribut fill activé remplit l'espace sous la courbe (nécessite le module Filler)
        fill: true,
      },
    ],
  };

  // Objet de configuration des options du graphique
  // maintainAspectRatio: false permet au canvas de s'étirer verticalement pour remplir le conteneur flex
  // scales.y.beginAtZero: true force l'axe des ordonnées à démarrer à 0 pour une lecture faussée de l'échelle
  const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: false } }, scales: { y: { beginAtZero: true } } };

  return (
    <div style={styles.chartContainer}>
      <h4 style={styles.title}>ÉVOLUTION EN TEMPS RÉEL</h4>
      {/* Conteneur avec un flexGrow défini dans le CSS pour que le canvas occupe tout l'espace restant sous le titre */}
      <div style={styles.chartWrapper}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

// ... (Garde exactement tes styles en dessous)

const styles = {
  chartContainer: {
    background: 'var(--bg-card)',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%', // Prend toute la hauteur disponible dans la grille
    minHeight: '300px'
  },
  title: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: 'bold',
    marginBottom: '15px'
  },
  chartWrapper: {
    flexGrow: 1, // Le graphique prend la place restante sous le titre
    position: 'relative' // Nécessaire pour que le canvas Chart.js gère correctement le redimensionnement responsive
  }
};

export default HistoryChart;
