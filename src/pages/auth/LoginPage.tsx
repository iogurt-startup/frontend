import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

import { authService } from '../../lib/authService'
import { useAuthStore } from '../../stores/authStore'
import { PawSvg, FishSvg, BoneSvg, CatFaceSvg } from '../../components/auth/PetDecorations'
import { isGoogleOAuthConfigured } from '../../lib/googleOAuth'
import '../../styles/auth.css'

import { GoogleLoginButton, GoogleIcon } from '../../components/auth/GoogleLoginButton'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authService.login({ email, password })
      setAuth(data.user, data.accessToken, data.refreshToken)
      navigate(data.user.role === 'TUTOR' ? '/portal' : '/home')
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Erro ao fazer login. Verifique suas credenciais.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (accessToken: string) => {
    setError('')
    setGoogleLoading(true)
    try {
      const data = await authService.googleLogin(accessToken)
      setAuth(data.user, data.accessToken, data.refreshToken)
      navigate(data.user.role === 'TUTOR' ? '/portal' : '/home')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao autenticar com o Google.')
    } finally {
      setGoogleLoading(false)
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
          className="auth-back-btn"
          onClick={() => navigate('/')}
          aria-label="Voltar para a página inicial"
          title="Voltar"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="auth-logo">
          <span className="auth-logo-text">
            <CatFaceSvg />
            iougurt
          </span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Usuário</label>
            <input
              id="login-email"
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
            <label className="form-label" htmlFor="login-password">Senha</label>
            <div className="form-input-wrapper">
              <input
                id="login-password"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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
            disabled={loading || googleLoading}
          >
            {loading ? <span className="spinner" /> : 'Entrar'}
          </button>

          {/* Google sempre visível; sem Client ID o clique só orienta (SDK não é inicializado). */}
          <div className="auth-divider"><span>ou</span></div>
          {isGoogleOAuthConfigured ? (
            <GoogleLoginButton
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Login com Google cancelado ou falhou.')}
              disabled={loading || googleLoading}
            />
          ) : (
            <button
              type="button"
              className="btn auth-google-btn"
              disabled={loading || googleLoading}
              onClick={() =>
                setError(
                  'Configure VITE_GOOGLE_CLIENT_ID em frontend/.env e reinicie o npm run dev.',
                )
              }
            >
              <GoogleIcon />
              Entrar com Google
            </button>
          )}

          <div className="auth-footer">
            <Link to="/forgot-password" className="auth-footer-link">
              Esqueceu sua senha?
            </Link>
          </div>

          <div className="auth-switch text-center">
            Não tem conta?{' '}<Link to="/register">Cadastre-se</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
