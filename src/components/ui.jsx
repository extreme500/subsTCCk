import { useEffect } from 'react'
import { Capa, Avatar, Tag } from './Art.jsx'
import { formatarSemestre, ir } from '../lib.js'

const CAMINHOS = {
  casa: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  busca: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16l-4.3-4.3',
  mais: 'M12 5v14M5 12h14',
  usuario: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0',
  olho: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  baixar: 'M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 20h14',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  filtro: 'M4 5h16l-6 8v5l-4 2v-7z',
  fechar: 'M6 6l12 12M18 6L6 18',
  alerta: 'M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  ok: 'M20 6L9 17l-5-5',
  imagem: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01',
  arquivo: 'M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5',
  editar: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  config: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  sair: 'M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3',
  fogo: 'M12 3s5 4.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3 1-6 1-8.5z',
}

export function Icone({ nome, tamanho = 18, className = '' }) {
  return (
    <svg className={`icone ${className}`} width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={CAMINHOS[nome]} />
    </svg>
  )
}

export function CartaoTcc({ tcc, destaque = false }) {
  const abrir = () => ir(`/tcc/${tcc.id}`)
  if (destaque) {
    return (
      <article className="cartao-destaque" onClick={abrir}>
        <Capa tcc={tcc} className="capa-grande" />
        <div className="cartao-destaque-corpo">
          <span className="sobretitulo">Defendido em {formatarSemestre(tcc)} · {tcc.colecao}</span>
          <h2><a href={`#/tcc/${tcc.id}`} onClick={(e) => e.stopPropagation()}>{tcc.titulo}</a></h2>
          <p className="resumo-curto">{tcc.resumo}</p>
          <Autoria tcc={tcc} />
        </div>
      </article>
    )
  }
  return (
    <article className="cartao" onClick={abrir}>
      <div className="cartao-texto">
        <Autoria tcc={tcc} compacto />
        <h3><a href={`#/tcc/${tcc.id}`} onClick={(e) => e.stopPropagation()}>{tcc.titulo}</a></h3>
        <p className="resumo-curto">{tcc.resumo}</p>
        <div className="cartao-meta">
          <span>{formatarSemestre(tcc)}</span>
          <span className="ponto">·</span>
          <span className="meta-icone"><Icone nome="olho" tamanho={15} /> {tcc.visualizacoes}</span>
          <span className="cartao-tags">{tcc.tags.slice(0, 2).map((t) => <Tag key={t} nome={t} />)}</span>
        </div>
      </div>
      <Capa tcc={tcc} className="capa-mini" />
    </article>
  )
}

export function Autoria({ tcc, compacto }) {
  return (
    <div className={`autoria ${compacto ? 'compacta' : ''}`}>
      <Avatar nome={tcc.autor} tamanho={compacto ? 22 : 30} />
      <span><strong>{tcc.autor}</strong>{' '}<span className="suave">orientado por {tcc.orientador}</span></span>
    </div>
  )
}

export function Modal({ titulo, icone, tom = 'neutro', children, acoes, onFechar }) {
  useEffect(() => {
    const f = (e) => e.key === 'Escape' && onFechar && onFechar()
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [onFechar])
  return (
    <div className="modal-fundo" onClick={onFechar}>
      <div className={`modal tom-${tom}`} role="dialog" aria-modal="true" aria-labelledby="modal-titulo" onClick={(e) => e.stopPropagation()}>
        {icone && <div className="modal-icone"><Icone nome={icone} tamanho={26} /></div>}
        <h3 id="modal-titulo">{titulo}</h3>
        <div className="modal-corpo">{children}</div>
        <div className="modal-acoes">{acoes}</div>
      </div>
    </div>
  )
}

export function Vazio({ titulo, children }) {
  return (
    <div className="vazio">
      <div className="vazio-icone"><Icone nome="busca" tamanho={28} /></div>
      <p className="vazio-titulo">{titulo}</p>
      {children}
    </div>
  )
}
