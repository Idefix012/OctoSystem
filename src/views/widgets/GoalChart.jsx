// src/views/widgets/GoalChart.jsx
import React from 'react';
// CORRECTION ICI : on importe bien depuis 'chart.js'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'; 
import { Doughnut } from 'react-chartjs-2';

// On enregistre les éléments
ChartJS.register(ArcElement, Tooltip, Legend);

const GoalChart = ({ currentMass, maxCapacity = 40 }) => {
  
  // Calcul du pourcentage de remplissage
  const percentage = Math.min(100, Math.round((currentMass / maxCapacity) * 100));
  const remaining = Math.max(0, 100 - percentage);

  // Si on dépasse 90% (36kg), la jauge devient rouge (Danger), sinon elle est verte
  const isDanger = currentMass >= (maxCapacity * 0.9);
  const chartColor = isDanger ? '#e74c3c' : '#4CAF50';

  const data = {
    labels: ['Rempli', 'Espace libre'],
    datasets: [
      {
        data: [percentage, remaining],
        backgroundColor: [chartColor, 'var(--bg-main)'], 
        borderWidth: 0,
        cutout: '75%', 
      },
    ],
  };

  const options = { 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { 
      legend: { position: 'bottom', labels: { boxWidth: 12 } }, 
      tooltip: { enabled: true } 
    } 
  };

  return (
    <div style={styles.card}>
      <h4 style={styles.title}>CAPACITÉ ({maxCapacity} kg MAX)</h4>
      <div style={styles.chartWrapper}>
        <Doughnut data={data} options={options} />
        <div style={styles.centerText}>
            <span style={{...styles.percentage, color: isDanger ? '#e74c3c' : 'var(--text-main)'}}>
              {percentage}%
            </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: { background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '250px' },
  title: { fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' },
  chartWrapper: { flexGrow: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  centerText: { position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' },
  percentage: { fontSize: '2rem', fontWeight: 'bold' }
};

export default GoalChart;