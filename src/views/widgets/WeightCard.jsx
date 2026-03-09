// src/views/widgets/WeightCard.jsx
import React from 'react';

const WeightCard = ({ weight, date }) => {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h4 style={styles.title}>DERNIÈRE PESÉE</h4>
        <div style={styles.iconBox}>
            <i className="fa-solid fa-weight-hanging"></i>
        </div>
      </div>

      <div style={styles.content}>
        <span style={styles.value}>{weight}</span>
        <span style={styles.unit}> kg</span>
      </div>

      <div style={styles.footer}>
        <p style={styles.date}>{date}</p>
      </div>
    </div>
  );
};

const styles = {
  card: { background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '10px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  title: { fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' },
  iconBox: { width: '35px', height: '35px', borderRadius: '8px', background: '#E8F5E9', color: '#4CAF50', display: 'grid', placeItems: 'center' },
  content: { marginTop: '5px' },
  value: { fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)' },
  unit: { fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: '500' },
  footer: { marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '10px' },
  date: { fontSize: '0.8rem', color: '#aaa', margin: 0 }
};

export default WeightCard;