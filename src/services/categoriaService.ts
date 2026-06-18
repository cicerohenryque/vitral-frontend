import { api } from './api'
import type { Page } from '../types/common'
import type { Categoria } from '../types/categoria'

type CategoriaApi = string | {
  id?: number | string
  nome?: string
  name?: string
  slug?: string
  totalProdutos?: number
  total?: number
  quantidade?: number
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeCategoria(item: CategoriaApi): Categoria | null {
  if (typeof item === 'string') {
    const nome = item.trim()
    return nome ? { nome, slug: slugify(nome) } : null
  }

  const nome = (item.nome ?? item.name ?? '').trim()
  if (!nome) return null

  return {
    id: item.id,
    nome,
    slug: item.slug?.trim() || slugify(nome),
    totalProdutos: item.totalProdutos ?? item.total ?? item.quantidade,
  }
}

function extractItems(data: CategoriaApi[] | Page<CategoriaApi>): CategoriaApi[] {
  return Array.isArray(data) ? data : data.content
}

export const categoriaService = {
  async listar(): Promise<Categoria[]> {
    const { data } = await api.get<CategoriaApi[] | Page<CategoriaApi>>('/categorias')
    return extractItems(data)
      .map(normalizeCategoria)
      .filter((categoria): categoria is Categoria => Boolean(categoria))
  },
}
