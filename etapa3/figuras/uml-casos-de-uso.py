# Diagrama de casos de uso redesenhado (Etapa 3), conforme a Tabela 24 do relatório.
# Uso: python uml-casos-de-uso.py [saida.png]
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uml_base import Tela, INK, f, fb, fi, CINZA_CLARO  # noqa: E402

SAIDA = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uml-casos-de-uso.png')
W, H = 2260, 1500
t = Tela(W, H)
d = t.d

# ---------- fronteira do sistema ----------
BX1, BY1, BX2, BY2 = 620, 50, 1800, 1430
d.rectangle([BX1, BY1, BX2, BY2], fill=(250, 250, 250), outline=INK, width=3)
d.text((BX1 + 22, BY1 + 18), 'subsTCCk', font=fb(28), fill=INK)

# ---------- casos de uso ----------
A, B = 225, 54  # semi-eixos
UCS = {
    'UC08': (860, 170, 'UC08: Ver Feed de Destaques'),
    'UC04': (860, 320, 'UC04: Buscar e Filtrar TCCs'),
    'UC05': (860, 470, 'UC05: Visualizar Detalhes do TCC'),
    'UC09': (860, 620, 'UC09: Baixar Arquivo do TCC'),
    'UC06': (1530, 470, 'UC06: Mapear Trabalhos Conexos'),
    'UC01': (860, 830, 'UC01: Cadastrar TCC'),
    'UC02': (860, 980, 'UC02: Editar TCC'),
    'UC03': (1530, 905, 'UC03: Validar Link do LUME'),
    'UC07': (860, 1150, 'UC07: Excluir TCC'),
    'UC10': (860, 1310, 'UC10: Entrar com credenciais UFRGS'),
}
for cx, cy, nome in UCS.values():
    d.ellipse([cx - A, cy - B, cx + A, cy + B], fill='white', outline=INK, width=3)
    t.texto_centro(cx, cy, t.quebrar(nome, f(23), 2 * A - 60), f(23))


def borda(uc, alvo):
    """Ponto da elipse do caso de uso na direção do ponto alvo."""
    cx, cy, _ = UCS[uc]
    ang = math.atan2(alvo[1] - cy, alvo[0] - cx)
    # interseção do raio com a elipse
    k = 1 / math.sqrt((math.cos(ang) / A) ** 2 + (math.sin(ang) / B) ** 2)
    return (cx + k * math.cos(ang), cy + k * math.sin(ang))


def centro(uc):
    return UCS[uc][:2]


# ---------- atores ----------
UL = t.ator(330, 340, 'Usuário Leitor')
VIS = t.ator(130, 600, 'Visitante')
ALU = t.ator(330, 600, 'Aluno')
AF = t.ator(330, 945, 'Aluno Formando')
PROF = t.ator(200, 1245, 'Professor')
LUME = t.ator(2030, 800, 'LUME', estereotipo='«sistema externo»')
LOGIN = t.ator(2030, 1200, 'Login institucional\nUFRGS', estereotipo='«sistema externo»')

# ---------- generalizações (árvore com um único triângulo no ator geral) ----------
t.linha([(330, 540), (330, 526)])
t.ponta((330, 540), (330, 500), 'heranca')
t.linha([(40, 540), (330, 540)])  # barramento
t.linha([(130, 540), (130, 600)])
t.linha([(330, 540), (330, 600)])
t.linha([(200, 1245), (200, 1200), (40, 1200), (40, 540)])  # Professor
# Aluno Formando especializa Aluno
t.linha([(330, 945), (330, 786)])
t.ponta((330, 800), (330, 760), 'heranca')

# ---------- associações ----------
esquerda = lambda uc: (UCS[uc][0] - A, UCS[uc][1])
mao = lambda a, lado=1: (a['cx'] + 34 * lado, a['topo'] + 56)
for uc in ['UC08', 'UC04', 'UC05', 'UC09']:
    t.linha([mao(UL), esquerda(uc)])
for uc in ['UC01', 'UC02', 'UC07', 'UC10']:
    t.linha([mao(AF), esquerda(uc)])
for uc in ['UC07', 'UC10']:
    t.linha([mao(PROF), esquerda(uc)])
t.linha([borda('UC03', mao(LUME, -1)), mao(LUME, -1)])
t.linha([borda('UC10', mao(LOGIN, -1)), mao(LOGIN, -1)])

# ---------- include e extend ----------
def dependencia(de, para, rotulo, deslocamento=(0, -22)):
    p1 = borda(de, centro(para))
    p2 = borda(para, centro(de))
    t.seta([p1, p2], 'aberta', tracejada=True)
    mx, my = (p1[0] + p2[0]) / 2 + deslocamento[0], (p1[1] + p2[1]) / 2 + deslocamento[1]
    t.rotulo(mx, my, rotulo, fi(21))


dependencia('UC01', 'UC03', '«include»', (0, -26))
dependencia('UC02', 'UC03', '«include»', (0, 26))
dependencia('UC06', 'UC05', '«extend»', (0, -24))
t.rotulo(1190, 532, '[há trabalhos relacionados]', fi(20))

t.salvar(SAIDA)
print('ok', SAIDA)
