# Primitivas de desenho UML com PIL, usadas pelos scripts uml-*.py desta pasta.
import math
from PIL import Image, ImageDraw, ImageFont

F, FB, FI = 'C:/Windows/Fonts/arial.ttf', 'C:/Windows/Fonts/arialbd.ttf', 'C:/Windows/Fonts/ariali.ttf'
FBI = 'C:/Windows/Fonts/arialbi.ttf'
_cache = {}


def fonte(arq, tam):
    if (arq, tam) not in _cache:
        _cache[(arq, tam)] = ImageFont.truetype(arq, tam)
    return _cache[(arq, tam)]


f = lambda s: fonte(F, s)
fb = lambda s: fonte(FB, s)
fi = lambda s: fonte(FI, s)
fbi = lambda s: fonte(FBI, s)

INK = (40, 40, 40)
CINZA = (120, 120, 120)
AZUL = (232, 240, 250)
VERDE = (226, 242, 228)
AMARELO = (255, 246, 214)
AMARELO2 = (255, 236, 190)
ROXO = (238, 230, 246)
LARANJA = (253, 232, 214)
CINZA_CLARO = (245, 245, 245)


class Tela:
    def __init__(self, w, h):
        self.img = Image.new('RGB', (w, h), 'white')
        self.d = ImageDraw.Draw(self.img)

    def salvar(self, caminho):
        self.img.save(caminho)

    # ---------- texto ----------
    def largura(self, texto, fonte_):
        b = self.d.textbbox((0, 0), texto, font=fonte_)
        return b[2] - b[0]

    def quebrar(self, texto, fonte_, maxw):
        linhas = []
        for paragrafo in texto.split('\n'):
            atual = ''
            for palavra in paragrafo.split(' '):
                teste = (atual + ' ' + palavra).strip()
                if self.largura(teste, fonte_) <= maxw or not atual:
                    atual = teste
                else:
                    linhas.append(atual)
                    atual = palavra
            linhas.append(atual)
        return linhas

    def texto_centro(self, cx, cy, linhas, fonte_, esp=None, cor=INK):
        esp = esp or int(fonte_.size * 1.25)
        y0 = cy - esp * (len(linhas) - 1) / 2
        for i, l in enumerate(linhas):
            self.d.text((cx, y0 + i * esp), l, font=fonte_, fill=cor, anchor='mm')

    def rotulo(self, x, y, texto, fonte_, anchor='mm', fundo='white', cor=INK):
        caixa = self.d.textbbox((x, y), texto, font=fonte_, anchor=anchor)
        if fundo:
            self.d.rectangle([caixa[0] - 4, caixa[1] - 2, caixa[2] + 4, caixa[3] + 2], fill=fundo)
        self.d.text((x, y), texto, font=fonte_, fill=cor, anchor=anchor)
        return caixa

    # ---------- linhas ----------
    def linha(self, pts, tracejada=False, w=3, cor=INK, dash=14, gap=10):
        for a, b in zip(pts, pts[1:]):
            if not tracejada:
                self.d.line([a, b], fill=cor, width=w)
                continue
            dx, dy = b[0] - a[0], b[1] - a[1]
            comp = math.hypot(dx, dy)
            if comp == 0:
                continue
            ux, uy = dx / comp, dy / comp
            p = 0
            while p < comp:
                q = min(p + dash, comp)
                self.d.line([(a[0] + ux * p, a[1] + uy * p), (a[0] + ux * q, a[1] + uy * q)], fill=cor, width=w)
                p += dash + gap

    def _dir(self, a, b):
        ang = math.atan2(b[1] - a[1], b[0] - a[0])
        return ang

    def ponta(self, a, b, tipo='aberta', L=22, abertura=0.42, w=3):
        """Desenha a ponta em b, vinda de a. tipo: aberta, cheia, heranca, losango, losango_cheio."""
        ang = self._dir(a, b)
        x2, y2 = b
        p1 = (x2 - L * math.cos(ang - abertura), y2 - L * math.sin(ang - abertura))
        p2 = (x2 - L * math.cos(ang + abertura), y2 - L * math.sin(ang + abertura))
        if tipo == 'aberta':
            self.d.line([p1, (x2, y2), p2], fill=INK, width=w)
        elif tipo == 'cheia':
            self.d.polygon([(x2, y2), p1, p2], fill=INK)
        elif tipo == 'heranca':
            L2 = 30
            p1 = (x2 - L2 * math.cos(ang - 0.5), y2 - L2 * math.sin(ang - 0.5))
            p2 = (x2 - L2 * math.cos(ang + 0.5), y2 - L2 * math.sin(ang + 0.5))
            self.d.polygon([(x2, y2), p1, p2], fill='white', outline=INK, width=w)
        elif tipo in ('losango', 'losango_cheio'):
            L2 = 20
            meio = (x2 - L2 * math.cos(ang), y2 - L2 * math.sin(ang))
            fim = (x2 - 2 * L2 * math.cos(ang), y2 - 2 * L2 * math.sin(ang))
            lado1 = (meio[0] + 11 * math.cos(ang + math.pi / 2), meio[1] + 11 * math.sin(ang + math.pi / 2))
            lado2 = (meio[0] - 11 * math.cos(ang + math.pi / 2), meio[1] - 11 * math.sin(ang + math.pi / 2))
            self.d.polygon([(x2, y2), lado1, fim, lado2], fill=INK if tipo == 'losango_cheio' else 'white', outline=INK, width=w)

    def seta(self, pts, tipo='aberta', tracejada=False, w=3, inicio=None):
        """Polilinha com ponta no último ponto (e opcionalmente no primeiro)."""
        recuo = {'heranca': 26, 'losango': 40, 'losango_cheio': 40}.get(tipo, 0)
        pts = list(pts)
        if recuo:
            a, b = pts[-2], pts[-1]
            ang = self._dir(a, b)
            pts_linha = pts[:-1] + [(b[0] - recuo * math.cos(ang), b[1] - recuo * math.sin(ang))]
        else:
            pts_linha = pts
        if inicio:
            r0 = {'heranca': 26, 'losango': 40, 'losango_cheio': 40}.get(inicio, 0)
            a, b = pts_linha[1], pts_linha[0]
            ang = self._dir(a, b)
            pts_linha = [(b[0] - r0 * math.cos(ang), b[1] - r0 * math.sin(ang))] + pts_linha[1:]
        self.linha(pts_linha, tracejada=tracejada, w=w)
        if tipo:
            self.ponta(pts[-2], pts[-1], tipo, w=w)
        if inicio:
            self.ponta(pts[1], pts[0], inicio, w=w)

    # ---------- formas ----------
    def caixa(self, x1, y1, x2, y2, fill=AZUL, raio=10, w=3, tracejada=False):
        if tracejada:
            self.d.rounded_rectangle([x1, y1, x2, y2], radius=raio, fill=fill)
            self.linha([(x1, y1), (x2, y1), (x2, y2), (x1, y2), (x1, y1)], tracejada=True, w=w)
        else:
            self.d.rounded_rectangle([x1, y1, x2, y2], radius=raio, fill=fill, outline=INK, width=w)

    def ator(self, cx, topo, nome, esc=1.0, fonte_=None, estereotipo=None):
        s = esc
        d = self.d
        d.ellipse([cx - 18 * s, topo, cx + 18 * s, topo + 36 * s], outline=INK, width=3, fill='white')
        d.line([(cx, topo + 36 * s), (cx, topo + 82 * s)], fill=INK, width=3)
        d.line([(cx - 30 * s, topo + 52 * s), (cx + 30 * s, topo + 52 * s)], fill=INK, width=3)
        d.line([(cx, topo + 82 * s), (cx - 22 * s, topo + 114 * s)], fill=INK, width=3)
        d.line([(cx, topo + 82 * s), (cx + 22 * s, topo + 114 * s)], fill=INK, width=3)
        y = topo + 114 * s + 22
        if estereotipo:
            self.d.text((cx, y), estereotipo, font=fi(20), fill=INK, anchor='mm')
            y += 26
        for l in nome.split('\n'):
            self.d.text((cx, y), l, font=fonte_ or fb(23), fill=INK, anchor='mm')
            y += 28
        return {'cx': cx, 'topo': topo, 'pes': topo + 114 * s, 'cabeca': topo + 18 * s, 'base': y}


def classe(t, x, y, nome, attrs=(), metodos=(), estereotipo=None, fill=AZUL, w=None, abstrato=False, tam=20):
    """Caixa de classe UML com 3 compartimentos. Devolve dict com x1, y1, x2, y2, cx, cy."""
    fn = fbi(tam + 3) if abstrato else fb(tam + 3)
    linhas = list(attrs) + list(metodos)
    larg = max([t.largura(nome, fn)] + [t.largura(l, f(tam)) for l in linhas] + ([t.largura(estereotipo, fi(tam))] if estereotipo else []))
    w = w or larg + 44
    esp = int(tam * 1.38)
    topo_nome = 14 + (esp if estereotipo else 0) + esp
    h_nome = topo_nome + 12
    h_attr = (len(attrs) * esp + 16) if attrs else 22
    h_met = (len(metodos) * esp + 16) if metodos else 22
    h = h_nome + h_attr + h_met
    d = t.d
    d.rectangle([x, y, x + w, y + h], fill=fill, outline=INK, width=3)
    yy = y + 14
    if estereotipo:
        d.text((x + w / 2, yy + esp / 2), estereotipo, font=fi(tam), fill=INK, anchor='mm')
        yy += esp
    d.text((x + w / 2, yy + esp / 2), nome, font=fn, fill=INK, anchor='mm')
    y1 = y + h_nome
    d.line([(x, y1), (x + w, y1)], fill=INK, width=2)
    for i, a in enumerate(attrs):
        d.text((x + 16, y1 + 8 + i * esp + esp / 2), a, font=f(tam), fill=INK, anchor='lm')
    y2 = y1 + h_attr
    d.line([(x, y2), (x + w, y2)], fill=INK, width=2)
    for i, m in enumerate(metodos):
        d.text((x + 16, y2 + 8 + i * esp + esp / 2), m, font=f(tam), fill=INK, anchor='lm')
    return {'x1': x, 'y1': y, 'x2': x + w, 'y2': y + h, 'cx': x + w / 2, 'cy': y + h / 2, 'w': w, 'h': h}


# ---------- diagrama de atividades ----------
class No:
    def __init__(self, cx, cy, w, h):
        self.cx, self.cy, self.w, self.h = cx, cy, w, h

    @property
    def topo(self):
        return (self.cx, self.cy - self.h / 2)

    @property
    def base(self):
        return (self.cx, self.cy + self.h / 2)

    @property
    def esq(self):
        return (self.cx - self.w / 2, self.cy)

    @property
    def dir(self):
        return (self.cx + self.w / 2, self.cy)


def raias(t, nomes_x, altura, topo=20, cab=70):
    """nomes_x: lista de (nome, x1, x2)."""
    d = t.d
    for nome, x1, x2 in nomes_x:
        d.rectangle([x1, topo, x2, topo + cab], fill=(236, 236, 236), outline=INK, width=2)
        d.text(((x1 + x2) / 2, topo + cab / 2), nome, font=fb(26), fill=INK, anchor='mm')
        d.rectangle([x1, topo + cab, x2, altura], outline=INK, width=2)


def acao(t, cx, cy, w, texto, fill=(255, 246, 214), tam=21):
    linhas = t.quebrar(texto, f(tam), w - 34)
    esp = int(tam * 1.3)
    h = max(70, len(linhas) * esp + 30)
    t.d.rounded_rectangle([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], radius=22, fill=fill, outline=INK, width=3)
    t.texto_centro(cx, cy, linhas, f(tam), esp=esp)
    return No(cx, cy, w, h)


def decisao(t, cx, cy, w, h, texto='', tam=19):
    t.d.polygon([(cx, cy - h / 2), (cx + w / 2, cy), (cx, cy + h / 2), (cx - w / 2, cy)], fill='white', outline=INK, width=3)
    if texto:
        linhas = t.quebrar(texto, f(tam), w * 0.62)
        t.texto_centro(cx, cy, linhas, f(tam), esp=int(tam * 1.2))
    return No(cx, cy, w, h)


def inicio(t, cx, cy, r=18):
    t.d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=INK)
    return No(cx, cy, 2 * r, 2 * r)


def fim(t, cx, cy, r=20):
    t.d.ellipse([cx - r, cy - r, cx + r, cy + r], fill='white', outline=INK, width=3)
    t.d.ellipse([cx - r + 7, cy - r + 7, cx + r - 7, cy + r - 7], fill=INK)
    return No(cx, cy, 2 * r, 2 * r)


def fluxo(t, pts, guarda=None, pos=None, anchor='lm'):
    t.seta(pts, 'aberta', w=3)
    if guarda:
        t.rotulo(pos[0], pos[1], f'[{guarda}]', fi(20), anchor=anchor)
