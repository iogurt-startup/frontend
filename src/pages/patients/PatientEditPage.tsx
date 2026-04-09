import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Upload, PawPrint, User } from 'lucide-react'
import { api } from '../../lib/api'
import type { Patient } from '../../types'
import '../../styles/patient-edit.css'

export function PatientEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    // Paciente
    name: '',
    birthDate: '',
    species: '',
    breed: '',
    weightKg: '',
    sex: '',
    microchip: 'Não',
    microchipNumber: '',
    observations: '',
    // Tutor - Dados básicos
    tutorFullName: '',
    tutorCpf: '',
    tutorPhone: '',
    tutorEmail: '',
    tutorConvenio: '',
    // Tutor - Endereço
    tutorCep: '',
    tutorState: '',
    tutorCity: '',
    tutorNeighborhood: '',
    tutorStreet: '',
    tutorNumber: '',
    tutorComplement: '',
  })

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get(`/patients/${id}`)
      .then(res => {
        const data = res.data.patient || res.data
        setPatient(data)
        
        // Parse address string to extract fields
        const parseAddress = (addressStr: string | null | undefined) => {
          const result = {
            cep: '',
            state: '',
            city: '',
            neighborhood: '',
            street: '',
            number: '',
            complement: ''
          }
          
          if (!addressStr) return result
          
          const parts = addressStr.split(',').map(s => s.trim())
          
          // Extract CEP
          const cepPart = parts.find(p => p.startsWith('CEP:'))
          if (cepPart) result.cep = cepPart.replace('CEP:', '').trim()
          
          // Extract number
          const numPart = parts.find(p => p.startsWith('nº'))
          if (numPart) result.number = numPart.replace('nº', '').trim()
          
          // Street is usually the first part
          result.street = parts[0] || ''
          
          // Walk backwards for predictable pieces
          let cursor = parts.length - 1
          if (cepPart) cursor--
          
          if (cursor > 0 && parts[cursor] !== numPart && parts[cursor] !== result.street) {
            result.state = parts[cursor]
            cursor--
          }
          if (cursor > 0 && parts[cursor] !== numPart && parts[cursor] !== result.street) {
            result.city = parts[cursor]
            cursor--
          }
          if (cursor > 0 && parts[cursor] !== numPart && parts[cursor] !== result.street) {
            result.neighborhood = parts[cursor]
            cursor--
          }
          
          // Complement
          if (numPart) {
            const numIdx = parts.indexOf(numPart)
            if (numIdx !== -1 && numIdx < cursor) {
              result.complement = parts.slice(numIdx + 1, cursor + 1).join(', ')
            }
          }
          
          return result
        }
        
        const addressData = parseAddress(data.tutor?.address)
        
        setFormData({
          name: data.name || '',
          birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
          species: data.species || '',
          breed: data.breed || '',
          weightKg: data.weightKg || '',
          sex: data.sex || '',
          microchip: data.microchip || 'Não',
          microchipNumber: data.microchipNumber || '',
          observations: data.observations || '',
          tutorFullName: data.tutor?.fullName || '',
          tutorCpf: data.tutor?.cpf || '',
          tutorPhone: data.tutor?.phone || '',
          tutorEmail: data.tutor?.email || '',
          tutorConvenio: data.tutor?.convenio || '',
          tutorCep: addressData.cep,
          tutorState: addressData.state,
          tutorCity: addressData.city,
          tutorNeighborhood: addressData.neighborhood,
          tutorStreet: addressData.street,
          tutorNumber: addressData.number,
          tutorComplement: addressData.complement,
        })
      })
      .catch(err => {
        console.error('Erro ao buscar paciente:', err)
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const formatCPF = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}.${numbers.slice(9, 11)}`
  }

  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)})${numbers.slice(2)}`
    return `(${numbers.slice(0, 2)})${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setFormData(prev => ({ ...prev, tutorCpf: formatted }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData(prev => ({ ...prev, tutorPhone: formatted }))
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      // Reset input value to allow selecting the same file again
      e.target.value = ''
    }
  }

  const handleRemovePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleSaveClick = () => {
    setShowConfirmModal(true)
  }

  const handleBackClick = () => {
    setShowExitModal(true)
  }

  const handleConfirmExit = () => {
    setShowExitModal(false)
    navigate(`/pacientes/${id}`)
  }

  const handleConfirmSave = async () => {
    if (!id || !patient) return
    setSaving(true)
    try {
      // Build address string
      const addressParts = [
        formData.tutorStreet,
        formData.tutorNumber ? `nº ${formData.tutorNumber}` : '',
        formData.tutorComplement,
        formData.tutorNeighborhood,
        formData.tutorCity,
        formData.tutorState,
        formData.tutorCep ? `CEP: ${formData.tutorCep}` : ''
      ].filter(Boolean).join(', ')

      // Upload photo if selected
      let photoUrl = patient.photoUrl
      if (photoFile) {
        const photoFormData = new FormData()
        photoFormData.append('photo', photoFile)
        const photoRes = await api.post(`/patients/${id}/photo`, photoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        photoUrl = photoRes.data.photoUrl
      }

      // Prepare payload with only needed fields
      const payloadData: Record<string, unknown> = {
        name: formData.name || '',
        birthDate: formData.birthDate || '',
        species: formData.species || '',
        breed: formData.breed || '',
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : 0,
        sex: formData.sex || '',
        microchip: formData.microchip || 'Não',
        microchipNumber: formData.microchipNumber || '',
        observations: formData.observations || ''
      }

      // Only add photoUrl if it's not null
      if (photoUrl) {
        payloadData.photoUrl = photoUrl
      }

      const tutorData = {
        fullName: formData.tutorFullName || '',
        cpf: formData.tutorCpf || '',
        phone: formData.tutorPhone || '',
        email: formData.tutorEmail || '',
        convenio: formData.tutorConvenio || '',
        address: addressParts || ''
      }

      console.log('Dados do paciente:', payloadData)
      console.log('Dados do tutor:', tutorData)

      const response = await api.put(`/patients/${id}`, {
        ...payloadData,
        tutor: tutorData
      })

      console.log('Resposta da API:', response.data)
      console.log('Tutor salvo:', response.data?.tutor)

      console.log('Dados salvos com sucesso:', response.data)
      setShowConfirmModal(false)
      setPhotoFile(null)
      setPhotoPreview(null)
      
      // Aguardar um pouco antes de navegar para garantir que o token está válido
      setTimeout(() => {
        navigate(`/pacientes/${id}`)
      }, 500)
    } catch (err) {
      console.error('Erro completo:', err)
      if (err instanceof Error) {
        console.error('Mensagem de erro:', err.message)
      }
      // @ts-expect-error accessing axios error response
      if (err?.response?.status) {
        // @ts-expect-error accessing axios error response
        console.error('Status:', err.response.status)
        // @ts-expect-error accessing axios error response
        console.error('Dados retornados:', err.response.data)
        
        // Mostrar erro detalhado
        let errorMessage = 'Erro ao salvar os dados (422)'
        // @ts-expect-error accessing axios error response
        const responseData = err.response.data
        
        if (responseData?.issues && Array.isArray(responseData.issues)) {
          errorMessage += '\n\nProblemas de validação:\n' + 
            responseData.issues.map((issue: Record<string, unknown>) => `- ${issue.message}`).join('\n')
        } else if (responseData?.issues) {
          errorMessage += '\n\nProblemas: ' + JSON.stringify(responseData.issues, null, 2)
        } else if (responseData?.message) {
          errorMessage += '\n\n' + responseData.message
        } else {
          errorMessage += '\n\n' + JSON.stringify(responseData, null, 2)
        }
        alert(errorMessage)
      } else {
        alert('Erro ao salvar os dados. Verifique o console para mais detalhes.')
      }
    } finally {
      setSaving(false)
    }
  }

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

  return (
    <div className="patient-edit-page">
      {/* Header */}
      <div className="edit-header">
        <div className="edit-header-left">
          <button 
            onClick={handleBackClick} 
            className="back-btn"
          >
            <ChevronLeft size={18} /> Voltar
          </button>
        </div>
        <div className="edit-header-right">
          <button 
            onClick={handleSaveClick}
            disabled={saving}
            className="save-btn"
          >
            {saving ? 'Salvando...' : '💾 Salvar alterações'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="edit-content">
        {/* PACIENTE Section */}
        <section className="edit-section">
          <h2 className="section-title">🐾 Paciente</h2>

          <div className="edit-form-row">
            {/* Photo Section */}
            <div className="photo-section">
              <div className="photo-upload">
                {photoPreview ? (
                  <img src={photoPreview} alt="Foto Pet Preview" />
                ) : patient.photoUrl ? (
                  <img src={patient.photoUrl} alt="Foto Pet" />
                ) : (
                  <div className="photo-placeholder">
                    <span>Sem foto</span>
                  </div>
                )}
              </div>
              <div className="photo-actions">
                <label htmlFor="photo-input" className="alter-photo-btn">
                  <Upload size={16} /> Alterar foto
                </label>
                <input 
                  id="photo-input"
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                  key={`photo-input-${photoPreview ? 'with-preview' : 'no-preview'}`}
                />
                {photoPreview && (
                  <button 
                    onClick={handleRemovePhoto}
                    className="remove-photo-btn"
                  >
                    ✕ Remover
                  </button>
                )}
              </div>
            </div>

            {/* Form Grid */}
            <div className="form-grid">
              <div className="form-group">
                <label>Nome do Pet: *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Max"
                />
              </div>

              <div className="form-group">
                <label>Data de nascimento: *</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Idade: *</label>
                <input
                  type="text"
                  value={formData.birthDate ? 
                    (() => {
                      const birth = new Date(formData.birthDate)
                      const today = new Date()
                      let age = today.getFullYear() - birth.getFullYear()
                      const m = today.getMonth() - birth.getMonth()
                      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
                      return age > 0 ? `${age} anos` : 'Menos de 1 ano'
                    })()
                    : '—'
                  }
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Espécie: *</label>
                <select name="species" value={formData.species} onChange={handleInputChange}>
                  <option value="">Selecione</option>
                  <option value="Cachorro">Cachorro</option>
                  <option value="Gato">Gato</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="form-group">
                <label>Raça: *</label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  placeholder="Jack Russell Terrier"
                />
              </div>

              <div className="form-group">
                <label>Peso atual: *</label>
                <input
                  type="number"
                  step="0.1"
                  name="weightKg"
                  value={formData.weightKg}
                  onChange={handleInputChange}
                  placeholder="10"
                />
              </div>

              <div className="form-group">
                <label>Sexo: *</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="sex"
                      value="Feminino"
                      checked={formData.sex === 'Feminino'}
                      onChange={() => handleRadioChange('sex', 'Feminino')}
                    />
                    Feminino
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="sex"
                      value="Masculino"
                      checked={formData.sex === 'Masculino'}
                      onChange={() => handleRadioChange('sex', 'Masculino')}
                    />
                    Masculino
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Possui microchip? *</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="microchip"
                      value="Sim"
                      checked={formData.microchip === 'Sim'}
                      onChange={() => handleRadioChange('microchip', 'Sim')}
                    />
                    Sim
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="microchip"
                      value="Não"
                      checked={formData.microchip === 'Não'}
                      onChange={() => handleRadioChange('microchip', 'Não')}
                    />
                    Não
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Número do microchip: *</label>
                <input
                  type="text"
                  name="microchipNumber"
                  value={formData.microchipNumber}
                  onChange={handleInputChange}
                  placeholder="985141000123456"
                />
              </div>

              <div className="form-group full-width">
                <label>Observações:</label>
                <textarea
                  name="observations"
                  value={formData.observations}
                  onChange={handleInputChange}
                  placeholder="É alérgico a cenoura"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </section>

        {/* TUTOR Section */}
        <section className="edit-section">
          <h2 className="section-title">👤 Tutor</h2>
          
          <div className="section-subtitle">Dados básicos</div>

          <div className="form-grid">
            <div className="form-group">
              <label>Nome completo: *</label>
              <input
                type="text"
                name="tutorFullName"
                value={formData.tutorFullName}
                onChange={handleInputChange}
                placeholder="Lucas Gabriel Fernandes Barbosa"
              />
            </div>

            <div className="form-group">
              <label>CPF: *</label>
              <input
                type="text"
                name="tutorCpf"
                value={formData.tutorCpf}
                onChange={handleCPFChange}
                placeholder="123.456.789.10"
              />
            </div>

            <div className="form-group">
              <label>Contato: *</label>
              <input
                type="tel"
                name="tutorPhone"
                value={formData.tutorPhone}
                onChange={handlePhoneChange}
                placeholder="(61)12345-6789"
              />
            </div>

            <div className="form-group">
              <label>Email: *</label>
              <input
                type="email"
                name="tutorEmail"
                value={formData.tutorEmail}
                onChange={handleInputChange}
                placeholder="lucas.gabrielf@gmail.com"
              />
            </div>

            <div className="form-group">
              <label>Convênio: *</label>
              <select name="tutorConvenio" value={formData.tutorConvenio} onChange={handleInputChange}>
                <option value="">Selecione</option>
                <option value="Dog Life">Dog Life</option>
                <option value="Pet Saúde">Pet Saúde</option>
                <option value="Nenhum">Nenhum</option>
              </select>
            </div>
          </div>

          {/* Endereço Section */}
          <div className="section-subtitle" style={{ marginTop: '32px' }}>Endereço</div>

          <div className="form-grid">
            <div className="form-group">
              <label>CEP: *</label>
              <input
                type="text"
                name="tutorCep"
                value={formData.tutorCep}
                onChange={handleInputChange}
                placeholder="12345-678"
              />
            </div>

            <div className="form-group">
              <label>Estado: *</label>
              <select name="tutorState" value={formData.tutorState} onChange={handleInputChange}>
                <option value="">Selecione</option>
                <option value="Distrito Federal">Distrito Federal</option>
                <option value="São Paulo">São Paulo</option>
                <option value="Rio de Janeiro">Rio de Janeiro</option>
                <option value="Minas Gerais">Minas Gerais</option>
                <option value="Brasília">Brasília</option>
              </select>
            </div>

            <div className="form-group">
              <label>Cidade: *</label>
              <select name="tutorCity" value={formData.tutorCity} onChange={handleInputChange}>
                <option value="">Selecione</option>
                <option value="Brasília">Brasília</option>
                <option value="São Paulo">São Paulo</option>
                <option value="Rio de Janeiro">Rio de Janeiro</option>
              </select>
            </div>

            <div className="form-group">
              <label>Bairro: *</label>
              <input
                type="text"
                name="tutorNeighborhood"
                value={formData.tutorNeighborhood}
                onChange={handleInputChange}
                placeholder="Asa Norte"
              />
            </div>

            <div className="form-group col-2">
              <label>Logradouro: *</label>
              <input
                type="text"
                name="tutorStreet"
                value={formData.tutorStreet}
                onChange={handleInputChange}
                placeholder="Rua das Paineiras, Quadra 104"
              />
            </div>

            <div className="form-group">
              <label>Número: *</label>
              <input
                type="text"
                name="tutorNumber"
                value={formData.tutorNumber}
                onChange={handleInputChange}
                placeholder="1"
              />
            </div>

            <div className="form-group">
              <label>Complemento:</label>
              <input
                type="text"
                name="tutorComplement"
                value={formData.tutorComplement}
                onChange={handleInputChange}
                placeholder="Apartamento 302"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">
              <img src="/images/Icons_save.png" alt="Salvar" />
            </div>
            <h2 className="modal-title">Salvar alterações</h2>
            <p className="modal-message">Deseja salvar as alterações que realizou?</p>
            <div className="modal-buttons">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="modal-cancel-btn"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmSave}
                disabled={saving}
                className="modal-confirm-btn"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Modal */}
      {showExitModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon modal-icon-exit">
              <img src="/images/Icons_question.png" alt="Deseja sair?" />
            </div>
            <h2 className="modal-title">Deseja sair ?</h2>
            <p className="modal-message">Você não salvou as alterações que realizou, deseja sair mesmo assim?</p>
            <div className="modal-buttons">
              <button 
                onClick={() => setShowExitModal(false)}
                className="modal-cancel-btn"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmExit}
                className="modal-exit-btn"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}