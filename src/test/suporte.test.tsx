import { AxiosError } from 'axios'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { SupportPage } from '../components/Support/SupportPage'
import { api } from '../services/api'
import * as suporteService from '../services/suporteService'

function renderSupporte() {
  return render(
    <MemoryRouter initialEntries={['/suporte']}>
      <Routes>
        <Route path="*" element={<SupportPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SupportPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // ── Renderização ────────────────────────────────────────────────────────────

  it('renderiza o titulo, subtitulo e os tres canais de suporte', () => {
    renderSupporte()
    expect(screen.getByRole('heading', { name: /Suporte/i })).toBeInTheDocument()
    expect(screen.getByText(/Encontre respostas ou fale com a equipe do Vitral/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Central de ajuda' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Fale conosco' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Segurança' })).toBeInTheDocument()
  })

  it('renderiza as perguntas frequentes', () => {
    renderSupporte()
    expect(screen.getByText('Como faço uma reserva?')).toBeInTheDocument()
    expect(screen.getByText('Como conversar com um vendedor?')).toBeInTheDocument()
    expect(screen.getByText('Posso denunciar um anúncio?')).toBeInTheDocument()
    expect(screen.getByText('Como altero os dados da minha conta?')).toBeInTheDocument()
  })

  it('renderiza o formulario com os campos e o botao de envio', () => {
    renderSupporte()
    expect(screen.getByLabelText('Assunto')).toBeInTheDocument()
    expect(screen.getByLabelText('Mensagem')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar mensagem' })).toBeInTheDocument()
  })

  // ── Validação client-side ───────────────────────────────────────────────────

  it('exibe erro ao tentar enviar com campos vazios', async () => {
    renderSupporte()
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Preencha o assunto e a mensagem antes de enviar.',
    )
  })

  it('exibe erro ao tentar enviar apenas com assunto preenchido', async () => {
    renderSupporte()
    await userEvent.type(screen.getByLabelText('Assunto'), 'Meu assunto')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Preencha o assunto e a mensagem antes de enviar.',
    )
  })

  it('exibe erro ao tentar enviar apenas com mensagem preenchida', async () => {
    renderSupporte()
    await userEvent.type(screen.getByLabelText('Mensagem'), 'Minha mensagem')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Preencha o assunto e a mensagem antes de enviar.',
    )
  })

  // ── Envio com sucesso ───────────────────────────────────────────────────────

  it('envia o formulario com sucesso, exibe feedback e limpa os campos', async () => {
    vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { id: 1 } })
    renderSupporte()

    await userEvent.type(screen.getByLabelText('Assunto'), 'Problema no pedido')
    await userEvent.type(screen.getByLabelText('Mensagem'), 'Não consigo cancelar meu pedido.')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve.',
    )
    expect(screen.getByLabelText('Assunto')).toHaveValue('')
    expect(screen.getByLabelText('Mensagem')).toHaveValue('')
  })

  it('chama POST /suporte com assunto e mensagem corretos', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { id: 1 } })
    renderSupporte()

    await userEvent.type(screen.getByLabelText('Assunto'), 'Dúvida de pagamento')
    await userEvent.type(screen.getByLabelText('Mensagem'), 'Como funciona o pagamento?')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }))

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('/suporte', {
        assunto: 'Dúvida de pagamento',
        mensagem: 'Como funciona o pagamento?',
      })
    })
  })

  // ── Estado de loading ───────────────────────────────────────────────────────

  it('desabilita o botao e os campos enquanto envia', async () => {
    let resolvePost!: () => void
    vi.spyOn(api, 'post').mockReturnValueOnce(
      new Promise((res) => {
        resolvePost = () => res({ data: { id: 1 } })
      }),
    )
    renderSupporte()

    await userEvent.type(screen.getByLabelText('Assunto'), 'Assunto')
    await userEvent.type(screen.getByLabelText('Mensagem'), 'Mensagem')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }))

    expect(screen.getByRole('button', { name: 'Enviando...' })).toBeDisabled()
    expect(screen.getByLabelText('Assunto')).toBeDisabled()
    expect(screen.getByLabelText('Mensagem')).toBeDisabled()

    resolvePost()
    expect(await screen.findByRole('button', { name: 'Enviar mensagem' })).not.toBeDisabled()
  })

  // ── Erro do backend ─────────────────────────────────────────────────────────

  it('exibe mensagem de erro quando o backend rejeita a requisicao com AxiosError', async () => {
    const axiosError = new AxiosError(
      'Servidor indisponível',
      'ERR_BAD_RESPONSE',
      undefined,
      undefined,
      { data: { message: 'Servidor indisponível' }, status: 500, statusText: 'Internal Server Error', headers: {}, config: {} as never },
    )
    vi.spyOn(api, 'post').mockRejectedValueOnce(axiosError)
    renderSupporte()

    await userEvent.type(screen.getByLabelText('Assunto'), 'Assunto')
    await userEvent.type(screen.getByLabelText('Mensagem'), 'Mensagem')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Servidor indisponível')
  })

  it('exibe o fallback de erro quando o backend nao retorna mensagem', async () => {
    vi.spyOn(api, 'post').mockRejectedValueOnce({})
    renderSupporte()

    await userEvent.type(screen.getByLabelText('Assunto'), 'Assunto')
    await userEvent.type(screen.getByLabelText('Mensagem'), 'Mensagem')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível enviar sua mensagem. Tente novamente.',
    )
  })

  it('reabilita o botao e os campos apos erro', async () => {
    vi.spyOn(api, 'post').mockRejectedValueOnce(new Error('falha'))
    renderSupporte()

    await userEvent.type(screen.getByLabelText('Assunto'), 'Assunto')
    await userEvent.type(screen.getByLabelText('Mensagem'), 'Mensagem')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }))

    const btn = await screen.findByRole('button', { name: 'Enviar mensagem' })
    expect(btn).not.toBeDisabled()
    expect(screen.getByLabelText('Assunto')).not.toBeDisabled()
    expect(screen.getByLabelText('Mensagem')).not.toBeDisabled()
  })

  // ── Serviço ─────────────────────────────────────────────────────────────────

  it('suporteService.enviarSuporte faz POST /suporte com o payload correto', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValueOnce({ data: undefined })
    await suporteService.enviarSuporte({ assunto: 'Teste', mensagem: 'Conteúdo do teste' })
    expect(post).toHaveBeenCalledWith('/suporte', { assunto: 'Teste', mensagem: 'Conteúdo do teste' })
  })
})
