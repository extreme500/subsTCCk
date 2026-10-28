// UC04 — Buscar e Filtrar TCCs (filtros combinados aplicados ao clicar em "Pesquisar").
import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../App.jsx'
import { buscar } from '../lib.js'
import { CartaoTcc, Icone, Vazio } from '../components/ui.jsx'
import { Tag } from '../components/Art.jsx'
import { ORIENTADORES, COLECOES, TAGS_SUGERIDAS } from '../data.js'

const vazio = { termo: '', ano: '', autor: '', orientador: '', colecao: '', tags: [] }

function filtrosDaUrl(params) {
  return {
    ...vazio,
    termo: params.get('termo') || '',
    colecao: params.get('colecao') || '',
    tags: params.get('tag') ? [params.get('tag')] : [],
  }
}

export default function Busca({ params }) {
  const { estado } = useApp()
  const chaveUrl = params.toString()
  const [form, setForm] = useState(() => filtrosDaUrl(params))
  const [aplicado, setAplicado] = useState(() => (chaveUrl ? filtrosDaUrl(params) : null))
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)

  useEffect(() => {
    const f = filtrosDaUrl(new URLSearchParams(chaveUrl))
    setForm(f)
    setAplicado(chaveUrl ? f : null)
  }, [chaveUrl])

  const anos = useMemo(() => [...new Set(estado.tccs.map((t) => t.ano))].sort((a, b) => b - a), [estado.tccs])
  const tagsDisponiveis = useMemo(() => {
    const todas = new Set(TAGS_SUGERIDAS)
    estado.tccs.forEach((t) => t.tags.forEach((x) => todas.add(x)))
    return [...todas]
  }, [estado.tccs])

  const resultados = aplicado ? buscar(estado.tccs, aplicado) : null
  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })
  const alternarTag = (tag) => setForm({
    ...form, tags: form.tags.includes(tag) ? form.tags.filter((t) => t !== tag) : [...form.tags, tag],
  })
  const pesquisar = (e) => { e?.preventDefault(); setAplicado(form); setFiltrosAbertos(false) }
  const removerFiltro = (campo, valor) => {
    const novo = campo === 'tags' ? { ...aplicado, tags: aplicado.tags.filter((t) => t !== valor) } : { ...aplicado, [campo]: '' }
    setForm(novo)
    setAplicado(novo)
  }
  const limpar = () => { setForm(vazio); setAplicado(null) }

  const chips = aplicado ? [
    aplicado.termo && ['termo', `“${aplicado.termo}”`],
    aplicado.ano && ['ano', `Ano ${aplicado.ano}`],
    aplicado.autor && ['autor', `Autor: ${aplicado.autor}`],
    aplicado.orientador && ['orientador', aplicado.orientador],
    aplicado.colecao && ['colecao', aplicado.colecao],
    ...aplicado.tags.map((t) => ['tags', t]),
  ].filter(Boolean) : []
  const qtdFiltros = [form.ano, form.autor, form.orientador, form.colecao].filter(Boolean).length + form.tags.length

  return (
    <div className="pagina busca">
      <h1 className="titulo-pagina">Buscar TCC</h1>
      <form onSubmit={pesquisar}>
        <div className="barra-busca">
          <Icone nome="busca" />
          <input value={form.termo} onChange={set('termo')} placeholder="Tema, palavra-chave, autor ou orientador" aria-label="Termos de busca" />
          <button type="button" className="botao-filtros-mobile" onClick={() => setFiltrosAbertos(!filtrosAbertos)} aria-expanded={filtrosAbertos}>
            <Icone nome="filtro" tamanho={16} /> Filtros{qtdFiltros > 0 && <span className="contador">{qtdFiltros}</span>}
          </button>
          <button type="submit" className="botao botao-primario">Pesquisar</button>
        </div>

        <div className={`filtros ${filtrosAbertos ? 'aberto' : ''}`}>
          <label className="campo-filtro">
            <span>Data/Ano</span>
            <select value={form.ano} onChange={set('ano')}>
              <option value="">Todos</option>
              {anos.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <label className="campo-filtro">
            <span>Autor</span>
            <input value={form.autor} onChange={set('autor')} placeholder="Nome do autor" />
          </label>
          <label className="campo-filtro">
            <span>Orientador</span>
            <select value={form.orientador} onChange={set('orientador')}>
              <option value="">Todos</option>
              {ORIENTADORES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="campo-filtro">
            <span>Coleção</span>
            <select value={form.colecao} onChange={set('colecao')}>
              <option value="">Todas</option>
              {COLECOES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <div className="campo-filtro campo-tags">
            <span>Assuntos/Tags</span>
            <div className="tags-opcoes">
              {tagsDisponiveis.map((t) => <Tag key={t} nome={t} ativo={form.tags.includes(t)} onClick={() => alternarTag(t)} />)}
            </div>
          </div>
        </div>
      </form>

      {resultados === null ? (
        <Vazio titulo="Combine termos e filtros e clique em “Pesquisar”.">
          <p className="suave">Os filtros são aplicados ao mesmo tempo: só aparecem trabalhos que atendem a todas as condições.</p>
        </Vazio>
      ) : (
        <>
          <div className="resultado-cabecalho">
            <p><strong>{resultados.length}</strong> {resultados.length === 1 ? 'trabalho encontrado' : 'trabalhos encontrados'}</p>
            <div className="chips-ativos">
              {chips.map(([campo, rotulo]) => (
                <span key={campo + rotulo} className="chip-ativo">
                  {rotulo}
                  <button aria-label={`Remover filtro ${rotulo}`} onClick={() => removerFiltro(campo, campo === 'tags' ? rotulo : null)}>×</button>
                </span>
              ))}
              {chips.length > 0 && <button className="link-acao" onClick={limpar}>Limpar tudo</button>}
            </div>
          </div>
          {resultados.length === 0 ? (
            <Vazio titulo="Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros." />
          ) : (
            <div className="lista-cartoes">{resultados.map((t) => <CartaoTcc key={t.id} tcc={t} />)}</div>
          )}
        </>
      )}
    </div>
  )
}
