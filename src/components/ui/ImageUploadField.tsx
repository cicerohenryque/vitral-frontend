import { type ChangeEvent, useRef, useState } from 'react'
import { extractErrorMessage } from '../../services/api'
import { uploadService } from '../../services/uploadService'
import './ImageUploadField.css'

type Props = {
  id: string
  label: string
  value?: string | null
  onChange: (url: string) => void
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

export function ImageUploadField({ id, label, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Use uma imagem JPG, PNG ou WEBP.')
      event.target.value = ''
      return
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError('A imagem deve ter no maximo 5MB.')
      event.target.value = ''
      return
    }

    setBusy(true)
    try {
      const response = await uploadService.uploadImage(file)
      onChange(response.url)
    } catch (err) {
      setError(extractErrorMessage(err, 'Nao foi possivel enviar a imagem.'))
    } finally {
      setBusy(false)
      event.target.value = ''
    }
  }

  return (
    <div className="image-upload-field">
      <label className="vit-input-label" htmlFor={id}>{label}</label>
      <input
        ref={inputRef}
        id={id}
        className="image-upload-input"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
      />
      <div className="image-upload-row">
        <button
          type="button"
          className="image-upload-button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? 'Enviando...' : value ? 'Trocar imagem' : 'Selecionar imagem'}
        </button>
        {value ? (
          <button type="button" className="image-upload-clear" onClick={() => onChange('')}>
            Remover
          </button>
        ) : null}
      </div>
      {value ? (
        <div className="image-upload-preview">
          <img src={value} alt="Preview da imagem selecionada" />
        </div>
      ) : (
        <p className="image-upload-hint">JPG, PNG ou WEBP ate 5MB.</p>
      )}
      {error ? <p className="image-upload-error" role="alert">{error}</p> : null}
    </div>
  )
}
