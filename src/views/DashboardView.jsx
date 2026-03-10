// src/views/DashboardView.jsx
import React, { useState } from 'react';
import WeightCard from './widgets/WeightCard';
import HistoryChart from './widgets/HistoryChart';
import GoalChart from './widgets/GoalChart'; 

// On récupère la prop "user" envoyée par App.jsx
const DashboardView = ({ user }) => {
  // On commence à 34.5kg pour que tu puisses tester l'alerte rapidement (Max 40kg)
  const [latestMass, setLatestMass] = useState(1.2);
  const [totalMass, setTotalMass] = useState(34.5); 
  const [latestDate, setLatestDate] = useState("Aujourd'hui à 10h45");
  
  const [chartLabels, setChartLabels] = useState(['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']);
  const [chartData, setChartData] = useState([1.2, 1.5, 0.8, 2.1, 1.0, 3.5, 1.2]);

  // Constantes du capteur
  const MAX_CAPACITY = 40;
  const ALERT_THRESHOLD = 36; // 90% de 40kg

  // 1. Fonction : Ajouter un déchet
  const simulateDrop = () => {
    const newMass = parseFloat((Math.random() * 2.4 + 0.1).toFixed(2));
    
    setLatestMass(newMass);
    setTotalMass(prevTotal => {
        // Sécurité : on ne dépasse pas la capacité max
        const newTotal = prevTotal + newMass;
        return newTotal > MAX_CAPACITY ? MAX_CAPACITY : parseFloat(newTotal.toFixed(2));
    });
    
    const now = new Date();
    const timeString = `${now.getHours()}h${now.getMinutes().toString().padStart(2, '0')}`;
    setLatestDate(`Aujourd'hui à ${timeString}`);

    setChartLabels(prev => [...prev.slice(1), timeString]);
    setChartData(prev => [...prev.slice(1), newMass]);
  };

  // 2. Fonction : Vider la poubelle
  const emptyBin = () => {
    setTotalMass(0);
    setLatestMass(0);
    setLatestDate("Poubelle vidée à l'instant");
  };

  return (
    <div style={styles.dashboard}>
      
      {/* L'ALERTE TOAST */}
      {totalMass >= ALERT_THRESHOLD && (
        <div className="toast-alert">
          <i className="fa-solid fa-triangle-exclamation" style={{fontSize: '1.5rem'}}></i>
          <div>
            Alerte Capteur : {totalMass} kg atteints.<br/>
            <span style={{fontSize: '0.9rem', fontWeight: 'normal'}}>Veuillez vider la poubelle.</span>
          </div>
        </div>
      )}

      <div style={styles.headerRow}>
        <div style={styles.welcome}>
          {/* C'EST ICI QU'ON AFFICHE LE PRÉNOM DYNAMIQUE */}
          <h1 style={styles.title}>Bonjour {user ? user.prenom : 'Utilisateur'} ! 👋</h1>
          <p style={styles.subtitle}>Supervision en temps réel du capteur de masse.</p>
        </div>
        
        {/* Les boutons d'action */}
        <div className="action-buttons">
            <button onClick={emptyBin} className="danger-btn">
              <i className="fa-solid fa-trash-can"></i> Vider la poubelle
            </button>
            <button onClick={simulateDrop} style={styles.simulateBtn}>
              <i className="fa-solid fa-plus"></i> Simuler un jet
            </button>
        </div>
      </div>

      <div style={styles.topGrid}>
        <WeightCard title="DERNIÈRE MASSE" weight={latestMass} date={latestDate} />
        <WeightCard title="MASSE TOTALE" weight={totalMass} date="Depuis le dernier vidage" />
        <GoalChart currentMass={totalMass} maxCapacity={MAX_CAPACITY} />
      </div>

      <div style={styles.bottomGrid}>
        <HistoryChart labels={chartLabels} dataPoints={chartData} />
      </div>

    </div>
  );
};

const styles = {
    dashboard: { padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '30px', gap: '15px' },
    title: { fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '5px' },
    subtitle: { color: 'var(--text-muted)' },
    simulateBtn: { background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(76, 175, 80, 0.3)', transition: 'transform 0.1s, background 0.2s', display: 'flex', gap: '10px', alignItems: 'center' },
    topGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' },
    bottomGrid: { height: '350px' }
};

export default DashboardView;