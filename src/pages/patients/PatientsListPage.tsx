import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Plus, LogIn, X, Calendar } from 'lucide-react'
import { api } from '../../lib/api'
import type { Patient } from '../../types'
import '../../styles/patients.css'

export function PatientsListPage() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState<Patient[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  
  const [showFilter, setShowFilter] = useState(false)
  const [filterSpecies, setFilterSpecies] = useState('')
  const [filterDate, setFilterDate] = useState('')
  
  const [activeSpecies, setActiveSpecies] = useState('')
  const [activeDate, setActiveDate] = useState('')
  
  const [loading, setLoading] = useState(true)
  const perPage = 10

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, perPage }
      if (search.trim()) params.search = search.trim()
      if (activeSpecies) params.species = activeSpecies
      if (activeDate) params.updateDate = activeDate
      const response = await api.get('/patients', { params })
      setPatients(response.data.patients ?? [])
      setTotal(response.data.total ?? 0)
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err)
    } finally {
      setLoading(false)
    }
  }, [page, search, activeSpecies, activeDate])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1)
  }, [search, activeSpecies, activeDate])

  const applyFilters = () => {
    setActiveSpecies(filterSpecies)
    setActiveDate(filterDate)
    setPage(1)
    setShowFilter(false)
  }

  const clearFilters = () => {
    setFilterSpecies('')
    setFilterDate('')
    setActiveSpecies('')
    setActiveDate('')
    setPage(1)
    setShowFilter(false)
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const startItem = total > 0 ? (page - 1) * perPage + 1 : 0
  const endItem = Math.min(page * perPage, total)

  // Masks
  function maskDate(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    return digits
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
  }

  function formatDate(dateStr?: string | null): string {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('pt-BR')
    } catch {
      return '—'
    }
  }

  function getPaginationPages(): (number | '...')[] {
    const pages: (number | '...')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1, 2, 3)
      if (page > 4) pages.push('...')
      const start = Math.max(4, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i)
      }
      if (page < totalPages - 3) pages.push('...')
      if (!pages.includes(totalPages - 1)) pages.push(totalPages - 1)
      if (!pages.includes(totalPages)) pages.push(totalPages)
    }
    return pages
  }

  return (
    <div>
      <div className="patients-header">
        <h1>Pacientes</h1>
        <div className="patients-header-actions">
          <div className="search-bar">
            <Search />
            <input
              id="patient-search"
              type="text"
              placeholder="Pesquisar"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <button className="patients-filter-btn" id="patient-filter-btn" onClick={() => setShowFilter(!showFilter)}>
              <Filter />
              Filtrar
            </button>
            
            {showFilter && (
              <div 
                className="filter-popover" 
                style={{
                  position: 'absolute', 
                  top: '100%', 
                  right: 0,
                  marginTop: '12px',
                  background: '#fff', 
                  padding: '24px',
                  borderRadius: '16px', 
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  zIndex: 100, 
                  width: '340px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Filtrar</h3>
                  <button onClick={() => setShowFilter(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px', color: 'var(--color-text)' }}>
                    Espécie
                  </label>
                  <select 
                    style={{
                      width: '100%', padding: '12px 14px', border: '1px solid var(--gray-300)', 
                      borderRadius: '8px', fontSize: '0.875rem', outline: 'none', cursor: 'pointer',
                      appearance: 'none', background: '#fff',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239E9E9E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center'
                    }}
                    value={filterSpecies}
                    onChange={(e) => setFilterSpecies(e.target.value)}
                  >
                    <option value="">Selecionar</option>
                    <option value="Cachorro">Cachorro</option>
                    <option value="Gato">Gato</option>
                    <option value="Pássaro">Pássaro</option>
                    <option value="Roedor">Roedor</option>
                    <option value="Réptil">Réptil</option>
                    <option value="Peixe">Peixe</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px', color: 'var(--color-text)' }}>
                    Data
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder="dd/mm/aaaa" 
                      value={filterDate}
                      onChange={(e) => setFilterDate(maskDate(e.target.value))}
                      maxLength={10}
                      style={{
                        width: '100%', padding: '12px 14px', paddingRight: '40px',
                        border: '1px solid var(--gray-300)', borderRadius: '8px', 
                        fontSize: '0.875rem', outline: 'none'
                      }}
                    />
                    <Calendar size={18} color="var(--gray-400)" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button 
                    onClick={clearFilters}
                    style={{ background: 'transparent', border: 'none', color: 'var(--gray-500)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
                  >
                    Limpar filtros
                  </button>
                  <button 
                    onClick={applyFilters}
                    style={{ background: 'var(--pink-200)', color: '#fff', border: 'none', padding: '10px 32px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Filtrar
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            className="patients-add-btn"
            id="patient-add-btn"
            onClick={() => navigate('/pacientes/cadastrar')}
          >
            <Plus />
            Cadastrar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="patients-loading">
          <div className="spinner spinner-dark" />
        </div>
      ) : patients.length === 0 ? (
        <div className="patients-empty">
          <p>Nenhum paciente encontrado.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table" id="patients-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Tutor</th>
                  <th>Última consulta</th>
                  <th>Espécie</th>
                  <th style={{ textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.tutor?.fullName ?? '—'}</td>
                    <td>{formatDate(p.updatedAt)}</td>
                    <td>{p.species}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="table-action-btn"
                        title="Ver detalhes"
                        onClick={() => navigate(`/pacientes/${p.id}`)}
                      >
                        <LogIn size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="page-footer">
            <span className="page-footer-info">
              Exibindo de {startItem} a {endItem} de {total} resultados
            </span>
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                &lt;
              </button>
              {getPaginationPages().map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="pagination-btn" style={{ border: 'none', cursor: 'default' }}>
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    className={`pagination-btn${page === p ? ' active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                className="pagination-btn"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                &gt;
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
