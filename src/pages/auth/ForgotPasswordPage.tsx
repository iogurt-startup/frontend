import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { PawSvg, FishSvg, BoneSvg } from '../../components/auth/PetDecorations'
import '../../styles/auth.css'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulated — backend doesn't have this endpoint yet
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSent(true)
    } catch {
      setError('Erro ao enviar email. Tente novamente.')
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

      {/* Back button — top left */}
      <Link to="/login" className="forgot-back-link">
        <ChevronLeft size={18} />
        Voltar
      </Link>

      <div className="auth-card forgot-card">
        <h1 className="forgot-title">Esqueceu sua senha?</h1>

        {sent ? (
          <div className="forgot-success">
            <p className="forgot-description">
              Se o e-mail <strong>{email}</strong> estiver cadastrado,
              você receberá um link para recuperar sua senha.
            </p>
            <Link to="/login" className="btn btn-primary auth-submit">
              Voltar ao login
            </Link>
          </div>
        ) : (
          <>
            <p className="forgot-description">
              Informe o e-mail cadastrado para enviarmos o link de recuperação de
              senha.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">
                  E-mail
                </label>
                <input
                  id="forgot-email"
                  className="form-input"
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              {error && <div className="form-error">{error}</div>}

              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner" />
                ) : (
                  'Enviar email de recuperação'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
