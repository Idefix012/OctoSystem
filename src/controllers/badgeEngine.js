// src/controllers/badgeEngine.js

export const calculateBadges = (totalKg, rank, friendsCount) => {
  return [
    {
      id: 'starter',
      name: 'Premier pas 🌱',
      description: 'Inscription au réseau éco-citoyen.',
      icon: 'fa-seedling',
      color: '#2ecc71',
      isPermanent: true, // <-- Sauvegardé en BDD
      unlocked: true 
    },
    {
      id: 'zero_waste',
      name: 'Zéro Déchet 🕊️',
      description: 'Statut du mois : Aucun déchet enregistré. Maintenez le cap !',
      icon: 'fa-leaf',
      color: '#1abc9c',
      isPermanent: false, // <-- Volatil, calculé en direct !
      unlocked: totalKg === 0
    },
    {
      id: 'expert_tri',
      name: 'Expert du Tri ♻️',
      description: 'Statut du mois : Moins de 5 kg jetés.',
      icon: 'fa-recycle',
      color: '#27ae60',
      isPermanent: false, 
      unlocked: totalKg >= 0 && totalKg <= 5
    },
    {
      id: 'lightweight',
      name: 'Poids Plume 🪶',
      description: 'Statut du mois : Moins de 15 kg jetés.',
      icon: 'fa-feather',
      color: '#f1c40f',
      isPermanent: false, 
      unlocked: totalKg >= 0 && totalKg <= 15
    },
    {
      id: 'social',
      name: 'Sociable 🤝',
      description: 'Avoir au moins 3 amis validés dans son réseau.',
      icon: 'fa-user-group',
      color: '#3498db',
      isPermanent: true, // <-- Sauvegardé en BDD
      unlocked: friendsCount >= 3
    },
    {
      id: 'influencer',
      name: 'Star du Quartier 🌟',
      description: 'Avoir 10 amis ou plus dans son réseau.',
      icon: 'fa-users-rays',
      color: '#e67e22',
      isPermanent: true, 
      unlocked: friendsCount >= 10
    },
    {
      id: 'podium',
      name: 'Challenger 🥉',
      description: 'Statut du mois : Être dans le Top 3 du classement.',
      icon: 'fa-award',
      color: '#d35400',
      isPermanent: false, 
      unlocked: rank >= 1 && rank <= 3 && friendsCount >= 2
    },
    {
      id: 'champion',
      name: 'Le Roi du Tri 👑',
      description: 'Statut du mois : Être numéro 1 du classement.',
      icon: 'fa-crown',
      color: '#9b59b6',
      isPermanent: false, 
      unlocked: rank === 1 && friendsCount > 0
    }
  ];
};