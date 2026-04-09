import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import '../styles/dev-page.css'

export function TutorDevPage() {
  const navigate = useNavigate()

  return (
    <div className="dev-page">
      <button 
        className="dev-back-btn"
        onClick={() => navigate('/')}
        aria-label="Voltar para a página inicial"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="dev-container">
        <div className="dev-content">
          <h1>Portal do Tutor</h1>
          <p>Esta página ainda está sendo desenvolvida</p>
          <p className="dev-description">Estamos trabalhando para trazer a melhor experiência para você. Em breve, você poderá gerenciar seus pets e agendamentos de forma ainda mais fácil!</p>
        </div>
      </div>
    </div>
  )
}
