import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Stethoscope, Edit2, PawPrint, User } from 'lucide-react'
import { api } from '../../lib/api'
import type { Patient } from '../../types'

export function PatientDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dados' | 'prontuario'>('dados')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get(`/patients/${id}`)
      .then(res => {
        setPatient(res.data.patient || res.data)
      })
      .catch(err => {
        console.error('Erro ao buscar paciente:', err)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <div className="spinner spinner-dark" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div style={{ padding: '64px', textAlign: 'center', color: 'var(--gray-500)' }}>
        Paciente não encontrado.
      </div>
    )
  }

  // Helper calculation for Age
  const getAge = (birthDateStr?: string | null) => {
    if (!birthDateStr) return '—'
    const birth = new Date(birthDateStr)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age > 0 ? `${age} anos` : 'Menos de 1 ano'
  }

  const parseDateBr = (dateStr?: string | null) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  // Address Helper
  const extractAddress = (addressStr?: string | null) => {
    const raw = {
      cep: '—', state: '—', city: '—', neighborhood: '—',
      street: '—', num: '—', complement: '—'
    }
    if (!addressStr) return raw
    
    const parts = addressStr.split(',').map(s => s.trim())
    
    const cepPart = parts.find(p => p.startsWith('CEP:'))
    if (cepPart) raw.cep = cepPart.replace('CEP:', '').trim()
    
    const numPart = parts.find(p => p.startsWith('nº'))
    if (numPart) raw.num = numPart.replace('nº', '').trim()
    
    raw.street = parts[0] || '—'

    // Walk backwards for predictable pieces (since filter(Boolean) dropped empties)
    let cursor = parts.length - 1
    if (cepPart) cursor--
    
    if (cursor > 0 && parts[cursor] !== numPart && parts[cursor] !== raw.street) {
      raw.state = parts[cursor]
      cursor--
    }
    if (cursor > 0 && parts[cursor] !== numPart && parts[cursor] !== raw.street) {
      raw.city = parts[cursor]
      cursor--
    }
    if (cursor > 0 && parts[cursor] !== numPart && parts[cursor] !== raw.street) {
      raw.neighborhood = parts[cursor]
      cursor--
    }
    
    // Complement is whatever is left between num and neighborhood
    if (numPart) {
      const numIdx = parts.indexOf(numPart)
      if (numIdx !== -1 && numIdx < cursor) {
        raw.complement = parts.slice(numIdx + 1, cursor + 1).join(', ') || '—'
      }
    } else {
      if (cursor > 0) {
        raw.complement = parts.slice(1, cursor + 1).join(', ') || '—'
      }
    }

    return raw
  }

  const addr = extractAddress(patient.tutor?.address)

  return (
    <div className="patient-details-page" style={{ width: '100%', background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
      {/* Top Bar Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate('/pacientes')} 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'transparent', border: 'none', color: 'var(--gray-500)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
        >
          <ChevronLeft size={18} /> Voltar
        </button>

        <div style={{ display: 'flex', gap: '24px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'transparent', border: 'none', color: 'var(--gray-500)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
            <Stethoscope size={18} /> Atender
          </button>
          <button 
            onClick={() => navigate(`/pacientes/${id}/editar`)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'transparent', border: 'none', color: 'var(--gray-500)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
            <Edit2 size={18} /> Editar dados
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--gray-200)', marginBottom: '32px' }}>
        <button 
          onClick={() => setActiveTab('dados')}
          style={{ 
            padding: '12px 32px', border: '1px solid var(--gray-200)', borderBottom: activeTab === 'dados' ? '2px solid var(--pink-200)' : 'none',
            borderRadius: '8px 8px 0 0', backgroundColor: activeTab === 'dados' ? '#fff' : 'transparent',
            color: activeTab === 'dados' ? 'var(--pink-200)' : 'var(--gray-400)', fontWeight: 600, cursor: 'pointer',
            borderBottomColor: activeTab === 'dados' ? 'var(--pink-200)' : 'transparent',
            position: 'relative', top: '1px'
          }}
        >
          Dados
        </button>
        <button 
          onClick={() => setActiveTab('prontuario')}
          style={{ 
            padding: '12px 32px', border: '1px solid var(--gray-200)', borderBottom: activeTab === 'prontuario' ? '2px solid var(--pink-200)' : 'none',
            borderRadius: '8px 8px 0 0', backgroundColor: activeTab === 'prontuario' ? '#fff' : 'transparent',
            color: activeTab === 'prontuario' ? 'var(--pink-200)' : 'var(--gray-400)', fontWeight: 600, cursor: 'pointer',
            borderBottomColor: activeTab === 'prontuario' ? 'var(--pink-200)' : 'transparent',
            position: 'relative', top: '1px'
          }}
        >
          Prontuário
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'dados' && (
        <div className="tab-content" style={{ padding: '0 8px' }}>
          
          {/* PACIENTE SECTION */}
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--pink-200)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px' }}>
            <PawPrint size={22} color="var(--pink-200)" /> Paciente
          </h2>

          <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start', marginBottom: '48px' }}>
            {/* Foto */}
            <div style={{ width: '140px', height: '140px', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'var(--pink-50)', flexShrink: 0 }}>
              {patient.photoUrl ? (
                <img src={patient.photoUrl} alt="Foto Pet" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pink-200)' }}>
                  <PawPrint size={48} opacity={0.5} />
                </div>
              )}
            </div>

            {/* Grid 1 - Info Pet */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600, width: '140px' }}>Nome do Pet:</td>
                      <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{patient.name}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600 }}>Data de nascimento:</td>
                      <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{parseDateBr(patient.birthDate)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600 }}>Idade:</td>
                      <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{getAge(patient.birthDate)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600 }}>Espécie:</td>
                      <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{patient.species}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600 }}>Raça:</td>
                      <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{patient.breed || '—'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600, width: '120px' }}>Sexo:</td>
                      <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{patient.sex || '—'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600 }}>Peso atual:</td>
                      <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{patient.weightKg ? `${patient.weightKg} kg` : '—'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600 }}>Microchip:</td>
                      <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{patient.microchip === 'Sim' ? 'Possui' : 'Não possui'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600 }}>Observações:</td>
                      <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{patient.observations || '—'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* TUTOR SECTION */}
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--pink-200)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px' }}>
            <User size={22} color="var(--pink-200)" /> Tutor
          </h2>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '16px' }}>Dados básicos</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600, width: '140px' }}>Nome completo:</td>
                  <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{patient.tutor?.fullName || '—'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600 }}>CPF:</td>
                  <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{patient.tutor?.cpf || '—'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600 }}>Contato:</td>
                  <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{patient.tutor?.phone || '—'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600 }}>Email:</td>
                  <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{patient.tutor?.email || '—'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600 }}>Convênio:</td>
                  <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{patient.tutor?.insurance || 'Não possui'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '16px' }}>Endereço</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600, width: '140px' }}>CEP:</td>
                      <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{addr.cep}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600 }}>Estado:</td>
                      <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{addr.state}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600 }}>Cidade:</td>
                      <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{addr.city}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600 }}>Bairro:</td>
                      <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{addr.neighborhood}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600, width: '140px' }}>Logradouro:</td>
                      <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{addr.street}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600 }}>Número:</td>
                      <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{addr.num}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--gray-600)', fontWeight: 600 }}>Complemento:</td>
                      <td style={{ padding: '8px 0', color: 'var(--gray-500)' }}>{addr.complement}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
        </div>
      )}

      {activeTab === 'prontuario' && (
        <div className="tab-content" style={{ padding: '0 8px', color: 'var(--gray-500)', textAlign: 'center', marginTop: '64px' }}>
          O prontuário do paciente será exibido aqui. (Em desenvolvimento)
        </div>
      )}
    </div>
  )
}
