import { Linkedin, Mail } from 'lucide-react'
import '../../styles/footer.css'

export function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-content">
        <div className="footer-section footer-brand">
          <div className="footer-logo">iougurt</div>
          <p className="footer-description">
            Transforme a gestão da sua clínica veterinária com inteligência e eficiência.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-link" aria-label="Instagram" title="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <circle cx="17.5" cy="6.5" r="1.5"></circle>
              </svg>
            </a>
            <a href="#" className="social-link" aria-label="LinkedIn" title="LinkedIn">
              <Linkedin size={20} />
            </a>
            <a href="#" className="social-link" aria-label="Twitter/X" title="Twitter/X">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2s9 5 20 5a9.5 9.5 0 0 0-9-5.5c4.75 2.25 7-7 7-7"></path>
              </svg>
            </a>
            <a href="#" className="social-link" aria-label="Email" title="Email">
              <Mail size={20} />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Empresa</h4>
          <ul>
            <li><a href="#sobre">Sobre Nós</a></li>
            <li><a href="#contato">Contato</a></li>
            <li><a href="#recursos">Recursos</a></li>
            <li><a href="#carreiras">Carreiras</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><a href="#termos">Termos de uso</a></li>
            <li><a href="#privacidade">Política de privacidade</a></li>
            <li><a href="#cookies">Cookies e segurança</a></li>
            <li><a href="#acessibilidade">Acessibilidade</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 iougurt. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
