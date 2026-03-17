// src/views/DashboardView.jsx
import React, { useState, useEffect } from 'react';
import WeightCard from './widgets/WeightCard';
import HistoryChart from './widgets/HistoryChart';
import GoalChart from './widgets/GoalChart'; 

const DashboardView = ({ user }) => {
  const [latestMass, setLatestMass] = useState(0);
  const [totalMass, setTotalMass] = useState(0); 
  const [latestDate, setLatestDate] = useState("Chargement...");
  
  const [chartLabels, setChartLabels] = useState([]);
  const [chartData, setChartData] = useState([]);

  const MAX_CAPACITY = 40;
  const ALERT_THRESHOLD = 36; 

// ==========================================
  // RÉCUPÉRATION DES DONNÉES DE L'API (GET)
  // ==========================================
  // Fonction pour calculer la date du jour au format YYYY-MM-DD exigé par l'API
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // ==========================================
  // RÉCUPÉRATION DES DONNÉES DE L'API (GET)
  // ==========================================
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
            // 1. On récupère la pesée la plus récente
            const dernierePesee = donnees[0];
            const poidsActuelKg = parseFloat(dernierePesee.poids) / 1000;
            
            // Mise à jour de la carte "Dernière Masse"
            setLatestMass(poidsActuelKg);
            
            // 2. LOGIQUE DE REMPLISSAGE (Masse Totale)
            // Si le poids actuel est 0, cela signifie que la poubelle est vide.
            // Sinon, la masse totale affichée correspond au poids actuel dans la poubelle.
            if (poidsActuelKg === 0) {
              setTotalMass(0);
            } else {
              setTotalMass(parseFloat(poidsActuelKg.toFixed(2)));
            }

            // 3. Mise à jour de l'heure
            const dateObj = new Date(dernierePesee.date);
            const heure = `${dateObj.getHours()}h${dateObj.getMinutes().toString().padStart(2, '0')}`;
            setLatestDate(`Aujourd'hui à ${heure}`);

            // 4. Préparation du graphique
            const donneesChronologiques = [...donnees].reverse();
            setChartLabels(donneesChronologiques.map(item => {
              const d = new Date(item.date);
              return `${d.getHours()}h${d.getMinutes().toString().padStart(2, '0')}`;
            }));
            setChartData(donneesChronologiques.map(item => parseFloat(item.poids) / 1000));
            
          } else {
            // Cas où le tableau est vide (pas de données du tout)
            setLatestDate("Poubelle vide aujourd'hui");
            setLatestMass(0);
            setTotalMass(0);
            setChartLabels([]);
            setChartData([]);
          }
        } else if (response.status === 404) {
          // Gestion du cas où aucune donnée n'existe pour aujourd'hui
          setLatestDate("Poubelle vide aujourd'hui");
          setLatestMass(0);
          setTotalMass(0);
          setChartLabels([]);
          setChartData([]);
        }
      } catch (err) {
        console.error("Erreur réseau silencieuse (Polling) :", err);
      }
    };

    // Premier appel immédiat
    fetchDashboardData();

    // Polling toutes les 5 secondes
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 5000);

    // Nettoyage à la fermeture du composant
    return () => clearInterval(intervalId);

  }, []);

  // Le reste reste inchangé pour l'instant (ajout visuel de démo)
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
          <h1 style={styles.title}>Bonjour {user ? user.prenom : 'Utilisateur'} ! 👋</h1>
          <p style={styles.subtitle}>Supervision en temps réel du capteur de masse.</p>
        </div>
        
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
        <WeightCard title="MASSE TOTALE" weight={totalMass} date="Depuis 24h" />
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