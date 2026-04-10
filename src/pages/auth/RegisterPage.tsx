import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { authService } from '../../lib/authService'
import { PawSvg, FishSvg, BoneSvg, CatFaceSvg } from '../../components/auth/PetDecorations'
import '../../styles/auth.css'

export function RegisterPage() {
  const [name, setName] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.register({ name, email, password, clinicName })
      navigate('/login')
    } catch (err: any) {
      if (err.response?.data?.issues) {
        const issues = err.response.data.issues
        const firstField = Object.keys(issues)[0]
        setError(issues[firstField]?.[0] || 'Erro de validação.')
      } else {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            'Erro ao criar conta.'
        )
      }
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
        <div className="auth-logo">
          <span className="auth-logo-text">
            <CatFaceSvg />
            iougurt
          </span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              Seu nome
            </label>
            <input
              id="register-name"
              className="form-input"
              type="text"
              placeholder="Digite seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-clinic">
              Nome da clínica
            </label>
            <input
              id="register-clinic"
              className="form-input"
              type="text"
              placeholder="Ex: Clínica Veterinária PetLife"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              required
              minLength={2}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              E-mail
            </label>
            <input
              id="register-email"
              className="form-input"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              Senha
            </label>
            <div className="form-input-wrapper">
              <input
                id="register-password"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="form-input-icon"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Criar conta'}
          </button>

          <div className="auth-switch text-center">
            Já tem conta?{' '}
            <Link to="/login">Entrar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
