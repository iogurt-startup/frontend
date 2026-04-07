import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'
import { authService } from '../../lib/authService'
import { useAuthStore } from '../../stores/authStore'
import { PawSvg, FishSvg, BoneSvg, CatFaceSvg } from '../../components/auth/PetDecorations'
import '../../styles/auth.css'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  )
}

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
      navigate(data.user.role === 'TUTOR' ? '/portal' : '/')
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
      navigate(data.user.role === 'TUTOR' ? '/portal' : '/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao autenticar com o Google.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: (resp) => handleGoogleSuccess(resp.access_token),
    onError: () => setError('Login com Google cancelado ou falhou.'),
    flow: 'implicit',
  })

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

          <div className="auth-divider"><span>ou</span></div>

          <button
            type="button"
            id="google-login-btn"
            className="btn auth-google-btn"
            onClick={() => googleLogin()}
            disabled={loading || googleLoading}
          >
            {googleLoading ? <span className="spinner" /> : (
              <><GoogleIcon />Entrar com Google</>
            )}
          </button>

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
