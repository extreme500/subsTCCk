from PIL import Image, ImageDraw, ImageFont
import sys
W,H=1800,1080
img=Image.new('RGB',(W,H),'white'); d=ImageDraw.Draw(img)
F='C:/Windows/Fonts/arial.ttf'; FB='C:/Windows/Fonts/arialbd.ttf'
f=lambda s:ImageFont.truetype(F,s); fb=lambda s:ImageFont.truetype(FB,s)
INK=(40,40,40); EXT=(245,245,245); LAY=(232,240,250); SRV=(250,250,250)
def box(x,y,w,h,title,lines=(),fill=(255,255,255),dash=False,tsize=26,lsize=21):
    if dash:
        for i in range(x,x+w,18): d.line([(i,y),(min(i+9,x+w),y)],fill=INK,width=3); d.line([(i,y+h),(min(i+9,x+w),y+h)],fill=INK,width=3)
        for j in range(y,y+h,18): d.line([(x,j),(x,min(j+9,y+h))],fill=INK,width=3); d.line([(x+w,j),(x+w,min(j+9,y+h))],fill=INK,width=3)
        d.rectangle([x+2,y+2,x+w-2,y+h-2],fill=fill)
    else:
        d.rounded_rectangle([x,y,x+w,y+h],radius=10,fill=fill,outline=INK,width=3)
    d.text((x+w/2,y+18),title,font=fb(tsize),fill=INK,anchor='mt')
    for i,l in enumerate(lines): d.text((x+w/2,y+56+i*28),l,font=f(lsize),fill=INK,anchor='mt')
def arrow(p,q,label=None,off=(0,-24),both=False):
    import math
    d.line([p,q],fill=INK,width=3)
    def head(a,b):
        ang=math.atan2(b[1]-a[1],b[0]-a[0]); L=18
        pts=[b,(b[0]-L*math.cos(ang-0.4),b[1]-L*math.sin(ang-0.4)),(b[0]-L*math.cos(ang+0.4),b[1]-L*math.sin(ang+0.4))]
        d.polygon(pts,fill=INK)
    head(p,q)
    if both: head(q,p)
    if label:
        mx,my=(p[0]+q[0])/2+off[0],(p[1]+q[1])/2+off[1]
        d.text((mx,my),label,font=f(20),fill=INK,anchor='mm')
# cliente
box(40,140,330,300,'Navegador',['SPA React (protótipo)','Telas: Feed, Busca,','Detalhe, Formulário,','Perfil, Entrar'],fill=EXT)
# servidor
d.rounded_rectangle([470,60,1250,1020],radius=14,fill=SRV,outline=INK,width=3)
d.text((860,78),'Servidor de aplicação (monólito em camadas)',font=fb(26),fill=INK,anchor='mt')
box(520,140,680,150,'controller',['TccController (API REST: buscar, detalhar,','baixar, cadastrar, editar, excluir)'],fill=LAY)
box(520,350,680,170,'service',['TccService (regras de busca, rascunho/publicação,','limites de tags e mídias) · ValidadorLumeService','ArmazenamentoArquivos (interface)'],fill=LAY)
box(520,580,680,140,'repository',['TccRepository · TagRepository','(interfaces; consultas normalizadas)'],fill=LAY)
box(520,780,320,190,'model',['TCC, Usuario, Professor,','AlunoFormando, Tag, Area,','Midia, ArquivoTcc,','StatusTcc'],fill=(255,255,255),lsize=19)
box(880,780,320,190,'dto',['FiltroBusca, TccDTO,','FeedDTO, respostas','de busca e download'],fill=(255,255,255),lsize=19)
arrow((860,290),(860,350)); arrow((860,520),(860,580))
# externos
box(1350,140,410,125,'Login institucional UFRGS',['autenticação de autores e professores'],fill=EXT,dash=True,tsize=24,lsize=20)
box(1350,330,410,125,'LUME (UFRGS)',['fonte oficial; validação do link (UC03)'],fill=EXT,dash=True,tsize=24,lsize=20)
box(1350,470,410,125,'Armazenamento de arquivos',['PDF, DOCX, EPUB e imagens'],fill=EXT,tsize=24,lsize=20)
box(1350,610,410,125,'Banco de dados relacional',['TCC, Usuário, Tag, Área, Mídia'],fill=EXT,tsize=24,lsize=20)
arrow((370,215),(520,215))
d.text((420,170),'HTTPS',font=f(19),fill=INK,anchor='mm'); d.text((420,193),'JSON',font=f(19),fill=INK,anchor='mm')
arrow((1200,202),(1350,202),'OIDC/SSO',off=(18,-22))
arrow((1200,392),(1350,392),'HTTPS',off=(25,-22))
arrow((1200,505),(1350,532),'leitura',off=(25,-22))
arrow((1200,662),(1350,672),'SQL',off=(25,-22))
d.text((40,1040),'Caixas tracejadas: sistemas externos à plataforma. Setas: sentido da chamada.',font=f(20),fill=(90,90,90))
img.save(sys.argv[1])
