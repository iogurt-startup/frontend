import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { PawSvg, FishSvg, BoneSvg } from '../../components/auth/PetDecorations'
import { api } from '../../lib/api'
import '../../styles/auth.css'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  // Validations
  const hasMinLength = newPassword.length >= 6
  const hasUppercase = /[A-Z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword)

  const isValidPassword = hasMinLength && hasUppercase && hasNumber && hasSpecial
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setApiError('')

    if (!token) {
      setApiError('Token de recuperação inválido ou não fornecido.')
      return
    }

    if (!isValidPassword) {
      setApiError('A senha não atende a todos os requisitos.')
      return
    }

    if (newPassword !== confirmPassword) {
      return // Button or form handles the "don't match" visual, but we stop submission
    }

    setLoading(true)

    try {
      await api.post('/auth/password/reset', { token, newPassword })
      // Redirect to login with success state
      navigate('/login', { state: { message: 'Senha alterada com sucesso' } })
    } catch (err: any) {
      setApiError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Erro ao redefinir senha. Tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  const renderCheckItem = (label: string, valid: boolean) => (
    <div className={`password-check-item ${valid ? 'valid' : ''}`}>
      <CheckCircle2 size={16} className="check-icon" />
      <span>{label}</span>
    </div>
  )

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

      <div className="auth-card reset-card">
        <h1 className="forgot-title text-center">Defina sua nova senha</h1>

        <p className="forgot-description">
          Sua nova senha deve ter pelo menos 6 caracteres, incluindo uma letra
          maiúscula, um número e um símbolo.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="new-password">
              Nova senha
            </label>
            <div className="form-input-wrapper">
              <input
                id="new-password"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
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

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">
              Confirmar nova senha
            </label>
            <div className="form-input-wrapper">
              <input
                id="confirm-password"
                className={`form-input ${!passwordsMatch && confirmPassword.length > 0 ? 'input-error' : ''}`}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="form-input-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Esconder senha' : 'Mostrar senha'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {!passwordsMatch && confirmPassword.length > 0 && (
              <div className="form-error-inline text-red-500 text-xs mt-1 flex items-center gap-1">
                 <span className="text-red-500 text-xs mt-1">ⓘ Senhas não coincidem</span>
              </div>
            )}
          </div>

          {apiError && <div className="form-error">{apiError}</div>}

          <div className="password-checklist">
            {renderCheckItem('Mínimo de 6 caracteres;', hasMinLength)}
            {renderCheckItem('Uma letra maiúscula;', hasUppercase)}
            {renderCheckItem('Um número;', hasNumber)}
            {renderCheckItem('Um caractere especial;', hasSpecial)}
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit w-full"
            disabled={loading || !isValidPassword || !passwordsMatch}
          >
            {loading ? <span className="spinner" /> : 'Salvar senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
