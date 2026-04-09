import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import '../styles/landing.css'

export function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleVeterinarian = () => {
    navigate('/login')
    setShowDropdown(false)
  }

  const handleTutor = () => {
    navigate('/tutor-portal')
    setShowDropdown(false)
  }

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-container">
          <div className="landing-logo">iougurt</div>
          <nav className="landing-nav">
            <a href="#sobre" className="landing-nav-link">Sobre</a>
            <a href="#planos" className="landing-nav-link">Planos</a>
          </nav>
          <div className="landing-login-container">
            <button 
              className="landing-login-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              Login <ChevronDown size={16} className={`dropdown-icon ${showDropdown ? 'open' : ''}`} />
            </button>
            {showDropdown && (
              <div className="landing-dropdown">
                <button 
                  className="landing-dropdown-item"
                  onClick={handleVeterinarian}
                >
                  Veterinário
                </button>
                <button 
                  className="landing-dropdown-item"
                  onClick={handleTutor}
                >
                  Tutor
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-content">
          <h1>Transforme a gestão da sua clínica com inteligência !</h1>
          <button 
            className="landing-cta-btn"
            onClick={() => navigate('/register')}
          >
            Comece Agora!
          </button>
        </div>
      </section>

      <section id="sobre" className="landing-section landing-about">
        <div className="landing-section-container">
          <h2>Sobre o iougurt</h2>
          <p>
            O iougurt é a solução completa para gerenciar sua clínica veterinária com inteligência e eficiência. 
            Com recursos avançados de agendamento, gestão de pacientes e histórico de atendimentos, 
            você terá tudo que precisa para oferecer o melhor serviço aos seus clientes.
          </p>
          <div className="about-features">
            <div className="feature">
              <h3>Gerenciamento Completo</h3>
              <p>Organize todos os seus pacientes e agendamentos em um único lugar.</p>
            </div>
            <div className="feature">
              <h3>Atendimento Eficiente</h3>
              <p>Aumente a produtividade da sua clínica com ferramentas inteligentes.</p>
            </div>
            <div className="feature">
              <h3>Histórico Detalhado</h3>
              <p>Mantenha um registro completo do histórico de cada paciente.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="planos" className="landing-section landing-plans">
        <div className="landing-section-container">
          <h2>Nossos Planos</h2>
          <div className="plans-grid">
            <div className="plan-card">
              <h3>Plano Básico</h3>
              <p className="plan-price">R$ 49<span>/mês</span></p>
              <ul className="plan-features">
                <li>Até 50 pacientes</li>
                <li>Agendamentos básicos</li>
                <li>Suporte por email</li>
              </ul>
              <button className="plan-btn">Escolher Plano</button>
            </div>
            <div className="plan-card featured">
              <div className="featured-badge">Mais Popular</div>
              <h3>Plano Profissional</h3>
              <p className="plan-price">R$ 99<span>/mês</span></p>
              <ul className="plan-features">
                <li>Pacientes ilimitados</li>
                <li>Agendamentos avançados</li>
                <li>Relatórios detalhados</li>
                <li>Suporte prioritário</li>
              </ul>
              <button className="plan-btn plan-btn-featured">Escolher Plano</button>
            </div>
            <div className="plan-card">
              <h3>Plano Empresarial</h3>
              <p className="plan-price">Personalizado</p>
              <ul className="plan-features">
                <li>Tudo do Profissional</li>
                <li>Múltiplas filiais</li>
                <li>Integração customizada</li>
                <li>Gestor de conta dedicado</li>
              </ul>
              <button className="plan-btn">Contate-nos</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
