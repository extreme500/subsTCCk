# Diagrama de atividades do UC04 (Buscar e Filtrar TCCs) redesenhado na Etapa 3:
# mensagens completas do UC04, filtro de coleção, TCC sem arquivo, arquivo indisponível (FA03) e falha (FA02).
# Uso: python uml-atividades-uc04.py [saida.png]
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uml_base import Tela, raias, acao, decisao, inicio, fim, fluxo, ROXO, LARANJA  # noqa: E402

SAIDA = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uml-atividades-uc04.png')
W, H = 2260, 2030
t = Tela(W, H)
raias(t, [('Usuário Leitor', 20, 600), ('Sistema', 600, 1720), ('Armazenamento de Arquivos', 1720, 2240)], H - 20)

U, S, S2, A = 300, 960, 1440, 1980
UL, SI, AR = LARANJA, (255, 246, 214), ROXO

ini = inicio(t, U, 130)
u1 = acao(t, U, 220, 340, 'Selecionar "Buscar TCC"', UL)
s1 = acao(t, S, 220, 440, 'Exibir barra de pesquisa e filtros (Ano, Autor, Orientador, Coleção, Tags)', SI)
m1 = decisao(t, U, 350, 70, 56)
u2 = acao(t, U, 450, 360, 'Inserir termos e/ou selecionar filtros', UL)
u3 = acao(t, U, 570, 340, 'Clicar em "Pesquisar"', UL)
s2 = acao(t, S, 570, 380, 'Aplicar todos os filtros juntos (somente TCCs PUBLICADOS)', SI)
d1 = decisao(t, S, 720, 260, 130, 'Há trabalhos compatíveis?')
s3 = acao(t, S2, 720, 390, 'Exibir "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros." (FA01)', SI)
s4 = acao(t, S, 880, 360, 'Exibir resultados em feed (mais recente primeiro)', SI)
u4 = acao(t, U, 880, 340, 'Selecionar o trabalho', UL)
s5 = acao(t, S, 1030, 400, 'Exibir detalhes (resumo, imagens, tags e trabalhos conexos)', SI)
d2 = decisao(t, S, 1180, 260, 120, 'O TCC tem arquivo?')
s6 = acao(t, S2, 1180, 340, 'Exibir botão "Acessar texto no LUME"', SI)
fim1 = fim(t, S2, 1290)
m2 = decisao(t, U, 1250, 70, 56)
u5 = acao(t, U, 1350, 340, 'Clicar em "Baixar Artigo"', UL)
a1 = acao(t, A, 1350, 380, 'Transferir arquivo (DOCX, PDF ou EPUB)', AR)
d3 = decisao(t, A, 1500, 260, 120, 'Arquivo encontrado?')
s7 = acao(t, S2, 1500, 390, 'Exibir "O arquivo deste TCC está indisponível no momento. Acesse o texto pelo LUME." (FA03)', SI)
fim2 = fim(t, S2, 1615)
d4 = decisao(t, A, 1690, 280, 130, 'Transferência concluída?')
s8 = acao(t, S, 1690, 420, 'Exibir "Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente." (FA02)', SI)
s9 = acao(t, S2, 1860, 330, 'Salvar arquivo no dispositivo', SI)
fim3 = fim(t, S2, 1960)

fluxo(t, [ini.base, u1.topo])
fluxo(t, [u1.dir, s1.esq])
fluxo(t, [s1.base, (S, 300), (U, 300), m1.topo])
fluxo(t, [m1.base, u2.topo])
fluxo(t, [u2.base, u3.topo])
fluxo(t, [u3.dir, s2.esq])
fluxo(t, [s2.base, d1.topo])
fluxo(t, [d1.dir, s3.esq], 'não', (d1.dir[0] + 12, 700))
fluxo(t, [s3.topo, (S2, 350), m1.dir])
fluxo(t, [d1.base, s4.topo], 'sim', (S + 12, 805))
fluxo(t, [s4.esq, u4.dir])
fluxo(t, [u4.base, (U, 1030), s5.esq])
fluxo(t, [s5.base, d2.topo])
fluxo(t, [d2.dir, s6.esq], 'não', (d2.dir[0] + 12, 1160))
fluxo(t, [s6.base, fim1.topo])
fluxo(t, [d2.esq, (U, 1180), m2.topo], 'sim', (d2.esq[0] - 12, 1160), 'rm')
fluxo(t, [m2.base, u5.topo])
fluxo(t, [u5.dir, a1.esq])
fluxo(t, [a1.base, d3.topo])
fluxo(t, [d3.esq, s7.dir], 'não', (d3.esq[0] - 12, 1480), 'rm')
fluxo(t, [s7.base, fim2.topo])
fluxo(t, [d3.base, d4.topo], 'sim', (A + 12, 1600))
fluxo(t, [d4.esq, s8.dir], 'não', (d4.esq[0] - 12, 1670), 'rm')
fluxo(t, [s8.esq, (60, s8.cy), (60, m2.cy), m2.esq])
fluxo(t, [d4.base, (A, 1860), s9.dir], 'sim', (A + 12, 1790))
fluxo(t, [s9.base, fim3.topo])

t.salvar(SAIDA)
print('ok', SAIDA)
