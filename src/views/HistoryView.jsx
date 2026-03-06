// src/views/HistoryView.jsx
import React from 'react';

const HistoryView = () => {
  // Fausses données simulant l'API de ton collègue
  const historyData = [
    { id: 1, date: '06/03/2026', time: '10:45', weight: 1.2, status: 'Validé' },
    { id: 2, date: '05/03/2026', time: '18:20', weight: 0.8, status: 'Validé' },
    { id: 3, date: '05/03/2026', time: '14:10', weight: 2.1, status: 'Alerte Masse' },
    { id: 4, date: '04/03/2026', time: '09:05', weight: 1.5, status: 'Validé' },
    { id: 5, date: '02/03/2026', time: '20:30', weight: 3.5, status: 'Validé' },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Historique des pesées 📊</h1>
      <p style={styles.subtitle}>Retrouvez ici tout l'historique de votre poubelle Octo'System.</p>

      <div className="table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Heure</th>
              <th>Masse (kg)</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {/* On boucle sur les données pour créer les lignes du tableau */}
            {historyData.map((item) => (
              <tr key={item.id}>
                <td>{item.date}</td>
                <td>{item.time}</td>
                <td style={{ fontWeight: 'bold' }}>{item.weight} kg</td>
                <td>
                  {/* Petit badge dynamique selon le statut */}
                  <span className={`badge ${item.status === 'Validé' ? 'badge-success' : 'badge-warning'}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px', maxWidth: '1000px', margin: '0 auto', width: '100%' },
  title: { fontSize: '1.8rem', color: '#2C3E50', marginBottom: '5px' },
  subtitle: { color: '#888', marginBottom: '30px' }
};

export default HistoryView;