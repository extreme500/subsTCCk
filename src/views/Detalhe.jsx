// UC05 — Visualizar Detalhes do TCC (+ UC06 Trabalhos Conexos e passos 8–9 / FA02 do UC04: Baixar Artigo).
import { useEffect, useRef, useState } from 'react'
import { useApp } from '../App.jsx'
import { baixarArquivo, formatarSemestre, gerarPdf, ir, trabalhosConexos } from '../lib.js'
import { Capa, Figura, Tag, Avatar } from '../components/Art.jsx'
import { Icone, Vazio } from '../components/ui.jsx'

export default function Detalhe({ id }) {
  const { estado, registrarVisualizacao, avisar } = useApp()
  const tcc = estado.tccs.find((t) => t.id === id)
  const u = estado.usuario
  const ehAutor = tcc && u && tcc.autorId === u.cartao
  const [download, setDownload] = useState('ocioso')
  const contado = useRef(null)

  useEffect(() => {
    if (tcc?.status === 'PUBLICADO' && contado.current !== id) {
      contado.current = id
      registrarVisualizacao(id)
    }
    setDownload('ocioso')
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!tcc || (tcc.status !== 'PUBLICADO' && !ehAutor)) {
    return (
      <div className="pagina">
        <Vazio titulo="Este TCC não está disponível.">
          <p className="suave">Ele pode ter sido removido ou ainda ser um rascunho.</p>
          <a className="botao botao-contorno" href="#/">Voltar ao feed</a>
        </Vazio>
      </div>
    )
  }

  const baixar = () => {
    setDownload('baixando')
    setTimeout(() => {
      if (estado.demo.falhaDownload) { setDownload('erro'); return }
      baixarArquivo(gerarPdf(tcc), tcc.arquivo.nome.replace(/\.(docx|epub)$/i, '.pdf'))
      setDownload('ocioso')
      avisar('Download concluído')
    }, 1300)
  }

  const conexos = trabalhosConexos(estado.tccs, tcc)

  return (
    <article className="pagina leitura">
      {tcc.status === 'RASCUNHO' && (
        <div className="faixa faixa-alerta">
          <Icone nome="alerta" /> Rascunho — visível apenas para você. Ele não aparece no feed nem na busca até ser publicado com um link válido do LUME.
          <a href={`#/editar/${tcc.id}`} className="botao botao-pequeno botao-contorno">Editar e publicar</a>
        </div>
      )}
      <header className="leitura-cabecalho">
        <a href="#/buscar" className="voltar" onClick={(e) => { if (window.history.length > 1) { e.preventDefault(); window.history.back() } }}>← Voltar</a>
        <div className="leitura-tags">{tcc.tags.map((t) => <Tag key={t} nome={t} onClick={() => ir(`/buscar?tag=${encodeURIComponent(t)}`)} />)}</div>
        <h1>{tcc.titulo}</h1>
        <div className="leitura-autoria">
          <Avatar nome={tcc.autor} tamanho={42} />
          <div>
            <strong>{tcc.autor}</strong>
            <span className="suave">
              Orientação: {tcc.orientador}{tcc.coorientador && ` · Coorientação: ${tcc.coorientador}`}
            </span>
            <span className="suave">{tcc.colecao} · Defendido em {formatarSemestre(tcc)}</span>
          </div>
        </div>
        <div className="leitura-acoes">
          {tcc.arquivo ? (
            <button className="botao botao-primario" onClick={baixar} disabled={download === 'baixando'}>
              <Icone nome="baixar" /> {download === 'baixando' ? 'Baixando…' : 'Baixar Artigo'}
              {download !== 'baixando' && <span className="formato">{tcc.arquivo.formato}</span>}
            </button>
          ) : (
            <a className="botao botao-primario" href={tcc.linkLume} target="_blank" rel="noreferrer"><Icone nome="baixar" /> Acessar texto no LUME</a>
          )}
          <a className="botao botao-contorno" href={tcc.linkLume} target="_blank" rel="noreferrer"><Icone nome="link" /> Ver no LUME</a>
          <span className="meta-icone suave"><Icone nome="olho" tamanho={16} /> {tcc.visualizacoes} visualizações</span>
          {ehAutor && <a className="link-acao" href={`#/editar/${tcc.id}`}><Icone nome="editar" tamanho={15} /> Editar</a>}
        </div>
        {download === 'erro' && (
          <div className="alerta-erro" role="alert">
            <Icone nome="alerta" />
            <span>Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente.</span>
            <button className="botao botao-pequeno botao-contorno" onClick={baixar}>Tentar novamente</button>
          </div>
        )}
      </header>

      <Capa tcc={tcc} className="capa-leitura" />

      <section className="leitura-corpo">
        <h2>Resumo</h2>
        <p className="resumo-longo">{tcc.resumo}</p>

        {tcc.midias.length > 0 && (
          <>
            <h2>Imagens de demonstração</h2>
            <div className="galeria">
              {tcc.midias.map((m, i) => (
                <figure key={i}>
                  <Figura midia={m} tcc={tcc} indice={i} />
                  <figcaption>Figura {i + 1}. {m.descricao}</figcaption>
                </figure>
              ))}
            </div>
          </>
        )}
      </section>

      {conexos.length > 0 && (
        <section className="conexos">
          <h2 className="rotulo-secao">Trabalhos conexos</h2>
          <p className="suave">Relacionados por tags em comum ou pelo mesmo orientador.</p>
          <div className="conexos-grade">
            {conexos.map((t) => (
              <a key={t.id} className="conexo" href={`#/tcc/${t.id}`}>
                <Capa tcc={t} className="capa-conexo" />
                <span className="conexo-tags">{t.tags.filter((x) => tcc.tags.includes(x)).join(' · ') || t.orientador}</span>
                <strong>{t.titulo}</strong>
                <span className="suave pequeno">{t.autor} · {formatarSemestre(t)}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
