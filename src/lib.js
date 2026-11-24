// Regras de negócio do protótipo (equivalem ao TccService / ValidadorLumeService do diagrama de classes).
import { useEffect, useState } from 'react'
import { TCCS_INICIAIS, LIMITE_TAGS, LIMITE_TITULO, LIMITE_RESUMO } from './data.js'

const CHAVE = 'substcck:v1'

export function estadoInicial() {
  return {
    tccs: TCCS_INICIAIS,
    usuario: null,
    demo: { lumeIndisponivel: false, falhaDownload: false },
  }
}

// localStorage pode estar bloqueado (aba anônima, preview); o protótipo funciona sem ele.
export function carregar() {
  try {
    const salvo = localStorage.getItem(CHAVE)
    if (salvo) return { ...estadoInicial(), ...JSON.parse(salvo) }
  } catch { /* segue com o estado inicial */ }
  return estadoInicial()
}

export function salvar(estado) {
  try { localStorage.setItem(CHAVE, JSON.stringify(estado)) } catch { /* ignora */ }
}

// ---------- Rotas (hash, para funcionar no GitHub Pages sem servidor) ----------
export function useRota() {
  const ler = () => (window.location.hash || '#/').slice(1)
  const [rota, setRota] = useState(ler)
  useEffect(() => {
    const f = () => { setRota(ler()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  const [caminho, query = ''] = rota.split('?')
  return { caminho, params: new URLSearchParams(query) }
}

export const ir = (destino) => { window.location.hash = destino }

// ---------- UC04: Buscar e Filtrar TCCs ----------
export const normalizar = (s) =>
  (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

// O termo casa o início de uma palavra (decisão do grupo, Tabela 22): "rede" encontra "redes",
// mas "IA" não encontra "anomalias". Funciona também para trechos com várias palavras.
export function casaInicioDePalavra(texto, termo) {
  const t = normalizar(termo)
  if (!t) return true
  const escapado = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^a-z0-9])${escapado}`).test(normalizar(texto))
}

// O filtro Orientador encontra o professor como orientador ou como coorientador (Tabela 11, L22).
export const orientaOuCoorienta = (t, professor) => t.orientador === professor || t.coorientador === professor

// Todos os filtros são aplicados simultaneamente (E lógico). Rascunhos nunca aparecem.
export function buscar(tccs, f) {
  return tccs
    .filter((t) => t.status === 'PUBLICADO')
    .filter((t) => !f.ano || t.ano === Number(f.ano))
    .filter((t) => !f.autor || normalizar(t.autor).includes(normalizar(f.autor)))
    .filter((t) => !f.orientador || orientaOuCoorienta(t, f.orientador))
    .filter((t) => !f.colecao || t.colecao === f.colecao)
    .filter((t) => (f.tags || []).every((tag) => t.tags.includes(tag)))
    .filter((t) => casaInicioDePalavra(
      [t.titulo, t.resumo, t.autor, t.orientador, t.coorientador, ...t.tags].join(' '), f.termo,
    ))
    .sort(maisRecentePrimeiro)
}

export function maisRecentePrimeiro(a, b) {
  return ((b.ano || 0) * 10 + (b.semestre || 0)) - ((a.ano || 0) * 10 + (a.semestre || 0))
    || (b.publicadoEm || '').localeCompare(a.publicadoEm || '')
}

// RF#02: tópicos mais explorados = soma das visualizações dos TCCs publicados de cada tag.
export function tagsEmAlta(tccs, limite = 6) {
  const soma = {}
  for (const t of tccs) {
    if (t.status !== 'PUBLICADO') continue
    for (const tag of t.tags) soma[tag] = (soma[tag] || 0) + t.visualizacoes
  }
  return Object.entries(soma).sort((a, b) => b[1] - a[1]).slice(0, limite)
}

// UC06: Mapear Trabalhos Conexos (tags em comum pesam mais que orientador em comum).
export function trabalhosConexos(tccs, base, limite = 3) {
  return tccs
    .filter((t) => t.status === 'PUBLICADO' && t.id !== base.id)
    .map((t) => ({
      t,
      pontos: t.tags.filter((x) => base.tags.includes(x)).length * 2
        + (t.orientador === base.orientador ? 1 : 0),
    }))
    .filter((x) => x.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos || b.t.visualizacoes - a.t.visualizacoes)
    .slice(0, limite)
    .map((x) => x.t)
}

// ---------- UC01 / UC03: validações do cadastro ----------
export const LUME_REGEX = /^https?:\/\/(www\.)?lume\.ufrgs\.br\/handle\/10183\/\d+\/?$/i

export function validarCamposObrigatorios(form) {
  const erros = {}
  if (!form.titulo.trim() || form.titulo.length > LIMITE_TITULO) erros.titulo = true
  if (!form.resumo.trim() || form.resumo.length > LIMITE_RESUMO) erros.resumo = true
  if (!form.anoSemestre) erros.anoSemestre = true
  if (!form.orientador) erros.orientador = true
  if (!form.linkLume.trim()) erros.linkLume = true
  if (form.tags.length === 0) erros.tags = true
  if (form.tags.length > LIMITE_TAGS) erros.tags = true
  return erros
}

// Botão "Salvar como rascunho": só o título é exigido (seção 2.2 da Entrega 2; CT51).
export function validarRascunho(form) {
  return !form.titulo.trim() || form.titulo.length > LIMITE_TITULO ? { titulo: true } : {}
}

// Limites de arquivo (Tabela 11, L14 e L15; CT50). Devolve a mensagem de erro ou null.
export function verificarTamanho(bytes, limiteMb, rotulo) {
  return bytes > limiteMb * 1024 * 1024 ? `${rotulo} excede o limite de ${limiteMb} MB.` : null
}

// O que fazer depois da validação do link (UC01 FA02 e UC02; CT02, CT20, CT45, CT52).
// Um TCC já publicado nunca volta a rascunho por causa de uma edição: a versão publicada é mantida.
export function decidirPublicacao(original, linkValido) {
  if (linkValido) return 'PUBLICAR'
  return original?.status === 'PUBLICADO' ? 'MANTER_PUBLICADO' : 'OFERECER_RASCUNHO'
}

// Excluir TCC (seção 2.2; CT53 e CT54).
// O autor remove o próprio TCC; o orientador ou o coorientador devolve o TCC a rascunho do aluno.
export function papelNaExclusao(tcc, usuario) {
  if (!tcc || !usuario) return null
  if (usuario.papel === 'ALUNO_FORMANDO' && tcc.autorId === usuario.cartao) return 'AUTOR'
  if (usuario.papel === 'PROFESSOR' && tcc.status === 'PUBLICADO' && orientaOuCoorienta(tcc, usuario.nome)) return 'ORIENTADOR'
  return null
}

export function excluirTcc(tccs, id, usuario) {
  const tcc = tccs.find((t) => t.id === id)
  const papel = papelNaExclusao(tcc, usuario)
  if (papel === 'AUTOR') return tccs.filter((t) => t.id !== id)
  if (papel === 'ORIENTADOR') {
    return tccs.map((t) => (t.id === id ? { ...t, status: 'RASCUNHO', publicadoEm: null, devolvidoPor: usuario.nome } : t))
  }
  return tccs
}

// Simula a chamada ao LUME (ValidadorLumeService.validarIntegridadeLink).
export function validarIntegridadeLink(link, lumeIndisponivel) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(!lumeIndisponivel && LUME_REGEX.test(link.trim())), 900)
  })
}

export const FORMATOS_ARQUIVO = ['DOCX', 'PDF', 'EPUB']

export function formatoDoArquivo(nome) {
  const ext = (nome.split('.').pop() || '').toUpperCase()
  return FORMATOS_ARQUIVO.includes(ext) ? ext : null
}

// ---------- Download simulado: gera um PDF mínimo válido com o título do TCC ----------
export function gerarPdf(tcc) {
  const ascii = (s) => normalizar(s).replace(/[^\x20-\x7e]/g, '').replace(/[()\\]/g, '')
  const linhas = [
    'subsTCCk - arquivo de demonstracao (prototipo)',
    '',
    ascii(tcc.titulo).slice(0, 90),
    `Autor: ${ascii(tcc.autor)}`,
    `Orientador: ${ascii(tcc.orientador)}`,
    `Semestre: ${tcc.ano}/${tcc.semestre}`,
    `LUME: ${tcc.linkLume}`,
  ]
  const texto = linhas.map((l, i) => `BT /F1 ${i === 2 ? 14 : 11} Tf 60 ${780 - i * 22} Td (${l}) Tj ET`).join('\n')
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${texto.length} >>\nstream\n${texto}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = []
  objs.forEach((o, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n` })
  const xref = pdf.length
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`
  pdf += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new Blob([pdf], { type: 'application/pdf' })
}

export function baixarArquivo(blob, nome) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const formatarSemestre = (t) => (t.ano ? `${t.ano}/${t.semestre}` : 'semestre não informado')
export const novoId = () => Math.random().toString(36).slice(2, 9)
