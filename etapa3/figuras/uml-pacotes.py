# Diagrama de pacotes redesenhado (Etapa 3): só notação de pacotes, dependências de cima para baixo.
# Uso: python uml-pacotes.py [saida.png]
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uml_base import Tela, INK, f, fb, fi, AZUL, VERDE, AMARELO, AMARELO2, ROXO  # noqa: E402

SAIDA = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uml-pacotes.png')
W, H = 2060, 1400
t = Tela(W, H)
d = t.d

# ---------- faixas das camadas ----------
FAIXAS = [('Apresentação', 40, 300), ('Negócio', 330, 650), ('Dados', 680, 950), ('Domínio', 980, 1330)]
for i, (nome, y1, y2) in enumerate(FAIXAS):
    d.rectangle([30, y1, 1400, y2], fill=(248, 248, 248) if i % 2 == 0 else (240, 240, 240), outline=(200, 200, 200), width=2)
    d.text((60, (y1 + y2) / 2), nome, font=fb(26), fill=(110, 110, 110), anchor='lm')


def pacote(x1, y1, x2, y2, nome, itens, fill):
    tab_w = max(t.largura(nome, fb(26)) + 50, 150)
    d.rectangle([x1, y1, x1 + tab_w, y1 + 46], fill=fill, outline=INK, width=3)
    d.text((x1 + tab_w / 2, y1 + 24), nome, font=fb(26), fill=INK, anchor='mm')
    d.rectangle([x1, y1 + 46, x2, y2], fill=fill, outline=INK, width=3)
    linhas = []
    for it in itens:
        linhas += t.quebrar(it, f(24), x2 - x1 - 60)
    t.texto_centro((x1 + x2) / 2, (y1 + 46 + y2) / 2, linhas, f(24), esp=34)
    return {'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2, 'cx': (x1 + x2) / 2}


ctrl = pacote(380, 80, 1080, 260, 'controller', ['TccController'], AMARELO2)
serv = pacote(380, 370, 1080, 610, 'service', ['TccService', 'ValidadorLumeService', '«interface» ArmazenamentoArquivos'], AZUL)
repo = pacote(560, 720, 1080, 910, 'repository', ['«interface» TccRepository', '«interface» TagRepository'], ROXO)
model = pacote(380, 1030, 1080, 1290, 'model', [
    'Usuario, Professor, AlunoFormando, TCC, Tag, Area, Midia, ArquivoTcc, StatusTcc, FormatoArquivo'], (226, 242, 228))
dto = pacote(1480, 560, 1920, 880, 'dto', ['TccDTO', 'FeedDTO', 'FiltroBusca', 'ResultadoBuscaDTO'], AMARELO)
d.text((1700, 912), '«compartilhado»', font=fi(24), fill=INK, anchor='mm')


def uso(pts, lx, ly, anchor='lm'):
    t.seta(pts, 'aberta', tracejada=True)
    t.rotulo(lx, ly, '«use»', fi(22), anchor=anchor)


uso([(730, ctrl['y2']), (730, serv['y1'] + 46)], 748, (ctrl['y2'] + serv['y1']) / 2 + 20)
uso([(820, serv['y2']), (820, repo['y1'] + 46)], 838, (serv['y2'] + repo['y1']) / 2 + 20)
uso([(820, repo['y2']), (820, model['y1'] + 46)], 838, (repo['y2'] + model['y1']) / 2 + 20)
uso([(460, serv['y2']), (460, model['y1'])], 478, 820)
uso([(ctrl['x2'], 170), (1780, 170), (1780, dto['y1'] + 46)], 1300, 150, 'mm')
uso([(serv['x2'], 590), (dto['x1'], 590)], 1300, 570, 'mm')
uso([(repo['x2'], 840), (dto['x1'], 840)], 1300, 820, 'mm')

d.text((30, H - 40), 'Setas tracejadas: dependência «use», sempre de uma camada para a de baixo ou para o pacote compartilhado dto.',
       font=f(22), fill=(110, 110, 110))
t.salvar(SAIDA)
print('ok', SAIDA)
