import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const limitKb = Number(process.env.BUNDLE_ENTRY_LIMIT_KB ?? 275)
if (!Number.isFinite(limitKb) || limitKb <= 0) {
  throw new Error('BUNDLE_ENTRY_LIMIT_KB deve ser um número positivo.')
}

const manifestPath = resolve('dist/.vite/manifest.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const entry = Object.values(manifest).find((asset) => asset.isEntry)
if (!entry?.file) throw new Error('Não foi possível identificar o bundle de entrada no manifesto do Vite.')

const { size } = await stat(resolve('dist', entry.file))
const sizeKb = size / 1024
console.log(`Bundle inicial: ${sizeKb.toFixed(1)} kB (limite: ${limitKb} kB)`)
if (sizeKb > limitKb) {
  throw new Error(`O bundle inicial excedeu o limite em ${(sizeKb - limitKb).toFixed(1)} kB.`)
}
