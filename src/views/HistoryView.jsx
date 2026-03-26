// src/views/HistoryView.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const HistoryView = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ÉTATS POUR LA SÉLECTION DE POUBELLE
  const [garbages, setGarbages] = useState([]);
  const [selectedDeveui, setSelectedDeveui] = useState('');

  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayString());

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const jour = d.getDate().toString().padStart(2, '0');
    const mois = (d.getMonth() + 1).toString().padStart(2, '0');
    const annee = d.getFullYear();
    const heures = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    return {
      jour: `${jour}/${mois}/${annee}`,
      heure: `${heures}h${minutes}`
    };
  };

  // 1. CHARGEMENT DE LA LISTE DES POUBELLES
  useEffect(() => {
    const fetchGarbages = async () => {
      try {
        const token = localStorage.getItem('octo_token');
        if (!token) return;

        const response = await fetch(`http://192.168.1.143:5000/garbages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const listGarbages = await response.json();
          setGarbages(listGarbages);
          if (listGarbages.length > 0) {
            setSelectedDeveui(listGarbages[0].deveui);
          } else {
            setIsLoading(false); // S'il n'y a pas de poubelle
          }
        }
      } catch (err) {
        console.error("Erreur récupération poubelles :", err);
      }
    };
    
    fetchGarbages();
  }, []);

  // 2. CHARGEMENT DE L'HISTORIQUE (Dépend de la date ET de la poubelle)
  useEffect(() => {
    const fetchHistoryByDate = async () => {
      if (!selectedDate || !selectedDeveui) {
        setHistoryData([]);
        return;
      }

      setIsLoading(true);

      try {
        const token = localStorage.getItem('octo_token');
        if (!token) return;

        // Requête avec date ET deveui
        const response = await fetch(`http://192.168.1.143:5000/garbage/data_by_date?date=${selectedDate}&deveui=${selectedDeveui}`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const donnees = await response.json();
          setHistoryData(donnees);
        } else {
          setHistoryData([]);
        }
      } catch (err) {
        console.error("Erreur réseau :", err);
        setHistoryData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoryByDate();
  }, [selectedDate, selectedDeveui]);

  const chartDataPrep = [...historyData].reverse(); 
  
  const dataGraphique = {
    labels: chartDataPrep.map(item => formatDate(item.date).heure),
    datasets: [
      {
        label: 'Masse mesurée (kg)',
        data: chartDataPrep.map(item => (parseFloat(item.weight) / 1000).toFixed(2)),
        borderColor: '#2ecc71', 
        backgroundColor: 'rgba(46, 204, 113, 0.2)', 
        borderWidth: 3,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#2ecc71',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const optionsGraphique = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 14, weight: 'bold' },
        callbacks: {
          label: (context) => ` ${context.raw} kg`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Masse (kg)', color: 'var(--text-muted)' },
        grid: { color: 'var(--border-color)', borderDash: [5, 5] }
      },
      x: {
        title: { display: true, text: 'Heure', color: 'var(--text-muted)' },
        grid: { display: false }
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Historique des pesées 📊</h1>
        <p style={styles.subtitle}>Consultez le détail de l'activité de vos capteurs par date.</p>
      </div>

      {garbages.length === 0 && !isLoading ? (
        <div style={styles.emptyStateCard}>
          <i className="fa-solid fa-link-slash" style={{ fontSize: '3rem', color: 'var(--border-color)', marginBottom: '15px' }}></i>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Aucun capteur détecté</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            Veuillez associer une poubelle connectée pour consulter l'historique.
          </p>
          <button onClick={() => navigate('/settings')} style={styles.primaryBtn}>
            Aller dans les paramètres
          </button>
        </div>
      ) : (
        <>
          <div style={styles.filterBar}>
            {/* SÉLECTEUR DE POUBELLE */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>
                <i className="fa-solid fa-microchip"></i> Capteur :
              </label>
              <select 
                value={selectedDeveui} 
                onChange={(e) => setSelectedDeveui(e.target.value)}
                style={styles.selectInput}
              >
                {garbages.map((g, index) => (
                  <option key={g.deveui} value={g.deveui}>Capteur {index + 1} ({g.deveui})</option>
                ))}
              </select>
            </div>

            {/* SÉLECTEUR DE DATE */}
            <div style={styles.filterGroup}>
              <label htmlFor="dateFilter" style={styles.filterLabel}>
                <i className="fa-solid fa-calendar-day"></i> Date :
              </label>
              <input 
                type="date" 
                id="dateFilter"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={styles.dateInput}
                max={getTodayString()} 
              />
            </div>

            <div style={styles.statsCount}>
              <span>{historyData.length} mesure(s)</span>
            </div>
          </div>

          {isLoading ? (
            <div style={styles.card}>
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
                <p style={{ marginTop: '15px' }}>Chargement des données...</p>
              </div>
            </div>
          ) : historyData.length === 0 ? (
            <div style={styles.card}>
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-folder-open fa-2x"></i>
                <p style={{ marginTop: '15px' }}>Aucune donnée mesurée pour le {selectedDate.split('-').reverse().join('/')}.</p>
              </div>
            </div>
          ) : (
            <>
              <div style={{ ...styles.card, marginBottom: '20px', padding: '20px' }}>
                <h3 style={styles.sectionTitle}>Évolution sur la journée</h3>
                <div style={styles.chartContainer}>
                  <Line data={dataGraphique} options={optionsGraphique} />
                </div>
              </div>

              <div style={styles.card}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Heure</th>
                        <th style={styles.th}>Poids total détecté</th>
                        <th style={styles.th}>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((item, index) => {
                        const dateFormatee = formatDate(item.date);
                        const poidsKg = (parseFloat(item.weight) / 1000).toFixed(2);
                        
                        return (
                          <tr key={index} style={styles.tr}>
                            <td style={styles.td}>
                              <i className="fa-regular fa-calendar" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
                              {dateFormatee.jour}
                            </td>
                            <td style={styles.td}>
                              <i className="fa-regular fa-clock" style={{ color: 'var(--text-muted)', marginRight: '8px' }}></i>
                              {dateFormatee.heure}
                            </td>
                            <td style={{ ...styles.td, fontWeight: 'bold' }}>
                              {poidsKg} kg
                            </td>
                            <td style={styles.td}>
                              <span style={styles.badgeSuccess}>Synchronisé</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '20px', maxWidth: '1000px', margin: '0 auto', width: '100%' },
  header: { marginBottom: '20px' },
  title: { fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '5px' },
  subtitle: { color: 'var(--text-muted)' },
  
  filterBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '15px 20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', flexWrap: 'wrap', gap: '15px' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
  filterLabel: { color: 'var(--text-main)', fontWeight: 'bold', fontSize: '0.9rem' },
  dateInput: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'inherit', cursor: 'pointer' },
  selectInput: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--primary)', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 'bold' },
  
  statsCount: { color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 'bold', background: 'var(--bg-main)', padding: '6px 12px', borderRadius: '20px' },
  card: { background: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid var(--border-color)' },
  sectionTitle: { marginTop: 0, marginBottom: '20px', color: 'var(--text-main)', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' },
  chartContainer: { height: '300px', width: '100%', position: 'relative' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '16px', background: 'var(--bg-main)', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border-color)' },
  tr: { borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' },
  td: { padding: '16px', color: 'var(--text-main)', fontSize: '1rem' },
  badgeSuccess: { background: 'rgba(46, 204, 113, 0.15)', color: '#27ae60', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' },
  
  emptyStateCard: { background: 'var(--bg-card)', border: '1px dashed var(--border-color)', borderRadius: '16px', padding: '50px 20px', textAlign: 'center', marginTop: '20px' },
  primaryBtn: { background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
};

export default HistoryView;