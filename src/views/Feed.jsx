// RF#02 — Feed de Destaques e Descoberta: TCCs defendidos mais recentemente + tópicos mais explorados.
import { useState } from 'react'
import { useApp } from '../App.jsx'
import { maisRecentePrimeiro, tagsEmAlta, ir } from '../lib.js'
import { CartaoTcc, Icone } from '../components/ui.jsx'
import { Tag } from '../components/Art.jsx'
import { COLECOES } from '../data.js'

export default function Feed() {
  const { estado } = useApp()
  const [aba, setAba] = useState('recentes')
  const publicados = estado.tccs.filter((t) => t.status === 'PUBLICADO')
  const recentes = [...publicados].sort(maisRecentePrimeiro)
  const lista = aba === 'recentes' ? recentes : [...publicados].sort((a, b) => b.visualizacoes - a.visualizacoes)
  const [destaque, ...resto] = recentes
  const emAlta = tagsEmAlta(estado.tccs)
  const max = emAlta[0]?.[1] || 1

  return (
    <div className="pagina feed">
      <section className="boas-vindas">
        <h1>Os TCCs do INF, fora da caixa de e-mail.</h1>
        <p>Descubra o que os formandos de Computação da UFRGS estão pesquisando, encontre trabalhos relacionados e potenciais orientadores.</p>
        <div className="atalhos-tags">
          {emAlta.slice(0, 5).map(([tag]) => <Tag key={tag} nome={tag} onClick={() => ir(`/buscar?tag=${encodeURIComponent(tag)}`)} />)}
        </div>
      </section>

      <div className="feed-grade">
        <div className="feed-principal">
          {destaque && (
            <>
              <h2 className="rotulo-secao">Destaque do semestre</h2>
              <CartaoTcc tcc={destaque} destaque />
            </>
          )}
          <div className="abas" role="tablist">
            <button role="tab" aria-selected={aba === 'recentes'} className={aba === 'recentes' ? 'ativo' : ''} onClick={() => setAba('recentes')}>Defendidos recentemente</button>
            <button role="tab" aria-selected={aba === 'lidos'} className={aba === 'lidos' ? 'ativo' : ''} onClick={() => setAba('lidos')}>Mais lidos</button>
          </div>
          <div className="lista-cartoes">
            {(aba === 'recentes' ? resto : lista).map((t) => <CartaoTcc key={t.id} tcc={t} />)}
          </div>
        </div>

        <aside className="feed-lateral">
          <div className="bloco">
            <h2 className="rotulo-secao"><Icone nome="fogo" tamanho={16} /> Tópicos mais explorados</h2>
            <ol className="ranking">
              {emAlta.map(([tag, vis], i) => (
                <li key={tag}>
                  <button className="ranking-item" onClick={() => ir(`/buscar?tag=${encodeURIComponent(tag)}`)}>
                    <span className="ranking-pos">{i + 1}</span>
                    <span className="ranking-nome">{tag}</span>
                    <span className="ranking-barra"><span style={{ width: `${(vis / max) * 100}%` }} /></span>
                    <span className="ranking-num">{vis.toLocaleString('pt-BR')}</span>
                  </button>
                </li>
              ))}
            </ol>
            <p className="suave pequeno">Visualizações somadas no período</p>
          </div>
          <div className="bloco">
            <h2 className="rotulo-secao">Coleções</h2>
            {COLECOES.map((c) => (
              <button key={c} className="link-colecao" onClick={() => ir(`/buscar?colecao=${encodeURIComponent(c)}`)}>
                {c}<span>{publicados.filter((t) => t.colecao === c).length} TCCs</span>
              </button>
            ))}
          </div>
          {!estado.usuario && (
            <div className="bloco bloco-cta">
              <p><strong>Vai defender seu TCC?</strong></p>
              <p className="suave">Entre com sua conta da UFRGS e publique seu trabalho com resumo acessível e imagens.</p>
              <a className="botao botao-primario botao-pequeno" href="#/entrar">Entrar com a UFRGS</a>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
