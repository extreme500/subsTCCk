// Autenticação simulada com credenciais institucionais (pré-condição do UC01).
import { useState } from 'react'
import { useApp } from '../App.jsx'
import { ir } from '../lib.js'
import { CONTAS_DEMO } from '../data.js'
import { Icone } from '../components/ui.jsx'

export default function Entrar({ destino }) {
  const { entrar, avisar } = useApp()
  const [cartao, setCartao] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  const concluir = (conta) => {
    const { senha: _, ...usuario } = conta
    entrar(usuario)
    avisar(`Bem-vindo(a), ${usuario.nome}`)
    ir(destino || (usuario.papel === 'ALUNO_FORMANDO' ? '/perfil' : '/'))
  }
  const enviar = (e) => {
    e.preventDefault()
    const conta = CONTAS_DEMO.find((c) => c.cartao === cartao.trim() && c.senha === senha)
    if (!conta) { setErro('Cartão UFRGS ou senha inválidos.'); return }
    concluir(conta)
  }

  return (
    <div className="pagina entrar">
      <div className="entrar-cartao">
        <h1>Entrar</h1>
        <p className="suave">Use suas credenciais institucionais da UFRGS. Apenas alunos formandos podem publicar TCCs.</p>
        <form onSubmit={enviar}>
          <div className={`campo ${erro ? 'com-erro' : ''}`}>
            <label htmlFor="cartao">Cartão UFRGS</label>
            <input id="cartao" inputMode="numeric" value={cartao} onChange={(e) => { setCartao(e.target.value); setErro('') }} placeholder="00000000" autoComplete="username" />
          </div>
          <div className={`campo ${erro ? 'com-erro' : ''}`}>
            <label htmlFor="senha">Senha</label>
            <input id="senha" type="password" value={senha} onChange={(e) => { setSenha(e.target.value); setErro('') }} autoComplete="current-password" />
          </div>
          {erro && <p className="aviso-campo"><Icone nome="alerta" tamanho={15} /> {erro}</p>}
          <button className="botao botao-primario largo" type="submit">Entrar</button>
        </form>
        <div className="separador"><span>contas de demonstração</span></div>
        <div className="contas-demo">
          {CONTAS_DEMO.map((c) => (
            <button key={c.cartao} className="conta-demo" onClick={() => concluir(c)}>
              <strong>{c.papel === 'ALUNO_FORMANDO' ? 'Aluno Formando' : 'Professor'}</strong>
              <span className="suave pequeno">{c.nome} · {c.cartao}</span>
            </button>
          ))}
        </div>
        <button className="link-acao centro" onClick={() => ir('/')}>Continuar como visitante (somente leitura)</button>
      </div>
    </div>
  )
}
