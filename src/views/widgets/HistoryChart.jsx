// src/views/widgets/HistoryChart.jsx
import React from 'react';
// On importe les outils de Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// On "enregistre" ces outils pour que React puisse les utiliser
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
);

const HistoryChart = () => {
  // 1. Les données du graphique (plus tard, l'API d'Evan les remplacera)
  const data = {
    labels: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'], // L'axe X (Jours)
    datasets: [
      {
        label: 'Masse jetée (kg)',
        data: [1.2, 1.5, 0.8, 2.1, 1.0, 3.5, 1.2], // L'axe Y (Les valeurs)
        borderColor: '#4CAF50', // Vert Octo'System
        backgroundColor: 'rgba(76, 175, 80, 0.2)', // Vert transparent sous la courbe
        tension: 0.4, // Rend la courbe plus douce/arrondie
        fill: true, // Remplit le dessous de la courbe
      },
    ],
  };

  // 2. Les options de présentation (pour que ce soit joli et responsive)
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Permet au graphique de s'adapter à la taille de la div
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div style={styles.chartContainer}>
      <h4 style={styles.title}>ÉVOLUTION DE LA SEMAINE</h4>
      {/* La zone du graphique doit avoir une hauteur définie */}
      <div style={styles.chartWrapper}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

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
    position: 'relative'
  }
};

export default HistoryChart;