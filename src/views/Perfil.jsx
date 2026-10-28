// Perfil: "Meus TCCs" (aluno formando, com status) ou "Trabalhos orientados" (professor).
import { useApp } from '../App.jsx'
import { formatarSemestre, maisRecentePrimeiro } from '../lib.js'
import { Avatar, Capa } from '../components/Art.jsx'
import { Icone, Vazio } from '../components/ui.jsx'

export default function Perfil() {
  const { estado } = useApp()
  const u = estado.usuario
  if (!u) {
    return (
      <div className="pagina estreita">
        <Vazio titulo="Entre para ver seu perfil."><a className="botao botao-primario" href="#/entrar?voltar=/perfil">Entrar com a UFRGS</a></Vazio>
      </div>
    )
  }
  const ehAluno = u.papel === 'ALUNO_FORMANDO'
  const lista = estado.tccs
    .filter((t) => (ehAluno ? t.autorId === u.cartao : (t.orientador === u.nome || t.coorientador === u.nome) && t.status === 'PUBLICADO'))
    .sort(maisRecentePrimeiro)
  const totalVis = lista.reduce((s, t) => s + t.visualizacoes, 0)

  return (
    <div className="pagina perfil">
      <header className="perfil-cabecalho">
        <Avatar nome={u.nome} tamanho={64} />
        <div>
          <h1>{u.nome}</h1>
          <p className="suave">{ehAluno ? `Aluno formando · ${u.curso} · Cartão ${u.cartao}` : `Professor · ${u.departamento}`}</p>
        </div>
        {ehAluno && <a href="#/novo" className="botao botao-primario"><Icone nome="mais" tamanho={16} /> Cadastrar Novo TCC</a>}
      </header>

      <div className="estatisticas">
        <div><strong>{lista.length}</strong><span>{ehAluno ? 'TCCs cadastrados' : 'trabalhos orientados'}</span></div>
        <div><strong>{lista.filter((t) => t.status === 'PUBLICADO').length}</strong><span>publicados</span></div>
        <div><strong>{totalVis.toLocaleString('pt-BR')}</strong><span>visualizações</span></div>
      </div>

      <h2 className="rotulo-secao">{ehAluno ? 'Meus TCCs' : 'Trabalhos orientados e coorientados'}</h2>
      {lista.length === 0 ? (
        <Vazio titulo={ehAluno ? 'Você ainda não cadastrou nenhum TCC.' : 'Nenhum trabalho orientado publicado.'}>
          {ehAluno && <a className="botao botao-primario" href="#/novo">Cadastrar Novo TCC</a>}
        </Vazio>
      ) : (
        <div className="tabela-tccs">
          {lista.map((t) => (
            <div key={t.id} className="linha-tcc">
              <Capa tcc={t} className="capa-linha" />
              <div className="linha-tcc-texto">
                <a href={`#/tcc/${t.id}`}><strong>{t.titulo}</strong></a>
                <span className="suave pequeno">{ehAluno ? t.orientador : t.autor} · {formatarSemestre(t)} · {t.tags.join(', ')}</span>
              </div>
              <span className={`status status-${t.status.toLowerCase()}`}>{t.status === 'PUBLICADO' ? 'Publicado' : 'Rascunho'}</span>
              <span className="meta-icone suave"><Icone nome="olho" tamanho={15} /> {t.visualizacoes}</span>
              {ehAluno && <a className="botao-icone" href={`#/editar/${t.id}`} title="Editar" aria-label="Editar"><Icone nome="editar" /></a>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
