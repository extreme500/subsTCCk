// Excluir TCC (seção 2.2 da Entrega 2; CT53 e CT54).
// Autor: o TCC é removido. Orientador ou coorientador: o TCC volta a ser rascunho do aluno.
import { useState } from 'react'
import { useApp } from '../App.jsx'
import { ir, papelNaExclusao } from '../lib.js'
import { Icone, Modal } from './ui.jsx'

export default function BotaoExcluir({ tcc, compacto = false, depois = '/perfil' }) {
  const { estado, excluir, avisar } = useApp()
  const [confirmando, setConfirmando] = useState(false)
  const papel = papelNaExclusao(tcc, estado.usuario)
  if (!papel) return null

  const confirmar = () => {
    excluir(tcc.id)
    setConfirmando(false)
    avisar(papel === 'AUTOR' ? 'TCC excluído' : 'TCC devolvido ao aluno como rascunho')
    ir(depois)
  }

  return (
    <>
      {compacto ? (
        <button className="botao-icone" onClick={() => setConfirmando(true)} title="Excluir" aria-label="Excluir"><Icone nome="lixeira" /></button>
      ) : (
        <button className="link-acao link-perigo" onClick={() => setConfirmando(true)}><Icone nome="lixeira" tamanho={15} /> Excluir</button>
      )}
      {confirmando && (
        <Modal
          titulo={papel === 'AUTOR' ? 'Excluir este TCC?' : 'Remover este TCC da sua orientação?'}
          icone="alerta"
          tom="alerta"
          onFechar={() => setConfirmando(false)}
          acoes={<>
            <button className="botao botao-contorno" onClick={() => setConfirmando(false)}>Cancelar</button>
            <button className="botao botao-perigo" onClick={confirmar}>{papel === 'AUTOR' ? 'Excluir TCC' : 'Devolver ao aluno'}</button>
          </>}
        >
          {papel === 'AUTOR' ? (
            <p>"{tcc.titulo}" será removido da plataforma, inclusive do seu perfil. Esta ação não pode ser desfeita.</p>
          ) : (
            <p>"{tcc.titulo}" sairá do feed, da busca e do seu perfil e voltará a ser um rascunho de {tcc.autor}, que poderá corrigir o orientador e publicar de novo.</p>
          )}
        </Modal>
      )}
    </>
  )
}
