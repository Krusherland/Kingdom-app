import { useEffect } from 'react'
import plebeianImg from '../assets/Plebeian.png'
import alchemistImg from '../assets/Alchemist.png'
import guardImg from '../assets/Royal-Guard.png'
import outsiderImg from '../assets/Outsider.png'
import './RoleCard.css'

const ROLES = {
  PLEBEIAN: {
    name: 'Plebeyo',
    icon: '⚖',
    img: plebeianImg,
    color: 'var(--role-plebeian)',
    ability: 'Cada noche puedes votar para eliminar a un sospechoso.',
    flavor: 'El pueblo habla. Tu voto es tu única arma.',
  },
  ALCHEMIST: {
    name: 'Alquimista',
    icon: '⚗',
    img: alchemistImg,
    color: 'var(--role-alchemist)',
    ability: 'Cada noche puedes proteger a un jugador del peligro.',
    flavor: 'Tu elixir puede salvar a un inocente de la oscuridad.',
  },
  ROYAL_GUARD: {
    name: 'Guardia Real',
    icon: '🛡',
    img: guardImg,
    color: 'var(--role-guard)',
    ability: 'Cada noche puedes revelar la identidad de un jugador.',
    flavor: 'Sirves al reino. El conocimiento es tu escudo.',
  },
  OUTSIDER: {
    name: 'Forastero',
    icon: '🗡',
    img: outsiderImg,
    color: 'var(--role-outsider)',
    ability: 'Cada noche puedes eliminar a un inocente del juego.',
    flavor: 'Eres el intruso. Oculta tu verdad. Dibuja para confundir.',
  },
}

export default function RoleCard({ role, word, onDismiss }) {
  const cfg = ROLES[role] ?? ROLES.PLEBEIAN

  useEffect(() => {
    const t = setTimeout(onDismiss, 10000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className="overlay-backdrop" onClick={onDismiss}>
      <div
        className="role-card"
        style={{ '--rc': cfg.color }}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={cfg.img} alt={cfg.name} className="role-card__img" />
        <div className="role-card__name">{cfg.name}</div>
        <div className="role-card__flavor">"{cfg.flavor}"</div>
        <div className="divider" />
        <p className="role-card__ability-label">Tu habilidad nocturna</p>
        <p className="role-card__ability">{cfg.ability}</p>
        <div className="divider" />
        <p className="role-card__word-label">Tu palabra</p>
        <div className="role-card__word">{word ?? '—'}</div>
        <button className="btn btn-gold btn-lg role-card__btn" onClick={onDismiss}>
          Entendido
        </button>
        <p className="role-card__hint text-muted">O espera 10 segundos</p>
      </div>
    </div>
  )
}
