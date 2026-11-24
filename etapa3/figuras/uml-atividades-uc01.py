# Diagrama de atividades do UC01 (Cadastrar TCC) redesenhado na Etapa 3:
# caminhos finais alternativos (sem barra de bifurcação), condições em todas as saídas das decisões,
# botão "Salvar como rascunho" e as duas respostas à oferta de rascunho do FA02.
# Uso: python uml-atividades-uc01.py [saida.png]
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uml_base import Tela, raias, acao, decisao, inicio, fim, fluxo, INK, f, fi, AZUL, ROXO, LARANJA  # noqa: E402

SAIDA = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uml-atividades-uc01.png')
W, H = 2240, 1560
t = Tela(W, H)
raias(t, [('Aluno Formando', 20, 680), ('Sistema', 680, 1800), ('LUME', 1800, 2220)], H - 20)

Aa, Ab, Sa, Sb, Sc, L = 250, 540, 880, 1200, 1560, 2010
AL, SI, LU = LARANJA, (255, 246, 214), ROXO

ini = inicio(t, Aa, 130)
a1 = acao(t, Aa, 220, 340, 'Abrir "Cadastrar Novo TCC"', AL)
s1 = acao(t, Sb, 220, 300, 'Exibir o formulário', SI)
m1 = decisao(t, Aa, 340, 70, 56)
m2 = decisao(t, Aa, 430, 70, 56)
a2 = acao(t, Aa, 560, 400, 'Preencher título, resumo, ano/semestre, orientador, tags, imagens e link do LUME', AL)
d1 = decisao(t, Aa, 720, 240, 120, 'Ação escolhida?')
d3 = decisao(t, Sc, 720, 300, 150, 'Campos obrigatórios preenchidos?')
s4 = acao(t, Sc, 530, 330, 'Exibir "Preencha todos os campos obrigatórios" (FA01)', SI)
l1 = acao(t, L, 720, 320, 'Checar existência e status do link', LU)
d4 = decisao(t, Sc, 900, 220, 110, 'Link válido?')
s5 = acao(t, Sc, 1060, 300, 'Indexar e publicar o TCC', SI)
s6 = acao(t, Sc, 1190, 330, 'Exibir "TCC publicado com sucesso!"', SI)
fim1 = fim(t, Sc, 1310)
s7 = acao(t, Sb, 900, 300, 'Exibir aviso do FA02 e oferecer rascunho', SI)
a3 = decisao(t, Ab, 900, 220, 120, 'Salvar como rascunho?')
d2 = decisao(t, Sa, 1080, 240, 120, 'Título preenchido?')
s2 = acao(t, Sa, 1230, 300, 'Exibir "Informe pelo menos o título"', SI)
m3 = decisao(t, Sb, 1080, 70, 56)
s3 = acao(t, Sb, 1220, 300, 'Salvar como RASCUNHO', SI)
s8 = acao(t, Sb, 1350, 330, 'Exibir "Rascunho salvo com sucesso"', SI)
fim2 = fim(t, Sb, 1460)

# fluxo principal
fluxo(t, [ini.base, a1.topo])
fluxo(t, [a1.dir, s1.esq])
fluxo(t, [s1.base, (Sb, 290), (Aa, 290), m1.topo])
fluxo(t, [m1.base, m2.topo])
fluxo(t, [m2.base, a2.topo])
fluxo(t, [a2.base, d1.topo])
# publicar
fluxo(t, [d1.dir, d3.esq], 'Publicar TCC', (d1.dir[0] + 14, 700))
fluxo(t, [d3.topo, s4.base], 'não', (Sc + 12, 625))
fluxo(t, [s4.topo, (Sc, 340), m1.dir])
fluxo(t, [d3.dir, l1.esq], 'sim', (d3.dir[0] + 12, 700))
fluxo(t, [l1.base, (L, 900), d4.dir])
fluxo(t, [d4.base, s5.topo], 'sim', (Sc + 12, 980))
fluxo(t, [s5.base, s6.topo])
fluxo(t, [s6.base, fim1.topo])
# FA02: oferta de rascunho
fluxo(t, [d4.esq, s7.dir], 'não', (d4.esq[0] - 12, 880), 'rm')
fluxo(t, [s7.esq, a3.dir])
fluxo(t, [a3.topo, (Ab, 430), m2.dir], 'não', (Ab + 12, 820))
fluxo(t, [a3.base, (Ab, 1000), (Sb, 1000), m3.topo], 'sim', (Ab + 12, 985))
# rascunho pelo botão do formulário
fluxo(t, [d1.base, (Aa, 1080), d2.esq], 'Salvar como rascunho', (Aa + 12, 815))
fluxo(t, [d2.dir, m3.esq], 'sim', (d2.dir[0] + 8, 1060))
fluxo(t, [d2.base, s2.topo], 'não', (Sa + 12, 1160))
fluxo(t, [s2.esq, (40, s2.cy), (40, m1.cy), m1.esq])
fluxo(t, [m3.base, s3.topo])
fluxo(t, [s3.base, s8.topo])
fluxo(t, [s8.base, fim2.topo])

t.salvar(SAIDA)
print('ok', SAIDA)
