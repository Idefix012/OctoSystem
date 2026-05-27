// src/views/widgets/GoalChart.jsx
import React from 'react';
// Importation des modules nécessaires depuis chart.js pour construire un graphique en anneau (Doughnut)
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'; 
import { Doughnut } from 'react-chartjs-2';

// Enregistrement des éléments graphiques dans l'instance globale de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Composant GoalChart
 * Affiche une jauge de remplissage sous forme de graphique en anneau (Doughnut).
 * Il prend en paramètres la masse actuelle (currentMass) et la capacité maximale de la poubelle (maxCapacity).
 */
const GoalChart = ({ currentMass, maxCapacity = 40 }) => {
  
  // Calcul du pourcentage de remplissage.
  // Math.min et Math.max garantissent que les valeurs restent dans des limites cohérentes (0 à 100),
  // même si currentMass dépasse exceptionnellement maxCapacity.
  const percentage = Math.min(100, Math.round((currentMass / maxCapacity) * 100));
  const remaining = Math.max(0, 100 - percentage);

  // Évaluation conditionnelle du seuil d'alerte. 
  // Si le remplissage atteint ou dépasse 90% de la capacité maximale, l'état bascule en mode Danger.
  const isDanger = currentMass >= (maxCapacity * 0.9);
  // Définition dynamique de la couleur principale du graphique (rouge si danger, vert sinon).
  const chartColor = isDanger ? '#e74c3c' : '#4CAF50';

  // Configuration de la structure de données attendue par Chart.js
  const data = {
    labels: ['Rempli', 'Espace libre'],
    datasets: [
      {
        // Les données sont injectées dans le tableau correspondant aux labels
        data: [percentage, remaining],
        // Application de la couleur calculée pour la partie remplie, et d'une couleur de fond pour le reste
        backgroundColor: [chartColor, 'var(--bg-main)'], 
        borderWidth: 0,
        // Épaisseur de l'anneau : 75% du rayon est évidé
        cutout: '75%', 
      },
    ],
  };

  // Configuration des options d'affichage et de réactivité du graphique
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
      {/* Conteneur du graphique positionné en relatif pour permettre le centrage absolu du texte */}
      <div style={styles.chartWrapper}>
        <Doughnut data={data} options={options} />
        {/* Affichage textuel du pourcentage au centre de l'anneau avec changement de couleur dynamique */}
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
