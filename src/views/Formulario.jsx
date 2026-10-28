// UC01 — Cadastrar TCC / UC02 — Editar TCC (ambos incluem UC03 — Validar Link do LUME).
import { useRef, useState } from 'react'
import { useApp } from '../App.jsx'
import {
  validarCamposObrigatorios, validarIntegridadeLink, formatoDoArquivo, novoId, ir, normalizar,
} from '../lib.js'
import { Icone, Modal } from '../components/ui.jsx'
import { Figura, Tag } from '../components/Art.jsx'
import { TAGS_SUGERIDAS, ORIENTADORES, SEMESTRES, LIMITE_TAGS, LIMITE_MIDIAS } from '../data.js'

const TIPOS_EXEMPLO = ['grafo', 'barras', 'linha', 'tela']

function formDoTcc(t) {
  if (!t) {
    return { titulo: '', resumo: '', anoSemestre: '', orientador: '', coorientador: '', linkLume: '', tags: [], midias: [], arquivo: null }
  }
  return {
    titulo: t.titulo, resumo: t.resumo, anoSemestre: `${t.ano}/${t.semestre}`, orientador: t.orientador,
    coorientador: t.coorientador, linkLume: t.linkLume, tags: [...t.tags], midias: [...t.midias], arquivo: t.arquivo,
  }
}

// Reduz a imagem para no máximo 1200 px para caber no armazenamento local do protótipo.
function lerImagem(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader()
    leitor.onerror = reject
    leitor.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const escala = Math.min(1, 1200 / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = Math.round(img.width * escala)
        c.height = Math.round(img.height * escala)
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
        resolve(c.toDataURL('image/jpeg', 0.82))
      }
      img.src = leitor.result
    }
    leitor.readAsDataURL(arquivo)
  })
}

export default function Formulario({ id }) {
  const { estado, salvarTcc, avisar } = useApp()
  const u = estado.usuario
  const original = id ? estado.tccs.find((t) => t.id === id) : null
  const [form, setForm] = useState(() => formDoTcc(original))
  const [erros, setErros] = useState({})
  const [avisosCampo, setAvisosCampo] = useState({})
  const [novaTag, setNovaTag] = useState('')
  const [validando, setValidando] = useState(false)
  const [modal, setModal] = useState(null)
  const topo = useRef(null)

  if (!u || u.papel !== 'ALUNO_FORMANDO') {
    return (
      <div className="pagina estreita">
        <div className="bloqueio">
          <Icone nome="usuario" tamanho={30} />
          <h1>Publicação restrita a formandos</h1>
          <p className="suave">O cadastro e a edição de TCCs exigem login com as credenciais institucionais da UFRGS de um aluno formando. Visitantes e professores podem buscar e ler os trabalhos normalmente.</p>
          {!u
            ? <a className="botao botao-primario" href={`#/entrar?voltar=${id ? `/editar/${id}` : '/novo'}`}>Entrar com a UFRGS</a>
            : <a className="botao botao-contorno" href="#/">Voltar ao feed</a>}
        </div>
      </div>
    )
  }
  if (id && (!original || original.autorId !== u.cartao)) {
    return <div className="pagina estreita"><div className="bloqueio"><h1>Você só pode editar os seus próprios TCCs.</h1><a className="botao botao-contorno" href="#/perfil">Ir para meu perfil</a></div></div>
  }

  const atualizar = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }))
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: false }))
  }
  const avisarCampo = (campo, texto) => {
    setAvisosCampo((a) => ({ ...a, [campo]: texto }))
    setTimeout(() => setAvisosCampo((a) => ({ ...a, [campo]: null })), 3500)
  }

  const adicionarTag = (bruta) => {
    const tag = bruta.trim().replace(/\s+/g, ' ')
    if (!tag) return
    if (form.tags.some((t) => normalizar(t) === normalizar(tag))) return
    if (form.tags.length >= LIMITE_TAGS) { avisarCampo('tags', `Limite de ${LIMITE_TAGS} tags atingido. Remova uma tag para adicionar outra.`); return }
    atualizar('tags', [...form.tags, tag.charAt(0).toUpperCase() + tag.slice(1)])
    setNovaTag('')
  }

  const adicionarImagens = async (arquivos) => {
    let atuais = [...form.midias]
    for (const arq of arquivos) {
      if (atuais.length >= LIMITE_MIDIAS) { avisarCampo('midias', `Limite de ${LIMITE_MIDIAS} imagens atingido. Remova uma imagem para adicionar outra.`); break }
      if (!arq.type.startsWith('image/')) { avisarCampo('midias', 'Envie apenas arquivos de imagem (PNG, JPG, GIF, SVG).'); continue }
      try {
        const src = await lerImagem(arq)
        atuais = [...atuais, { src, descricao: arq.name.replace(/\.[^.]+$/, '') }]
      } catch { avisarCampo('midias', `Não foi possível ler ${arq.name}.`) }
    }
    atualizar('midias', atuais)
  }
  const adicionarExemplo = () => {
    if (form.midias.length >= LIMITE_MIDIAS) { avisarCampo('midias', `Limite de ${LIMITE_MIDIAS} imagens atingido. Remova uma imagem para adicionar outra.`); return }
    const tipo = TIPOS_EXEMPLO[form.midias.length % TIPOS_EXEMPLO.length]
    atualizar('midias', [...form.midias, { tipo, descricao: 'Figura de demonstração' }])
  }

  const escolherArquivo = (arq) => {
    if (!arq) return
    const formato = formatoDoArquivo(arq.name)
    if (!formato) { avisarCampo('arquivo', 'Formato não suportado. Envie um arquivo DOCX, PDF ou EPUB.'); return }
    atualizar('arquivo', { nome: arq.name, formato })
  }

  const montarTcc = (status) => {
    const [ano, semestre] = form.anoSemestre.split('/').map(Number)
    return {
      ...(original || { id: novoId(), visualizacoes: 0, autor: u.nome, autorId: u.cartao, colecao: u.curso }),
      titulo: form.titulo.trim(), resumo: form.resumo.trim(), ano, semestre,
      orientador: form.orientador, coorientador: form.coorientador, linkLume: form.linkLume.trim(),
      tags: form.tags, midias: form.midias, arquivo: form.arquivo, status,
      publicadoEm: status === 'PUBLICADO' ? (original?.publicadoEm || new Date().toISOString().slice(0, 10)) : null,
    }
  }

  const publicar = async (e) => {
    e.preventDefault()
    const encontrados = validarCamposObrigatorios(form)
    setErros(encontrados)
    if (Object.keys(encontrados).length) {
      topo.current?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    setValidando(true)
    const valido = await validarIntegridadeLink(form.linkLume, estado.demo.lumeIndisponivel)
    setValidando(false)
    if (valido) {
      const tcc = montarTcc('PUBLICADO')
      salvarTcc(tcc)
      setModal({ tipo: 'sucesso', id: tcc.id })
    } else {
      setModal({ tipo: 'lume' })
    }
  }

  const salvarRascunho = () => {
    salvarTcc(montarTcc('RASCUNHO'))
    setModal(null)
    avisar('Rascunho salvo com sucesso')
    ir('/perfil')
  }

  const temErros = Object.values(erros).some(Boolean)
  const classe = (campo) => `campo ${erros[campo] ? 'com-erro' : ''}`
  const sugestoes = TAGS_SUGERIDAS.filter((t) => !form.tags.includes(t))

  return (
    <div className="pagina formulario" ref={topo}>
      <div className="form-topo">
        <span className="sobretitulo">{id ? 'Editar TCC' : 'Cadastrar Novo TCC'}</span>
        <span className="suave pequeno">Campos com * são obrigatórios</span>
      </div>

      {temErros && (
        <div className="alerta-erro" role="alert"><Icone nome="alerta" /> Preencha todos os campos obrigatórios</div>
      )}

      <form onSubmit={publicar} noValidate>
        <div className={classe('titulo')}>
          <label htmlFor="titulo" className="rotulo-oculto">Título *</label>
          <textarea id="titulo" className="entrada-titulo" rows={2} placeholder="Título do TCC *" value={form.titulo} onChange={(e) => atualizar('titulo', e.target.value)} />
        </div>
        <div className={classe('resumo')}>
          <label htmlFor="resumo">Resumo simplificado *</label>
          <p className="dica">Explique o trabalho para alguém de outra área: qual problema, o que foi feito e o que foi descoberto.</p>
          <textarea id="resumo" className="entrada-resumo" rows={6} value={form.resumo} onChange={(e) => atualizar('resumo', e.target.value)} placeholder="Escreva aqui o resumo acessível do seu trabalho…" />
          <span className="contagem">{form.resumo.length} caracteres</span>
        </div>

        <div className="cartao-form">
          <h2>Informações acadêmicas</h2>
          <div className="grade-campos">
            <div className={classe('anoSemestre')}>
              <label htmlFor="anoSemestre">Ano/Semestre *</label>
              <select id="anoSemestre" value={form.anoSemestre} onChange={(e) => atualizar('anoSemestre', e.target.value)}>
                <option value="">Selecione</option>
                {SEMESTRES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className={classe('orientador')}>
              <label htmlFor="orientador">Orientador *</label>
              <select id="orientador" value={form.orientador} onChange={(e) => atualizar('orientador', e.target.value)}>
                <option value="">Selecione</option>
                {ORIENTADORES.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="campo">
              <label htmlFor="coorientador">Coorientador <span className="suave">(opcional)</span></label>
              <select id="coorientador" value={form.coorientador} onChange={(e) => atualizar('coorientador', e.target.value)}>
                <option value="">Nenhum</option>
                {ORIENTADORES.filter((o) => o !== form.orientador).map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="campo">
              <label>Coleção</label>
              <input value={original?.colecao || u.curso} disabled />
            </div>
          </div>
        </div>

        <div className="cartao-form">
          <h2>Tags temáticas *</h2>
          <p className="dica">Selecione até {LIMITE_TAGS} tags da lista ou digite novas. Elas definem onde o TCC aparece na busca e nos trabalhos conexos.</p>
          <div className={`${classe('tags')} caixa-tags`}>
            {form.tags.map((t) => <Tag key={t} nome={t} ativo onRemover={() => atualizar('tags', form.tags.filter((x) => x !== t))} />)}
            <input
              value={novaTag}
              onChange={(e) => setNovaTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); adicionarTag(novaTag) } }}
              placeholder={form.tags.length ? 'Nova tag + Enter' : 'Digite uma tag e tecle Enter'}
              aria-label="Nova tag"
            />
            <span className="contagem">{form.tags.length}/{LIMITE_TAGS}</span>
          </div>
          {avisosCampo.tags && <p className="aviso-campo"><Icone nome="alerta" tamanho={15} /> {avisosCampo.tags}</p>}
          <div className="tags-opcoes">
            {sugestoes.map((t) => <Tag key={t} nome={t} onClick={() => adicionarTag(t)} />)}
          </div>
        </div>

        <div className="cartao-form">
          <h2>Imagens de demonstração</h2>
          <p className="dica">Até {LIMITE_MIDIAS} imagens, gráficos ou capturas de tela do projeto. A primeira vira a capa no feed.</p>
          <div className="midias">
            {form.midias.map((m, i) => (
              <div key={i} className="midia-item">
                <Figura midia={m} tcc={{ id: 'novo', tags: form.tags.length ? form.tags : ['IA'] }} indice={i} />
                <input value={m.descricao} onChange={(e) => atualizar('midias', form.midias.map((x, j) => (j === i ? { ...x, descricao: e.target.value } : x)))} aria-label={`Legenda da imagem ${i + 1}`} placeholder="Legenda" />
                <button type="button" className="botao-icone remover" onClick={() => atualizar('midias', form.midias.filter((_, j) => j !== i))} aria-label="Remover imagem"><Icone nome="fechar" tamanho={16} /></button>
              </div>
            ))}
            {form.midias.length < LIMITE_MIDIAS + 1 && (
              <div className="midia-adicionar">
                <label className="botao botao-contorno botao-pequeno">
                  <Icone nome="imagem" tamanho={16} /> Enviar imagem
                  <input type="file" accept="image/*" multiple hidden onChange={(e) => { adicionarImagens([...e.target.files]); e.target.value = '' }} />
                </label>
                <button type="button" className="link-acao" onClick={adicionarExemplo}>ou usar figura de exemplo</button>
                <span className="contagem">{form.midias.length}/{LIMITE_MIDIAS}</span>
              </div>
            )}
          </div>
          {avisosCampo.midias && <p className="aviso-campo"><Icone nome="alerta" tamanho={15} /> {avisosCampo.midias}</p>}
        </div>

        <div className="cartao-form">
          <h2>Documento oficial</h2>
          <div className={classe('linkLume')}>
            <label htmlFor="linkLume">Link do LUME *</label>
            <p className="dica">Ex.: https://lume.ufrgs.br/handle/10183/290114</p>
            <input id="linkLume" type="url" value={form.linkLume} onChange={(e) => atualizar('linkLume', e.target.value)} placeholder="https://lume.ufrgs.br/handle/10183/…" />
          </div>
          <div className="campo">
            <label>Arquivo do trabalho <span className="suave">(opcional · DOCX, PDF ou EPUB)</span></label>
            <div className="arquivo-linha">
              {form.arquivo ? (
                <span className="arquivo-chip"><Icone nome="arquivo" tamanho={16} /> {form.arquivo.nome}
                  <button type="button" aria-label="Remover arquivo" onClick={() => atualizar('arquivo', null)}>×</button>
                </span>
              ) : (
                <label className="botao botao-contorno botao-pequeno">
                  <Icone nome="arquivo" tamanho={16} /> Escolher arquivo
                  <input type="file" hidden onChange={(e) => { escolherArquivo(e.target.files[0]); e.target.value = '' }} />
                </label>
              )}
            </div>
            {avisosCampo.arquivo && <p className="aviso-campo"><Icone nome="alerta" tamanho={15} /> {avisosCampo.arquivo}</p>}
          </div>
        </div>

        <div className="form-acoes">
          <a className="botao botao-contorno" href={id ? `#/tcc/${id}` : '#/perfil'}>Cancelar</a>
          <button type="submit" className="botao botao-primario" disabled={validando}>
            {validando ? <><span className="girando" /> Validando link no LUME…</> : 'Publicar TCC'}
          </button>
        </div>
      </form>

      {modal?.tipo === 'lume' && (
        <Modal
          titulo="Não foi possível validar o link"
          icone="alerta"
          tom="alerta"
          onFechar={() => setModal(null)}
          acoes={<>
            <button className="botao botao-contorno" onClick={() => setModal(null)}>Não, voltar ao formulário</button>
            <button className="botao botao-primario" onClick={salvarRascunho}>Salvar como rascunho</button>
          </>}
        >
          <p>A URL informada não pertence ao domínio do LUME ou está inacessível. Deseja salvar como rascunho até que a publicação no LUME esteja homologada?</p>
        </Modal>
      )}
      {modal?.tipo === 'sucesso' && (
        <Modal
          titulo="TCC publicado com sucesso!"
          icone="ok"
          tom="ok"
          onFechar={() => ir(`/tcc/${modal.id}`)}
          acoes={<>
            <button className="botao botao-contorno" onClick={() => ir('/')}>Ir para o feed</button>
            <button className="botao botao-primario" onClick={() => ir(`/tcc/${modal.id}`)}>Ver publicação</button>
          </>}
        >
          <p>Seu trabalho já aparece no feed e nos resultados de busca pelas tags {form.tags.join(', ')}.</p>
        </Modal>
      )}
    </div>
  )
}
