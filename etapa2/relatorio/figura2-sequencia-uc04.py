# Gera o diagrama de sequência do UC04 (Buscar e Filtrar TCCs).
# Uso: python figura2-sequencia-uc04.py saida.png
import math
import sys
from PIL import Image, ImageDraw, ImageFont

W, H = 2200, 2400
img = Image.new('RGB', (W, H), 'white')
d = ImageDraw.Draw(img)
F, FB, FI = 'C:/Windows/Fonts/arial.ttf', 'C:/Windows/Fonts/arialbd.ttf', 'C:/Windows/Fonts/ariali.ttf'
f = lambda s: ImageFont.truetype(F, s)
fb = lambda s: ImageFont.truetype(FB, s)
fi = lambda s: ImageFont.truetype(FI, s)
INK = (40, 40, 40)
CINZA = (120, 120, 120)

partes = [
    ('Usuário Leitor', 150),
    ('Interface (SPA)', 520),
    ('TccController', 890),
    ('TccService', 1260),
    ('TccRepository', 1630),
    ('ArmazenamentoArquivos', 2000),
]
X = {nome: x for nome, x in partes}
TOPO, BASE = 110, H - 70

# cabeças e linhas de vida
for nome, x in partes:
    if nome == 'Usuário Leitor':
        d.ellipse([x - 16, 20, x + 16, 52], outline=INK, width=3)
        d.line([(x, 52), (x, 82)], fill=INK, width=3)
        d.line([(x - 24, 62), (x + 24, 62)], fill=INK, width=3)
        d.line([(x, 82), (x - 18, 104)], fill=INK, width=3)
        d.line([(x, 82), (x + 18, 104)], fill=INK, width=3)
        d.text((x, 128), nome, font=fb(22), fill=INK, anchor='mm')
        ini = 146
    else:
        d.rounded_rectangle([x - 150, 40, x + 150, TOPO], radius=8, fill=(232, 240, 250), outline=INK, width=3)
        d.text((x, 75), nome, font=fb(22), fill=INK, anchor='mm')
        ini = TOPO
    y = ini
    while y < BASE:
        d.line([(x, y), (x, min(y + 12, BASE))], fill=CINZA, width=2)
        y += 22


def seta(y, de, para, texto, retorno=False, numero=None):
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
    caixa = d.textbbox(((x1 + x2) / 2, y - 16), rotulo, font=f(19), anchor='mm')
    d.rectangle([caixa[0] - 3, caixa[1] - 1, caixa[2] + 3, caixa[3] + 1], fill='white')
    d.text(((x1 + x2) / 2, y - 16), rotulo, font=f(19), fill=INK, anchor='mm')


def quadro(y1, y2, x1, x2, condicoes):
    """Fragmento alt: condicoes = [(y_inicio, texto)]; a primeira fica no topo."""
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
        caixa = d.textbbox(pos, f'[{texto}]', font=fi(19), anchor='lm')
        d.rectangle([caixa[0] - 3, caixa[1] - 1, caixa[2] + 3, caixa[3] + 1], fill='white')
        d.text(pos, f'[{texto}]', font=fi(19), fill=INK, anchor='lm')


n = iter(range(1, 60))
y = 200
seta(y, 'Usuário Leitor', 'Interface (SPA)', 'termo e filtros; "Pesquisar"', numero=next(n)); y += 62
seta(y, 'Interface (SPA)', 'TccController', 'buscarTccs(filtro: FiltroBusca)', numero=next(n)); y += 62
seta(y, 'TccController', 'TccService', 'buscarPorFiltros(filtro)', numero=next(n)); y += 62
seta(y, 'TccService', 'TccRepository', 'buscarPorFiltros(filtro)', numero=next(n)); y += 62
seta(y, 'TccRepository', 'TccService', 'List<TCC> (só PUBLICADO)', retorno=True, numero=next(n)); y += 62
seta(y, 'TccService', 'TccController', 'List<TCC> (mais recente primeiro)', retorno=True, numero=next(n)); y += 50

q1 = y
y += 78
seta(y, 'TccController', 'Interface (SPA)', 'lista vazia', retorno=True, numero=next(n)); y += 62
seta(y, 'Interface (SPA)', 'Usuário Leitor', 'aviso de busca vazia (FA01)', retorno=True, numero=next(n)); y += 40
div1 = y
y += 78
seta(y, 'TccController', 'Interface (SPA)', 'List<TccDTO>', retorno=True, numero=next(n)); y += 62
seta(y, 'Interface (SPA)', 'Usuário Leitor', 'feed de resultados', retorno=True, numero=next(n)); y += 36
quadro(q1, y, 40, 1060, [(q1, 'nenhum TCC atende aos critérios'), (div1, 'há resultados')])
y += 70

seta(y, 'Usuário Leitor', 'Interface (SPA)', 'seleciona um TCC', numero=next(n)); y += 62
seta(y, 'Interface (SPA)', 'TccController', 'visualizarDetalhes(id)', numero=next(n)); y += 62
seta(y, 'TccController', 'TccService', 'buscarPorId(id)', numero=next(n)); y += 62
seta(y, 'TccService', 'TccRepository', 'buscarPorId(id)', numero=next(n)); y += 62
seta(y, 'TccRepository', 'TccService', 'TCC', retorno=True, numero=next(n)); y += 62
seta(y, 'TccService', 'TccController', 'TCC', retorno=True, numero=next(n)); y += 62
seta(y, 'TccController', 'Interface (SPA)', 'TccDTO', retorno=True, numero=next(n)); y += 62
seta(y, 'Interface (SPA)', 'Usuário Leitor', 'detalhes do TCC', retorno=True, numero=next(n)); y += 70

seta(y, 'Usuário Leitor', 'Interface (SPA)', '"Baixar Artigo"', numero=next(n)); y += 62
seta(y, 'Interface (SPA)', 'TccController', 'baixarArquivo(id)', numero=next(n)); y += 62
seta(y, 'TccController', 'TccService', 'obterArquivo(id)', numero=next(n)); y += 62
seta(y, 'TccService', 'ArmazenamentoArquivos', 'transferir(caminho do arquivo)', numero=next(n)); y += 50

q2 = y
y += 78
seta(y, 'ArmazenamentoArquivos', 'TccService', 'conteúdo completo', retorno=True, numero=next(n)); y += 62
seta(y, 'TccService', 'TccController', 'arquivo', retorno=True, numero=next(n)); y += 62
seta(y, 'TccController', 'Interface (SPA)', 'File', retorno=True, numero=next(n)); y += 62
seta(y, 'Interface (SPA)', 'Usuário Leitor', 'arquivo salvo no dispositivo', retorno=True, numero=next(n)); y += 40
div2 = y
y += 78
seta(y, 'ArmazenamentoArquivos', 'TccService', 'falha de transferência', retorno=True, numero=next(n)); y += 62
seta(y, 'TccService', 'TccController', 'erro de download (nada parcial)', retorno=True, numero=next(n)); y += 62
seta(y, 'TccController', 'Interface (SPA)', 'mensagem do FA02', retorno=True, numero=next(n)); y += 62
seta(y, 'Interface (SPA)', 'Usuário Leitor', 'aviso de erro no download (FA02)', retorno=True, numero=next(n)); y += 36
quadro(q2, y, 40, 2160, [(q2, 'transferência concluída'), (div2, 'conexão interrompida')])

img.save(sys.argv[1])
print('altura usada', y, 'de', H)
