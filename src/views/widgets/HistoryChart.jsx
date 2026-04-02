// src/views/widgets/HistoryChart.jsx
import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Il accepte maintenant labels et dataPoints
const HistoryChart = ({ labels, dataPoints }) => {
  
  const data = {
    labels: labels, // Utilise les jours dynamiques
    datasets: [
      {
        label: 'Masse jetée (kg)',
        data: dataPoints, // Utilise les masses dynamiques
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: false } }, scales: { y: { beginAtZero: true } } };

  return (
    <div style={styles.chartContainer}>
      <h4 style={styles.title}>ÉVOLUTION EN TEMPS RÉEL</h4>
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
    position: 'relative'
  }
};

export default HistoryChart;