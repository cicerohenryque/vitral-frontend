import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { api } from '../services/api'

// Toda chamada não preparada falha dentro do processo de teste, sem tentar abrir
// conexões HTTP no jsdom. Cada cenário continua podendo sobrescrever o método ou
// o adapter que deseja exercitar.
api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
  throw new AxiosError('Requisição não simulada no teste', 'ERR_TEST_UNMOCKED_REQUEST', config)
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

beforeEach(() => {
  localStorage.clear()
  // Evita que testes que preenchem CEP (para satisfazer o endereco obrigatorio) disparem
  // uma chamada de rede real ao ViaCEP e travem ate o timeout. Testes que exercitam o
  // autopreenchimento de verdade sobrescrevem este mock explicitamente.
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('fetch nao mockado neste teste'))
})
