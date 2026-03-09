// src/views/widgets/GoalChart.jsx
import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// On enregistre les éléments spécifiques pour les graphiques circulaires
ChartJS.register(ArcElement, Tooltip, Legend);

const GoalChart = () => {
  // Les fausses données : 75% trié, 25% restant
  const data = {
    labels: ['Trié', 'Reste à trier'],
    datasets: [
      {
        data: [75, 25],
        backgroundColor: ['#4CAF50', '#F5F5F5'], // Vert Octo et Gris très clair
        borderWidth: 0,
        cutout: '75%', // C'est ce qui crée le "trou" au centre de l'anneau
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12 } },
      tooltip: { enabled: true }
    },
  };

  return (
    <div style={styles.card}>
      <h4 style={styles.title}>OBJECTIF HEBDO</h4>
      
      <div style={styles.chartWrapper}>
        <Doughnut data={data} options={options} />
        
        {/* Le texte superposé au centre de l'anneau */}
        <div style={styles.centerText}>
            <span style={styles.percentage}>75%</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: 'var(--bg-card)',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '250px'
  },
  title: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: 'bold',
    marginBottom: '15px',
    textAlign: 'center'
  },
  chartWrapper: {
    flexGrow: 1,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  centerText: {
    position: 'absolute',
    top: '40%', // Un peu plus haut pour laisser la place à la légende en bas
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center'
  },
  percentage: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'var(--text-main)'
  }
};

export default GoalChart;