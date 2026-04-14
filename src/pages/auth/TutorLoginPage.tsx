import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { authService } from '../../lib/authService'
import { useAuthStore } from '../../stores/authStore'
import { BoneSvg, FishSvg, PawSvg } from '../../components/auth/PetDecorations'
import '../../styles/auth.css'

export function TutorLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await authService.login({ email, password })

      if (data.user.role !== 'TUTOR') {
        setError('Este acesso e exclusivo para tutores. Use o login da equipe da clinica.')
        return
      }

      setAuth(data.user, data.accessToken, data.refreshToken)
      navigate('/portal')
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Erro ao fazer login. Verifique suas credenciais.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <PawSvg className="auth-deco auth-deco-paw" />
      <FishSvg className="auth-deco auth-deco-fish" />
      <BoneSvg className="auth-deco auth-deco-bone" />
      <PawSvg className="auth-deco auth-deco-paw2" />

      <div className="auth-card">
        <button
          type="button"
          className="auth-back-btn tutor-auth-back-btn"
          onClick={() => navigate('/')}
          aria-label="Voltar para a pagina inicial"
          title="Voltar"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="auth-logo">
          <span className="auth-logo-text">Portal do Tutor</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="tutor-login-email">E-mail</label>
            <input
              id="tutor-login-email"
              className="form-input"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tutor-login-password">Senha</label>
            <div className="form-input-wrapper">
              <input
                id="tutor-login-password"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="form-input-icon"
                onClick={() => setShowPassword((current) => !current)}
                tabIndex={-1}
                aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Entrar no portal'}
          </button>

          <div className="auth-footer">
            <Link to="/login" className="auth-footer-link">
              Sou da equipe da clinica
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
