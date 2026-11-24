# Diagrama de classes corrigido (Etapa 3): coleção, papéis de orientação, listas tipadas e exclusão.
# Uso: python uml-classes.py [saida.png]
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uml_base import Tela, classe, INK, f, fb, fi, AZUL, VERDE, AMARELO, AMARELO2, ROXO, LARANJA  # noqa: E402

SAIDA = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uml-classes.png')
W, H = 2700, 1880
t = Tela(W, H)
d = t.d
T = 20

# ======================= DTOs (pacote dto) =======================
dto_frame = (30, 60, 960, 0)  # altura definida depois
tccdto = classe(t, 60, 120, 'TccDTO', [
    '+ id: int', '+ titulo: String', '+ resumoSimplificado: String', '+ ano: int', '+ semestre: int',
    '+ autor: String', '+ orientador: String', '+ coorientador: String', '+ colecao: String',
    '+ tags: List<String>', '+ linkLume: String', '+ formatoArquivo: String', '+ visualizacoes: int'], fill=AMARELO, tam=T)
filtro = classe(t, 500, 120, 'FiltroBusca', [
    '+ termo: String', '+ ano: int', '+ autor: String', '+ orientador: String', '+ colecao: String',
    '+ tags: List<String>'], fill=AMARELO, w=430, tam=T)
feed = classe(t, 500, filtro['y2'] + 30, 'FeedDTO', ['+ tccsRecentes: List<TccDTO>', '+ tagsEmAlta: List<String>'], fill=AMARELO, w=430, tam=T)
resultado = classe(t, 500, feed['y2'] + 30, 'ResultadoBuscaDTO', ['+ tccs: List<TccDTO>', '+ mensagem: String'], fill=AMARELO, w=430, tam=T)
fundo_dto = max(tccdto['y2'], resultado['y2']) + 30
# moldura do pacote dto (desenhada por cima, só contorno)
d.rectangle([30, 70, 960, fundo_dto], outline=(150, 150, 150), width=2)
d.text((44, 82), 'dto', font=fb(22), fill=(110, 110, 110))

# ======================= controle e serviços =======================
ctrl = classe(t, 1080, 70, 'TccController', [], [
    '+ buscarTccs(filtro: FiltroBusca): ResultadoBuscaDTO', '+ visualizarDetalhes(id: int): TccDTO',
    '+ baixarArquivo(id: int): File', '+ obterFeedDestaques(): FeedDTO',
    '+ listarTrabalhosConexos(id: int): List<TccDTO>', '+ cadastrarTcc(dados: TccDTO): TccDTO',
    '+ salvarRascunho(dados: TccDTO): TccDTO', '+ editarTcc(id: int, dados: TccDTO): TccDTO',
    '+ excluirTcc(id: int): void'], fill=AMARELO2, w=620, tam=T)
serv = classe(t, 1080, ctrl['y2'] + 120, 'TccService', [], [
    '+ cadastrarTcc(tcc: TCC): TCC', '+ salvarRascunho(tcc: TCC): TCC', '+ editarTcc(id: int, dados: TCC): TCC',
    '+ excluirTcc(id: int, usuario: Usuario): void', '+ buscarPorFiltros(filtro: FiltroBusca): List<TCC>',
    '+ buscarPorId(id: int): TCC', '+ obterArquivo(id: int): ArquivoTcc', '+ listarMaisRecentes(limite: int): List<TCC>',
    '+ listarTagsMaisExploradas(dias: int): List<Tag>', '+ mapearTrabalhosConexos(id: int): List<TCC>'], fill=AZUL, w=620, tam=T)

XR = 1880
tccrepo = classe(t, XR, 70, 'TccRepository', [], [
    '+ salvarTcc(tcc: TCC): void', '+ excluirTcc(id: int): void', '+ buscarPorId(id: int): TCC',
    '+ buscarPorFiltros(filtro: FiltroBusca): List<TCC>', '+ buscarMaisRecentes(limite: int): List<TCC>',
    '+ buscarPorTags(tags: List<Tag>): List<TCC>'], estereotipo='«interface»', fill=ROXO, w=560, tam=T)
tagrepo = classe(t, XR, tccrepo['y2'] + 40, 'TagRepository', [], ['+ buscarMaisExploradas(dias: int): List<Tag>'],
                 estereotipo='«interface»', fill=ROXO, w=560, tam=T)
valid = classe(t, XR, serv['y1'] + 110, 'ValidadorLumeService', [], ['+ validarIntegridadeLink(link: Url): bool'], fill=AZUL, w=560, tam=T)
armaz = classe(t, XR, valid['y2'] + 50, 'ArmazenamentoArquivos', [], ['+ transferir(caminho: String): byte[]'],
               estereotipo='«interface»', fill=AZUL, w=560, tam=T)

# ======================= domínio =======================
YD = serv['y2'] + 150
usuario = classe(t, 210, fundo_dto + 60, 'Usuario', ['- id: int', '- nome: String', '- email: String', '- loginInstitucional: String'],
                 estereotipo='«abstract»', fill=VERDE, w=380, abstrato=True, tam=T)
prof = classe(t, 40, usuario['y2'] + 110, 'Professor', ['- departamento: String'], fill=VERDE, w=330, tam=T)
aluno = classe(t, 430, usuario['y2'] + 110, 'AlunoFormando', ['- matricula: String'], fill=VERDE, w=330, tam=T)
tcc = classe(t, 1080, YD, 'TCC', [
    '- id: int', '- titulo: String', '- resumoSimplificado: String', '- ano: int', '- semestre: int',
    '- colecao: String', '- linkLume: String', '- status: StatusTcc', '- visualizacoes: int', '- publicadoEm: Date'], [
    '+ publicar(): void', '+ salvarRascunho(): void', '+ validarCamposObrigatorios(): bool', '+ validarRascunho(): bool',
    '+ registrarVisualizacao(): void', '+ devolverAoAluno(): void'], fill=VERDE, w=440, tam=T)
tag = classe(t, 1880, YD, 'Tag', ['- id: int', '- nome: String'], fill=VERDE, w=260, tam=T)
area = classe(t, 2380, YD, 'Area', ['- id: int', '- nome: String'], fill=VERDE, w=260, tam=T)
midia = classe(t, 1880, tag['y2'] + 50, 'Midia', ['- id: int', '- caminhoUrl: String', '- descricao: String'], fill=VERDE, w=330, tam=T)
arq = classe(t, 1880, midia['y2'] + 50, 'ArquivoTcc', ['- nomeOriginal: String', '- formato: FormatoArquivo', '- caminho: String'], fill=VERDE, w=380, tam=T)
fmt = classe(t, 2380, arq['y1'], 'FormatoArquivo', ['DOCX', 'PDF', 'EPUB'], estereotipo='«enumeration»', fill=LARANJA, w=260, tam=T)
status = classe(t, 1080, tcc['y2'] + 70, 'StatusTcc', ['RASCUNHO', 'PUBLICADO'], estereotipo='«enumeration»', fill=LARANJA, w=260, tam=T)


def rot(x, y, texto, fonte=None, anchor='mm'):
    t.rotulo(x, y, texto, fonte or f(20), anchor=anchor)


# ======================= dependências «use» =======================
def uso(pts, lx=None, ly=None, anchor='mm'):
    t.seta(pts, 'aberta', tracejada=True, w=2)
    if lx is not None:
        rot(lx, ly, '«use»', fi(19), anchor)


cx = ctrl['cx']
uso([(cx, ctrl['y2']), (cx, serv['y1'])], cx + 50, (ctrl['y2'] + serv['y1']) / 2)
uso([(ctrl['x1'], 200), (960, 200)], 1020, 180)                         # controller -> dto
uso([(serv['x2'], valid['cy']), (valid['x1'], valid['cy'])], 1830, valid['cy'] - 18)
uso([(serv['x2'], armaz['cy']), (armaz['x1'], armaz['cy'])], 1830, armaz['cy'] - 18)
xa, xb = 1760, 1810
uso([(serv['x2'], serv['y1'] + 25), (xa, serv['y1'] + 25), (xa, tccrepo['cy']), (tccrepo['x1'], tccrepo['cy'])], 1820, tccrepo['cy'] - 18)
uso([(serv['x2'], serv['y1'] + 60), (xb, serv['y1'] + 60), (xb, tagrepo['cy']), (tagrepo['x1'], tagrepo['cy'])], 1845, tagrepo['cy'] - 18)
uso([(cx, serv['y2']), (cx, tcc['y1'])], cx + 50, (serv['y2'] + tcc['y1']) / 2)
# TccRepository -> FiltroBusca, pela faixa de cima
uso([(tccrepo['cx'], tccrepo['y1']), (tccrepo['cx'], 30), (filtro['cx'], 30), (filtro['cx'], filtro['y1'])], 1500, 30)

# ======================= herança =======================
yb = usuario['y2'] + 55
t.linha([(prof['cx'], prof['y1']), (prof['cx'], yb), (aluno['cx'], yb), (aluno['cx'], aluno['y1'])])
t.linha([(usuario['cx'], yb), (usuario['cx'], usuario['y2'] + 26)])
t.ponta((usuario['cx'], usuario['y2'] + 40), (usuario['cx'], usuario['y2']), 'heranca')

# ======================= associações do TCC =======================
# autor
ya = aluno['cy']
t.linha([(aluno['x2'], ya), (tcc['x1'], ya)])
rot(aluno['x2'] + 14, ya - 20, 'autor', fi(20), 'lm')
rot(aluno['x2'] + 14, ya + 20, '1', f(20), 'lm')
rot(tcc['x1'] - 14, ya - 20, '0..*', f(20), 'rm')
# orientador e coorientador (Professor)
for dx, yy, papel, mult in [(-60, prof['y2'] + 120, 'orientador', '1'), (60, prof['y2'] + 190, 'coorientador', '0..1')]:
    x0 = prof['cx'] + dx
    t.linha([(x0, prof['y2']), (x0, yy), (tcc['x1'], yy)])
    rot(x0 + 10, prof['y2'] + 22, mult, f(20), 'lm')
    rot(800, yy - 18, papel, fi(20))
    rot(tcc['x1'] - 14, yy - 18, '0..*', f(20), 'rm')
# Tag (agregação), Midia e ArquivoTcc (composição)
yt = tag['cy']
t.seta([(tag['x1'], yt), (tcc['x2'], yt)], 'losango')
rot(tcc['x2'] + 50, yt - 20, '1', f(20))
rot(tag['x1'] - 16, yt - 20, '1..5', f(20), 'rm')
ym = midia['cy']
t.seta([(midia['x1'], ym), (tcc['x2'], ym)], 'losango_cheio')
rot(tcc['x2'] + 50, ym - 20, '1', f(20))
rot(midia['x1'] - 16, ym - 20, '0..3', f(20), 'rm')
yq = tcc['y2'] - 30
if arq['cy'] <= yq:
    yq = arq['cy']
    t.seta([(arq['x1'], yq), (tcc['x2'], yq)], 'losango_cheio')
else:
    xq = arq['x1'] - 70
    t.seta([(arq['x1'], arq['cy']), (xq, arq['cy']), (xq, yq), (tcc['x2'], yq)], 'losango_cheio')
rot(tcc['x2'] + 50, yq - 20, '1', f(20))
rot(arq['x1'] - 16, arq['cy'] - 20, '0..1', f(20), 'rm')
# Tag — Area
t.linha([(tag['x2'], yt), (area['x1'], yt)])
rot(tag['x2'] + 16, yt - 20, '0..*', f(20), 'lm')
rot(area['x1'] - 16, yt - 20, '0..1', f(20), 'rm')

legenda = 'Verde: domínio (model) · Amarelo: dto e controller · Azul: service · Roxo: repository · Laranja: enumerações. Linhas tracejadas: dependência «use».'
d.text((30, H - 40), legenda, font=f(20), fill=(110, 110, 110))
t.salvar(SAIDA)
print('ok', SAIDA, 'domínio até', max(status['y2'], arq['y2'], prof['y2']))
