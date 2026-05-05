export interface CepAddress {
  cep: string
  state: string
  city: string
  neighborhood: string
  street: string
}

export class CepNotFoundError extends Error {
  constructor(message = 'CEP não encontrado') {
    super(message)
    this.name = 'CepNotFoundError'
  }
}

export class CepRequestError extends Error {
  constructor(message = 'Não foi possível buscar o CEP') {
    super(message)
    this.name = 'CepRequestError'
  }
}

interface ViaCepResponse {
  cep?: string
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean | string
}

export async function fetchAddressByCep(rawCep: string, signal?: AbortSignal): Promise<CepAddress> {
  const cep = rawCep.replace(/\D/g, '')
  if (cep.length !== 8) throw new CepNotFoundError('CEP incompleto')

  let res: Response
  try {
    res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal })
  } catch (err) {
    if ((err as DOMException)?.name === 'AbortError') throw err
    throw new CepRequestError('Falha de rede ao buscar CEP')
  }

  if (!res.ok) throw new CepRequestError('ViaCEP indisponível')

  const data = (await res.json()) as ViaCepResponse
  if (data.erro) throw new CepNotFoundError()

  return {
    cep,
    state: data.uf ?? '',
    city: data.localidade ?? '',
    neighborhood: data.bairro ?? '',
    street: data.logradouro ?? '',
  }
}
