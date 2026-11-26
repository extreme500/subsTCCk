// Gera o relatório técnico final (Etapa 3): corpo com os itens da seção 11 do enunciado + anexos com a especificação
// consolidada (Etapa 1 com os ajustes do parecer) e os registros da Etapa 2.
// Uso: node gerar-relatorio-final.cjs <saida.docx>
// (o pacote "docx" precisa estar acessível: NODE_PATH=<pasta com node_modules/docx>)
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  WidthType, ShadingType, AlignmentType, HeadingLevel, LevelFormat, BorderStyle,
  Header, Footer, PageNumber, TabStopType, PageBreak, VerticalAlign,
} = require('docx');

const SAIDA = process.argv[2] || path.join(__dirname, 'Relatorio final - Trabalho Pratico - Engenharia de Software.docx');
const RAIZ = path.resolve(__dirname, '..', '..');
const TNR = 'Times New Roman';
const MARGEM = 964; // 1,7 cm, como no documento do grupo
const LARGURA = 11906 - 2 * MARGEM;
const LARGURA_PX = Math.floor((LARGURA / 1440) * 96);

// ---------- numeração automática de tabelas e figuras (duas passadas) ----------
let numeros = {};
let ordem = { T: [], F: [] };
const ref = (texto) => texto.replace(/\{([TF]):([a-zA-Z0-9]+)\}/g, (_, tipo, k) => (numeros[`${tipo}:${k}`] ? String(numeros[`${tipo}:${k}`]) : '?'));

// ---------- texto: **negrito**, `código`, *itálico* e [GRUPO: ...] em destaque ----------
const DESTAQUE = { type: ShadingType.CLEAR, color: 'auto', fill: 'FFFF00' };
function runs(texto, base = {}) {
  const partes = ref(texto).split(/(\*\*[^*]+\*\*|`[^`]+`|\[GRUPO[^\]]*\])/g).filter((p) => p !== '');
  return partes.map((p) => {
    if (p.startsWith('**')) return new TextRun({ ...base, text: p.slice(2, -2), bold: true });
    if (p.startsWith('`')) return new TextRun({ ...base, text: p.slice(1, -1), font: 'Consolas', size: (base.size || 24) - 4 });
    if (p.startsWith('[GRUPO')) return new TextRun({ ...base, text: p, bold: true, shading: DESTAQUE });
    return new TextRun({ ...base, text: p });
  });
}
const P = (texto, opts = {}) => new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 100 }, indent: { firstLine: 567 }, ...opts, children: runs(texto) });
const PS = (texto, opts = {}) => P(texto, { indent: undefined, ...opts });
const H1 = (texto, quebra = false) => new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: quebra, children: [new TextRun(texto)] });
const H2 = (texto) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(texto)] });
const LI = (texto) => new Paragraph({ numbering: { reference: 'marcadores', level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 40 }, children: runs(texto) });
let listaNum = 0;
const novaLista = () => `num${++listaNum}`;
const LN = (texto, refLista) => new Paragraph({ numbering: { reference: refLista, level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 40 }, children: runs(texto) });
const legenda = (texto) => new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, keepLines: true, spacing: { before: 120, after: 60 }, children: [new TextRun({ text: texto, font: TNR, bold: true, size: 22 })] });
const numerar = (tipo, chave) => {
  ordem[tipo].push(chave);
  return numeros[`${tipo}:${chave}`] ?? ordem[tipo].length;
};
const TAB = (chave, titulo) => legenda(`Tabela ${numerar('T', chave)} - ${titulo}`);
const FONTE = (texto) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 160 }, children: [new TextRun({ text: texto, font: TNR, size: 20 })] });

const borda = { style: BorderStyle.SINGLE, size: 4, color: 'A6A6A6' };
const bordas = { top: borda, bottom: borda, left: borda, right: borda };
function tabela(cabecalho, linhas, pesos, tamanho = 20) {
  const soma = pesos.reduce((a, b) => a + b, 0);
  const larguras = pesos.map((w) => Math.floor((w / soma) * LARGURA));
  larguras[larguras.length - 1] += LARGURA - larguras.reduce((a, b) => a + b, 0);
  const celula = (texto, i, cab) => new TableCell({
    borders: bordas,
    width: { size: larguras[i], type: WidthType.DXA },
    shading: cab ? { fill: 'D9E2F3', type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    children: String(texto).split('\n').map((linha) => new Paragraph({ spacing: { after: 0, line: 240 }, children: runs(linha, { size: tamanho, bold: cab || undefined }) })),
  });
  return new Table({
    width: { size: LARGURA, type: WidthType.DXA },
    columnWidths: larguras,
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: cabecalho.map((c, i) => celula(c, i, true)) }),
      ...linhas.map((l) => new TableRow({ cantSplit: true, children: l.map((c, i) => celula(c, i, false)) })),
    ],
  });
}

// Tabela + legenda + fonte num só passo.
const T = (chave, titulo, cab, linhas, pesos, fonte, tamanho) => [TAB(chave, titulo), tabela(cab, linhas, pesos, tamanho), FONTE(fonte)];

// ---------- figuras ----------
function dimensoesPng(buf) {
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
function FIG(chave, arquivo, titulo, fonte = 'Fonte: elaborado pelo grupo.', fracao = 1) {
  if (!fs.existsSync(arquivo)) {
    console.warn('figura ausente:', arquivo);
    return [legenda(`Figura ${numerar('F', chave)} - ${titulo}`), P(`[GRUPO: figura ausente: ${path.basename(arquivo)}]`), FONTE(fonte)];
  }
  const buf = fs.readFileSync(arquivo);
  const { w, h } = dimensoesPng(buf);
  const largura = Math.round(LARGURA_PX * fracao);
  const altura = Math.round((h / w) * largura);
  const maxAltura = 860;
  const escala = altura > maxAltura ? maxAltura / altura : 1;
  return [
    legenda(`Figura ${numerar('F', chave)} - ${titulo}`),
    new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, children: [new ImageRun({ type: 'png', data: buf, transformation: { width: Math.round(largura * escala), height: Math.round(altura * escala) } })] }),
    FONTE(fonte),
  ];
}
// Duas imagens lado a lado (capturas do protótipo).
function FIG2(chave, arquivos, titulo, fonte = 'Fonte: protótipo do grupo.') {
  const larg = Math.floor(LARGURA_PX / arquivos.length) - 12;
  const imgs = arquivos.map((a) => {
    const buf = fs.readFileSync(a);
    const { w, h } = dimensoesPng(buf);
    const altura = Math.round((h / w) * larg);
    const esc = altura > 520 ? 520 / altura : 1;
    return new ImageRun({ type: 'png', data: buf, transformation: { width: Math.round(larg * esc), height: Math.round(altura * esc) } });
  });
  const filhos = [];
  imgs.forEach((im, i) => { if (i) filhos.push(new TextRun('   ')); filhos.push(im); });
  return [legenda(`Figura ${numerar('F', chave)} - ${titulo}`), new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, children: filhos }), FONTE(fonte)];
}

const blocoCodigo = (texto) => texto.split('\n').map((linha) => new Paragraph({ spacing: { after: 0, line: 240 }, children: [new TextRun({ text: linha === '' ? ' ' : linha, font: 'Consolas', size: 16 })] }));

// Bloco de título no padrão do documento do grupo (logo, título e autores, professora).
function cabecalhoTitulo() {
  const logo = fs.readFileSync(path.join(__dirname, 'img', 'logo-inf.png'));
  const sem = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const semBordas = { top: sem, bottom: sem, left: sem, right: sem };
  const linha = { style: BorderStyle.SINGLE, size: 8, color: '000000' };
  const larguras = [1300, LARGURA - 1300 - 2000, 2000];
  const cel = (filhos, i) => new TableCell({ borders: semBordas, width: { size: larguras[i], type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, children: filhos });
  const t = (texto, opts = {}) => new Paragraph({ spacing: { after: 0, line: 240 }, children: [new TextRun({ text: texto, font: TNR, size: 24, ...opts })] });
  return [
    new Paragraph({ border: { bottom: linha }, spacing: { after: 120 }, children: [] }),
    new Table({
      width: { size: LARGURA, type: WidthType.DXA },
      columnWidths: larguras,
      borders: { top: sem, bottom: sem, left: sem, right: sem, insideHorizontal: sem, insideVertical: sem },
      rows: [new TableRow({ children: [
        cel([new Paragraph({ children: [new ImageRun({ type: 'png', data: logo, transformation: { width: 63, height: 45 } })] })], 0),
        cel([
          t('Tornar TCCs de computação visíveis, relacionados e úteis', { bold: true }),
          t('Relatório técnico final (Etapa 3)'),
          t('Andriele Joras dos Santos (594861), Gabriel Pieruccini Knopp (594975), Vitor Feijó (588403)'),
        ], 1),
        cel([t('Profª Leticia Santos Machado')], 2),
      ] })],
    }),
    new Paragraph({ border: { bottom: linha }, spacing: { before: 120, after: 200 }, children: [] }),
  ];
}

const h = {
  RAIZ, P, PS, H1, H2, LI, LN, novaLista, T, TAB, tabela, FONTE, FIG, FIG2, blocoCodigo, legenda,
  quebra: () => new Paragraph({ children: [new PageBreak()] }),
};
const corpo = require('./corpo.cjs');
const anexos = require('./anexos.cjs');

function construir() {
  listaNum = 0;
  return [...cabecalhoTitulo(), ...corpo(h), ...anexos(h)];
}

// duas passadas: a primeira descobre a ordem das tabelas e figuras, a segunda usa os números
construir();
numeros = {};
for (const tipo of ['T', 'F']) ordem[tipo].forEach((k, i) => { numeros[`${tipo}:${k}`] = i + 1; });
ordem = { T: [], F: [] };
const conteudo = construir();

const listas = [];
for (let i = 1; i <= listaNum; i++) listas.push({ reference: `num${i}`, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] });

const doc = new Document({
  creator: 'Grupo subsTCCk',
  title: 'Relatório técnico final - Trabalho Prático - Engenharia de Software',
  styles: {
    default: { document: { run: { font: TNR, size: 24 }, paragraph: { spacing: { line: 252 } } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: TNR, size: 24, bold: true }, paragraph: { spacing: { before: 240, after: 100 }, keepNext: true, keepLines: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: TNR, size: 24, bold: true }, paragraph: { spacing: { before: 160, after: 80 }, keepNext: true, keepLines: true, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'marcadores', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] },
      ...listas,
    ],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 850, bottom: 850, left: MARGEM, right: MARGEM, header: 400, footer: 400 } } },
    headers: { default: new Header({ children: [new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: LARGURA }], children: [new TextRun({ text: 'INF01127 - Engenharia De Software N', size: 20 }), new TextRun({ text: '\tTrabalho Prático - Engenharia de Software', size: 20 })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], size: 20 })] })] }) },
    children: conteudo,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(SAIDA, buf);
  console.log('gerado:', SAIDA, buf.length, 'bytes;', ordem.T.length, 'tabelas,', ordem.F.length, 'figuras');
});
