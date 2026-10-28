import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { carregar, salvar, estadoInicial, useRota, ir } from './lib.js'
import { Icone } from './components/ui.jsx'
import { Avatar } from './components/Art.jsx'
import Feed from './views/Feed.jsx'
import Busca from './views/Busca.jsx'
import Detalhe from './views/Detalhe.jsx'
import Formulario from './views/Formulario.jsx'
import Perfil from './views/Perfil.jsx'
import Entrar from './views/Entrar.jsx'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export default function App() {
  const [estado, setEstado] = useState(carregar)
  const [avisos, setAvisos] = useState([])
  const { caminho, params } = useRota()

  useEffect(() => salvar(estado), [estado])

  const avisar = useCallback((texto, tom = 'ok') => {
    const id = Math.random()
    setAvisos((a) => [...a, { id, texto, tom }])
    setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), 4200)
  }, [])

  const acoes = useMemo(() => ({
    entrar: (usuario) => setEstado((e) => ({ ...e, usuario })),
    sair: () => { setEstado((e) => ({ ...e, usuario: null })); ir('/') },
    salvarTcc: (tcc) => setEstado((e) => ({
      ...e,
      tccs: e.tccs.some((t) => t.id === tcc.id) ? e.tccs.map((t) => (t.id === tcc.id ? tcc : t)) : [tcc, ...e.tccs],
    })),
    registrarVisualizacao: (id) => setEstado((e) => ({
      ...e, tccs: e.tccs.map((t) => (t.id === id ? { ...t, visualizacoes: t.visualizacoes + 1 } : t)),
    })),
    setDemo: (patch) => setEstado((e) => ({ ...e, demo: { ...e.demo, ...patch } })),
    restaurar: () => { setEstado(estadoInicial()); ir('/') },
    avisar,
  }), [avisar])

  let tela
  const [, secao, id] = caminho.split('/')
  if (secao === 'buscar') tela = <Busca params={params} />
  else if (secao === 'tcc') tela = <Detalhe id={id} />
  else if (secao === 'novo') tela = <Formulario key="novo" />
  else if (secao === 'editar') tela = <Formulario key={id} id={id} />
  else if (secao === 'perfil') tela = <Perfil />
  else if (secao === 'entrar') tela = <Entrar destino={params.get('voltar')} />
  else tela = <Feed />

  return (
    <Ctx.Provider value={{ estado, ...acoes }}>
      <Cabecalho secao={secao || ''} />
      <main className="conteudo">{tela}</main>
      <Rodape />
      <NavInferior secao={secao || ''} />
      <PainelDemo />
      <div className="avisos" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} className={`aviso tom-${a.tom}`}>
            <Icone nome={a.tom === 'erro' ? 'alerta' : 'ok'} tamanho={18} /> {a.texto}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

function Logo() {
  return (
    <a href="#/" className="logo" aria-label="subsTCCk, página inicial">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill="var(--acento)" />
        <path d="M8 9h16v3H8zm0 5.5h16v3H8zM8 20h16v8l-8-4.5L8 28z" fill="white" />
      </svg>
      <span>subs<b>TCC</b>k</span>
    </a>
  )
}

function Cabecalho({ secao }) {
  const { estado, sair } = useApp()
  const u = estado.usuario
  const [termo, setTermo] = useState('')
  const pesquisar = (e) => {
    e.preventDefault()
    ir(`/buscar?termo=${encodeURIComponent(termo)}`)
    setTermo('')
  }
  return (
    <header className="cabecalho">
      <div className="cabecalho-interno">
        <Logo />
        <nav className="nav-topo" aria-label="Principal">
          <a href="#/" className={secao === '' ? 'ativo' : ''}>Descobrir</a>
          <a href="#/buscar" className={secao === 'buscar' ? 'ativo' : ''}>Buscar TCC</a>
        </nav>
        <form className="busca-rapida" onSubmit={pesquisar} role="search">
          <Icone nome="busca" tamanho={16} />
          <input value={termo} onChange={(e) => setTermo(e.target.value)} placeholder="Buscar por tema, autor ou orientador" aria-label="Busca rápida" />
        </form>
        <div className="cabecalho-acoes">
          {u?.papel === 'ALUNO_FORMANDO' && (
            <a href="#/novo" className="botao botao-primario botao-pequeno esconder-mobile"><Icone nome="mais" tamanho={16} /> Cadastrar TCC</a>
          )}
          {u ? (
            <div className="menu-usuario">
              <a href="#/perfil" className="usuario-chip" title="Meu perfil">
                <Avatar nome={u.nome} tamanho={30} />
                <span className="esconder-mobile">{u.nome.split(' ').slice(0, 2).join(' ')}</span>
              </a>
              <button className="botao-icone" onClick={sair} title="Sair" aria-label="Sair"><Icone nome="sair" /></button>
            </div>
          ) : (
            <a href="#/entrar" className="botao botao-contorno botao-pequeno">Entrar</a>
          )}
        </div>
      </div>
    </header>
  )
}

function NavInferior({ secao }) {
  const { estado } = useApp()
  const itens = [
    { href: '#/', s: '', icone: 'casa', rotulo: 'Descobrir' },
    { href: '#/buscar', s: 'buscar', icone: 'busca', rotulo: 'Buscar' },
    { href: '#/novo', s: 'novo', icone: 'mais', rotulo: 'Cadastrar' },
    { href: estado.usuario ? '#/perfil' : '#/entrar', s: estado.usuario ? 'perfil' : 'entrar', icone: 'usuario', rotulo: estado.usuario ? 'Perfil' : 'Entrar' },
  ]
  return (
    <nav className="nav-inferior" aria-label="Navegação">
      {itens.map((i) => (
        <a key={i.rotulo} href={i.href} className={secao === i.s ? 'ativo' : ''}>
          <Icone nome={i.icone} tamanho={22} /><span>{i.rotulo}</span>
        </a>
      ))}
    </nav>
  )
}

function Rodape() {
  return (
    <footer className="rodape">
      <p><strong>subsTCCk</strong> · Protótipo de alta fidelidade · INF01127 Engenharia de Software · Instituto de Informática UFRGS</p>
      <p className="suave">Dados fictícios. A publicação oficial dos TCCs continua sendo o repositório LUME.</p>
    </footer>
  )
}

const ROTEIRO = [
  ['CT01', 'Entrar como Aluno Formando → Cadastrar TCC com link do LUME válido → "TCC publicado com sucesso!"'],
  ['CT02', 'No cadastro, usar o link http://exemplo.com/tcc-123 → aviso do LUME → "Salvar como rascunho"'],
  ['CT03', 'Buscar TCC → Ano 2025 + Orientador Carlos Lima + Tag Redes → apenas o TCC A'],
  ['CT04', 'No cadastro, tentar uma 6ª tag e uma 4ª imagem; deixar o Resumo vazio e publicar'],
  ['CT05', 'Buscar "blockchain" com a tag Redes → mensagem de nenhum resultado'],
  ['CT06', 'Ligar "Simular falha no download" → abrir um TCC → Baixar Artigo'],
]

function PainelDemo() {
  const { estado, setDemo, restaurar, avisar } = useApp()
  const [aberto, setAberto] = useState(false)
  return (
    <div className={`painel-demo ${aberto ? 'aberto' : ''}`}>
      <button className="painel-demo-botao" onClick={() => setAberto(!aberto)} aria-expanded={aberto}>
        <Icone nome="config" tamanho={16} /> Demonstração
      </button>
      {aberto && (
        <div className="painel-demo-corpo">
          <p className="painel-titulo">Simulações para os casos de teste</p>
          <label className="interruptor">
            <input type="checkbox" checked={estado.demo.lumeIndisponivel} onChange={(e) => setDemo({ lumeIndisponivel: e.target.checked })} />
            <span>Simular LUME indisponível</span>
          </label>
          <label className="interruptor">
            <input type="checkbox" checked={estado.demo.falhaDownload} onChange={(e) => setDemo({ falhaDownload: e.target.checked })} />
            <span>Simular falha no download</span>
          </label>
          <button className="botao botao-contorno botao-pequeno largo" onClick={() => { restaurar(); avisar('Base de dados restaurada ao estado inicial') }}>
            Restaurar dados iniciais
          </button>
          <p className="painel-titulo">Roteiro</p>
          <ol className="roteiro">
            {ROTEIRO.map(([ct, txt]) => <li key={ct}><b>{ct}</b> {txt}</li>)}
          </ol>
          <p className="suave pequeno">Contas: Aluno 00312345 / Professor 00012345 (senha: demo)</p>
        </div>
      )}
    </div>
  )
}
