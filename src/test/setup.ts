import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

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
