# Diagrama de sequência do UC01 (Cadastrar TCC) corrigido na Etapa 3:
# validarCamposObrigatorios() vai do TccService para o TCC; a resposta do LUME vai para o ValidadorLumeService;
# FA01 e as duas respostas à oferta de rascunho (FA02) aparecem em fragmentos alt.
# Uso: python uml-sequencia-uc01.py [saida.png]
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uml_base import Tela, INK, CINZA, AZUL, f, fb, fi  # noqa: E402

SAIDA = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uml-sequencia-uc01.png')
W, H = 2500, 2050
t = Tela(W, H)
d = t.d

partes = [
    ('AlunoFormando', 130, None),
    ('TccController', 640, None),
    ('TccService', 985, None),
    ('TCC', 1320, None),
    ('ValidadorLumeService', 1655, None),
    ('LUME', 1990, '«sistema externo»'),
    ('TccRepository', 2325, None),
]
X = {nome: x for nome, x, _ in partes}
TOPO = 120


def cabecas_e_vidas(base):
    for nome, x, est in partes:
        if nome == 'AlunoFormando':
            d.ellipse([x - 16, 14, x + 16, 46], outline=INK, width=3)
            d.line([(x, 46), (x, 76)], fill=INK, width=3)
            d.line([(x - 24, 56), (x + 24, 56)], fill=INK, width=3)
            d.line([(x, 76), (x - 18, 98)], fill=INK, width=3)
            d.line([(x, 76), (x + 18, 98)], fill=INK, width=3)
            d.text((x, 120), nome, font=fb(22), fill=INK, anchor='mm')
            ini = 138
        else:
            fill = (240, 240, 240) if est else AZUL
            d.rounded_rectangle([x - 150, 30, x + 150, TOPO], radius=8, fill=fill, outline=INK, width=3)
            if est:
                d.text((x, 56), est, font=fi(19), fill=INK, anchor='mm')
                d.text((x, 90), nome, font=fb(22), fill=INK, anchor='mm')
            else:
                d.text((x, 75), nome, font=fb(22), fill=INK, anchor='mm')
            ini = TOPO
        y = ini
        while y < base:
            d.line([(x, y), (x, min(y + 12, base))], fill=CINZA, width=2)
            y += 22


mensagens = []


def seta(*args, **kw):
    mensagens.append((args, kw))


def desenhar_seta(y, de, para, texto, retorno=False, numero=None):
    x1, x2 = X[de], X[para]
    if retorno:
        passo = 14 if x2 > x1 else -14
        x = x1
        while abs(x2 - x) > 14:
            d.line([(x, y), (x + passo * 0.6, y)], fill=INK, width=3)
            x += passo
    else:
        d.line([(x1, y), (x2, y)], fill=INK, width=3)
    ang = 0 if x2 > x1 else math.pi
    L = 18
    p1 = (x2 - L * math.cos(ang - 0.4), y - L * math.sin(ang - 0.4))
    p2 = (x2 - L * math.cos(ang + 0.4), y - L * math.sin(ang + 0.4))
    if retorno:
        d.line([p1, (x2, y), p2], fill=INK, width=3)
    else:
        d.polygon([(x2, y), p1, p2], fill=INK)
    rotulo = f'{numero}. {texto}' if numero else texto
    t.rotulo((x1 + x2) / 2, y - 17, rotulo, f(20))


quadros = []


def quadro(y1, y2, x1, x2, condicoes):
    quadros.append((y1, y2, x1, x2, condicoes))


def desenhar_quadro(y1, y2, x1, x2, condicoes):
    d.rectangle([x1, y1, x2, y2], outline=INK, width=2)
    d.polygon([(x1, y1), (x1 + 70, y1), (x1 + 70, y1 + 22), (x1 + 58, y1 + 34), (x1, y1 + 34)], fill=(245, 245, 245), outline=INK)
    d.text((x1 + 30, y1 + 17), 'alt', font=fb(19), fill=INK, anchor='mm')
    for i, (y, texto) in enumerate(condicoes):
        if i > 0:
            x = x1
            while x < x2:
                d.line([(x, y), (min(x + 14, x2), y)], fill=INK, width=2)
                x += 24
        pos = (x1 + 84 if i == 0 else x1 + 14, (y1 if i == 0 else y) + 19)
        t.rotulo(pos[0], pos[1], f'[{texto}]', fi(20), anchor='lm')


PASSO = 64
n = iter(range(1, 60))
y = 200
seta(y, 'AlunoFormando', 'TccController', 'cadastrarTcc(dados)', numero=next(n)); y += PASSO
seta(y, 'TccController', 'TccService', 'cadastrarTcc(tcc)', numero=next(n)); y += PASSO
seta(y, 'TccService', 'TCC', 'validarCamposObrigatorios()', numero=next(n)); y += PASSO
seta(y, 'TCC', 'TccService', 'resultado', retorno=True, numero=next(n)); y += 46

# ---------- alt 1: campos ----------
a1 = y
y += 84
seta(y, 'TccService', 'TccController', 'erro de validação', retorno=True, numero=next(n)); y += PASSO
seta(y, 'TccController', 'AlunoFormando', '"Preencha todos os campos obrigatórios" (FA01)', retorno=True, numero=next(n)); y += 40
d1 = y
y += 84
seta(y, 'TccService', 'ValidadorLumeService', 'validarIntegridadeLink(link)', numero=next(n)); y += PASSO
seta(y, 'ValidadorLumeService', 'LUME', 'checaURL(link)', numero=next(n)); y += PASSO
seta(y, 'LUME', 'ValidadorLumeService', 'status', retorno=True, numero=next(n)); y += PASSO
seta(y, 'ValidadorLumeService', 'TccService', 'bool', retorno=True, numero=next(n)); y += 46

# ---------- alt 2: link ----------
a2 = y
y += 84
seta(y, 'TccService', 'TCC', 'publicar()', numero=next(n)); y += PASSO
seta(y, 'TccService', 'TccRepository', 'salvarTcc(tcc)', numero=next(n)); y += PASSO
seta(y, 'TccService', 'TccController', 'TCC', retorno=True, numero=next(n)); y += PASSO
seta(y, 'TccController', 'AlunoFormando', '"TCC publicado com sucesso!"', retorno=True, numero=next(n)); y += 40
d2 = y
y += 84
seta(y, 'TccService', 'TccController', 'erro de link', retorno=True, numero=next(n)); y += PASSO
seta(y, 'TccController', 'AlunoFormando', 'oferece rascunho (FA02)', retorno=True, numero=next(n)); y += 46

# ---------- alt 3: resposta do aluno ----------
a3 = y
y += 84
seta(y, 'AlunoFormando', 'TccController', 'salvarRascunho(dados)', numero=next(n)); y += PASSO
seta(y, 'TccController', 'TccService', 'salvarRascunho(tcc)', numero=next(n)); y += PASSO
seta(y, 'TccService', 'TccRepository', 'salvarTcc(tcc: RASCUNHO)', numero=next(n)); y += PASSO
seta(y, 'TccController', 'AlunoFormando', '"Rascunho salvo com sucesso"', retorno=True, numero=next(n)); y += 40
d3 = y
y += 84
seta(y, 'TccController', 'AlunoFormando', 'formulário com os dados mantidos', retorno=True, numero=next(n)); y += 40
f3 = y
y += 26
f2 = y
y += 26
f1 = y

quadro(a3, f3, 90, 2410, [(a3, 'aluno aceita salvar como rascunho'), (d3, 'aluno recusa')])
quadro(a2, f2, 65, 2435, [(a2, 'link válido'), (d2, 'link inválido')])
quadro(a1, f1, 40, 2460, [(a1, 'campos incompletos'), (d1, 'campos completos')])

base = f1 + 50
cabecas_e_vidas(base)
for args, kw in mensagens:
    desenhar_seta(*args, **kw)
for q in quadros:
    desenhar_quadro(*q)
t.img = t.img.crop((0, 0, W, base + 30))
t.salvar(SAIDA)
print('ok', SAIDA, 'altura', base + 30)
