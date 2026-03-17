// src/views/HistoryView.jsx
import React, { useState, useEffect } from 'react';

const HistoryView = () => {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // On calcule la date d'aujourd'hui au format YYYY-MM-DD pour l'affichage par défaut
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // L'état contient maintenant la date d'aujourd'hui par défaut
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  // Ce useEffect s'exécute au chargement ET à chaque fois que 'selectedDate' change
  useEffect(() => {
    const fetchHistoryByDate = async () => {
      if (!selectedDate) {
        setHistoryData([]);
        return;
      }

      setIsLoading(true);

      try {
        const token = localStorage.getItem('octo_token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        // On appelle la nouvelle route avec le paramètre ?date=
        const response = await fetch(`http://192.168.1.143:5000/garbages/data_by_date?date=${selectedDate}`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const donnees = await response.json();
          setHistoryData(donnees);
        } else if (response.status === 404) {
          // Gestion du cas prévu par Evan : Aucune donnée pour cette date
          setHistoryData([]);
        } else {
          console.error("Erreur inattendue de l'API");
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
  }, [selectedDate]); // Le tableau de dépendances écoute la date !

  // Formatage de la date pour l'affichage dans le tableau React
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Historique des pesées 📊</h1>
        <p style={styles.subtitle}>Consultez le détail de l'activité de votre poubelle par date.</p>
      </div>

      {/* Barre de filtre connectée à l'API */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label htmlFor="dateFilter" style={styles.filterLabel}>
            <i className="fa-solid fa-calendar-day"></i> Sélectionner une date :
          </label>
          <input 
            type="date" 
            id="dateFilter"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.dateInput}
            max={getTodayString()} // Empêche de sélectionner des dates dans le futur
          />
        </div>
        <div style={styles.statsCount}>
          <span>{historyData.length} pesée(s) trouvée(s)</span>
        </div>
      </div>

      <div style={styles.card}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
            <p style={{ marginTop: '15px' }}>Recherche dans la base de données...</p>
          </div>
        ) : historyData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-folder-open fa-2x"></i>
            <p style={{ marginTop: '15px' }}>Aucune pesée enregistrée pour la date du {selectedDate.split('-').reverse().join('/')}.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Heure</th>
                  <th style={styles.th}>Poids ajouté</th>
                  <th style={styles.th}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((item, index) => {
                  const dateFormatee = formatDate(item.date);
                  const poidsKg = (parseFloat(item.poids) / 1000).toFixed(2);
                  
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
                        + {poidsKg} kg
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
        )}
      </div>
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
  statsCount: { color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 'bold', background: 'var(--bg-main)', padding: '6px 12px', borderRadius: '20px' },
  card: { background: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid var(--border-color)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '16px', background: 'var(--bg-main)', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border-color)' },
  tr: { borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' },
  td: { padding: '16px', color: 'var(--text-main)', fontSize: '1rem' },
  badgeSuccess: { background: 'rgba(46, 204, 113, 0.15)', color: '#27ae60', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }
};

export default HistoryView;