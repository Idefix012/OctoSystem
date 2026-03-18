// src/views/DashboardView.jsx
import React, { useState, useEffect } from 'react';
import WeightCard from './widgets/WeightCard';
import HistoryChart from './widgets/HistoryChart';
import GoalChart from './widgets/GoalChart'; 

const DashboardView = ({ user }) => {
  // NOUVEAU : État de chargement initial
  const [isLoading, setIsLoading] = useState(true);

  const [latestMass, setLatestMass] = useState(0);
  const [totalMass, setTotalMass] = useState(0); 
  const [latestDate, setLatestDate] = useState("Chargement...");
  
  const [chartLabels, setChartLabels] = useState([]);
  const [chartData, setChartData] = useState([]);

  const MAX_CAPACITY = 40;
  const ALERT_THRESHOLD = 36; 

  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('octo_token');
        if (!token) return;

        const today = getTodayString();

        const response = await fetch(`http://192.168.1.143:5000/garbages/data_by_date?date=${today}`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const donnees = await response.json();
          
          if (Array.isArray(donnees) && donnees.length > 0) {
            const poidsPhysiqueKg = parseFloat(donnees[0].poids) / 1000;
            setTotalMass(parseFloat(poidsPhysiqueKg.toFixed(2)));

            let dernierJetKg = 0;
            if (donnees.length === 1) {
              dernierJetKg = poidsPhysiqueKg;
            } else {
              for (let i = 0; i < donnees.length - 1; i++) {
                const actuel = parseFloat(donnees[i].poids);
                const precedent = parseFloat(donnees[i+1].poids);
                if (actuel > precedent) {
                  dernierJetKg = (actuel - precedent) / 1000;
                  break; 
                }
              }
            }
            setLatestMass(parseFloat(dernierJetKg.toFixed(3)));

            const dateObj = new Date(donnees[0].date);
            const heure = `${dateObj.getHours()}h${dateObj.getMinutes().toString().padStart(2, '0')}`;
            setLatestDate(`Aujourd'hui à ${heure}`);

            const donneesChronologiques = [...donnees].reverse();
            setChartLabels(donneesChronologiques.map(item => {
              const d = new Date(item.date);
              return `${d.getHours()}h${d.getMinutes().toString().padStart(2, '0')}`;
            }));
            setChartData(donneesChronologiques.map(item => parseFloat(item.poids) / 1000));
            
          } else {
            setLatestDate("Poubelle vide aujourd'hui");
            setLatestMass(0);
            setTotalMass(0);
            setChartLabels([]);
            setChartData([]);
          }
        } else if (response.status === 404) {
          setLatestDate("Poubelle vide aujourd'hui");
          setLatestMass(0);
          setTotalMass(0);
          setChartLabels([]);
          setChartData([]);
        }
      } catch (err) {
        console.error("Erreur Polling Dashboard :", err);
      } finally {
        // NOUVEAU : On arrête le Skeleton Loader dès que la requête est terminée (succès ou échec)
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(intervalId);

  }, []);

  const simulateDrop = async () => {
    const newMass = parseFloat((Math.random() * 2.4 + 0.1).toFixed(2));
    setLatestMass(newMass);
    setTotalMass(prev => prev + newMass > MAX_CAPACITY ? MAX_CAPACITY : parseFloat((prev + newMass).toFixed(2)));
    const now = new Date();
    const timeString = `${now.getHours()}h${now.getMinutes().toString().padStart(2, '0')}`;
    setLatestDate(`Aujourd'hui à ${timeString}`);
    setChartLabels(prev => [...prev.slice(1), timeString]);
    setChartData(prev => [...prev.slice(1), newMass]);
  };

  const emptyBin = () => {
    setTotalMass(0);
    setLatestMass(0);
    setLatestDate("Poubelle vidée à l'instant");
  };

  return (
    <div style={styles.dashboard}>
      {totalMass >= ALERT_THRESHOLD && !isLoading && (
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
          <h1 style={styles.title}>Bonjour {user ? user.prenom : 'Utilisateur'} ! 👋</h1>
          <p style={styles.subtitle}>Supervision en temps réel du capteur de masse.</p>
        </div>
        
        <div className="action-buttons">
            <button onClick={emptyBin} className="danger-btn" disabled={isLoading}>
              <i className="fa-solid fa-trash-can"></i> Vider la poubelle
            </button>
            <button onClick={simulateDrop} style={styles.simulateBtn} disabled={isLoading}>
              <i className="fa-solid fa-plus"></i> Simuler un jet
            </button>
        </div>
      </div>

      <div style={styles.topGrid}>
        {/* NOUVEAU : Affichage conditionnel des Skeletons ou des vrais widgets */}
        {isLoading ? (
          <>
            <div className="skeleton skeleton-card"></div>
            <div className="skeleton skeleton-card"></div>
            <div className="skeleton skeleton-doughnut"></div>
          </>
        ) : (
          <>
            <WeightCard title="DERNIÈRE MASSE" weight={latestMass} date={latestDate} />
            <WeightCard title="MASSE TOTALE" weight={totalMass} date="Depuis 24h" />
            <GoalChart currentMass={totalMass} maxCapacity={MAX_CAPACITY} />
          </>
        )}
      </div>

      <div style={styles.bottomGrid}>
        {isLoading ? (
          <div className="skeleton skeleton-chart"></div>
        ) : (
          <HistoryChart labels={chartLabels} dataPoints={chartData} />
        )}
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