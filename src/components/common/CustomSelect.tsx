import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  label: string
  value: string
}

interface CustomSelectProps {
  value: string
  onChange: (val: string) => void
  options: string[] | SelectOption[]
  placeholder?: string
}

function normalizeOptions(options: string[] | SelectOption[]): SelectOption[] {
  if (options.length === 0) return []
  if (typeof options[0] === 'string') {
    return (options as string[]).map((o) => ({ label: o, value: o }))
  }
  return options as SelectOption[]
}

export function CustomSelect({ value, onChange, options, placeholder = "Selecionar" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const normalized = normalizeOptions(options)
  const selectedLabel = normalized.find((o) => o.value === value)?.label ?? ''

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="custom-select-container" ref={containerRef}>
      <div 
        className={`custom-select-button ${value ? 'has-value' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value ? selectedLabel : placeholder}
      </div>
      <ChevronDown 
        className="select-icon" 
        size={16} 
        style={{ transform: isOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)', transition: 'transform 0.2s' }} 
      />
      
      {isOpen && (
        <div className="dropdown-overlay">
          {normalized.map((opt) => (
            <div 
              key={opt.value}
              className={`dropdown-item ${value === opt.value ? 'active' : ''}`}
              onClick={() => {
                onChange(opt.value)
                setIsOpen(false)
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
