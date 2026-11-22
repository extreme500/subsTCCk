// Gera o rascunho do relatório da Etapa 2 no formato da Entrega 1 (enunciado versão 3).
// Uso: node gerar.js <pasta etapa2> <arquivo .docx de saída>
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  WidthType, ShadingType, AlignmentType, HeadingLevel, LevelFormat, BorderStyle,
  Header, Footer, PageNumber, TabStopType, PageBreak,
} = require('docx');

const ETAPA2 = process.argv[2];
const SAIDA = process.argv[3];
const TNR = 'Times New Roman';
const LARGURA = 10772; // A4 com margens de 1 cm

// Conteúdo opcional da seção de testes funcionais (preenchido depois dos experimentos).
const arqTestes = path.join(ETAPA2, 'relatorio', 'secao-testes-funcionais.cjs');
const TF = fs.existsSync(arqTestes) ? require(arqTestes) : null;

// ---------- numeração automática de tabelas (duas passadas) ----------
let numeros = {};
let ordem = [];
const ref = (texto) => texto.replace(/\{T:([a-zA-Z0-9]+)\}/g, (_, k) => (numeros[k] ? String(numeros[k]) : '?'));

// ---------- texto: **negrito**, `código`, [GRUPO: ...] e [PENDENTE: ...] em destaque ----------
const DESTAQUE = { type: ShadingType.CLEAR, color: 'auto', fill: 'FFFF00' };
function runs(texto, base = {}) {
  const partes = ref(texto).split(/(\*\*[^*]+\*\*|`[^`]+`|\[(?:GRUPO|PENDENTE)[^\]]*\])/g).filter((p) => p !== '');
  return partes.map((p) => {
    if (p.startsWith('**')) return new TextRun({ ...base, text: p.slice(2, -2), bold: true });
    if (p.startsWith('`')) return new TextRun({ ...base, text: p.slice(1, -1), font: 'Consolas', size: base.size ? base.size - 2 : 20 });
    if (p.startsWith('[GRUPO') || p.startsWith('[PENDENTE')) return new TextRun({ ...base, text: p, bold: true, shading: DESTAQUE });
    return new TextRun({ ...base, text: p });
  });
}
const P = (texto, opts = {}) => new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 120 }, ...opts, children: runs(texto) });
const H1 = (texto) => new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.JUSTIFIED, children: [new TextRun(texto)] });
const H2 = (texto) => new Paragraph({ heading: HeadingLevel.HEADING_2, alignment: AlignmentType.JUSTIFIED, children: [new TextRun(texto)] });
const LI = (texto) => new Paragraph({ numbering: { reference: 'marcadores', level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 60 }, children: runs(texto) });
let listaNum = 0;
const novaLista = () => `num${++listaNum}`;
const LN = (texto, refLista) => new Paragraph({ numbering: { reference: refLista, level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 60 }, children: runs(texto) });
const legenda = (texto) => new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 160, after: 80 }, children: [new TextRun({ text: texto, font: TNR, bold: true, size: 24 })] });
const TAB = (chave, titulo) => {
  ordem.push(chave);
  return legenda(`Tabela ${numeros[chave] ?? ordem.length} - ${titulo}`);
};
const FONTE = (texto) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 200 }, children: [new TextRun({ text: texto, font: TNR, size: 22 })] });

const borda = { style: BorderStyle.SINGLE, size: 4, color: 'A6A6A6' };
const bordas = { top: borda, bottom: borda, left: borda, right: borda };
function tabela(cabecalho, linhas, pesos) {
  const soma = pesos.reduce((a, b) => a + b, 0);
  const larguras = pesos.map((w) => Math.floor((w / soma) * LARGURA));
  larguras[larguras.length - 1] += LARGURA - larguras.reduce((a, b) => a + b, 0);
  const celula = (texto, i, cab) => new TableCell({
    borders: bordas,
    width: { size: larguras[i], type: WidthType.DXA },
    shading: cab ? { fill: 'D9E2F3', type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    children: String(texto).split('\n').map((linha) => new Paragraph({ spacing: { after: 0, line: 240 }, children: runs(linha, { size: 18, bold: cab || undefined }) })),
  });
  return new Table({
    width: { size: LARGURA, type: WidthType.DXA },
    columnWidths: larguras,
    rows: [
      new TableRow({ tableHeader: true, children: cabecalho.map((c, i) => celula(c, i, true)) }),
      ...linhas.map((l) => new TableRow({ cantSplit: true, children: l.map((c, i) => celula(c, i, false)) })),
    ],
  });
}
const blocoCodigo = (texto) => texto.split('\n').map((linha) => new Paragraph({ spacing: { after: 0, line: 240 }, children: [new TextRun({ text: linha === '' ? ' ' : linha, font: 'Consolas', size: 16 })] }));

function lerPrompts(arquivo, esperado) {
  const md = fs.readFileSync(arquivo, 'utf8').replace(/\r/g, '');
  const lista = [...md.matchAll(/## (Prompt \d - [^\n]+)\n\n```text\n([\s\S]*?)```/g)].map((m) => ({ titulo: m[1], texto: m[2].trim() }));
  if (lista.length !== esperado) throw new Error(`${arquivo}: esperava ${esperado} prompts, achei ${lista.length}`);
  return lista;
}
const promptsSdd = lerPrompts(path.join(ETAPA2, 'prompts-sdd.md'), 6);
const promptsTestes = lerPrompts(path.join(ETAPA2, 'testes-funcionais', 'prompts-testes.md'), 2);
const imagem = fs.readFileSync(path.join(ETAPA2, 'relatorio', 'figura1-arquitetura.png'));
const imagemSeq = fs.readFileSync(path.join(ETAPA2, 'relatorio', 'figura2-sequencia-uc04.png'));

// =====================================================================================
function construir() {
  listaNum = 0;
  const c = [];
  const add = (...x) => c.push(...x);

  add(
    new Paragraph({ spacing: { after: 0, line: 240 }, children: [new TextRun({ text: 'Tornar TCCs de computação visíveis, relacionados e úteis', font: TNR, bold: true, size: 24 })] }),
    new Paragraph({ spacing: { after: 0, line: 240 }, children: [new TextRun({ text: 'Entrega 2: protótipo, arquitetura, SDD e GenAI, comparação, decisões e reflexão', font: TNR, size: 24 })] }),
    new Paragraph({ spacing: { after: 0, line: 240 }, children: [new TextRun({ text: 'Andriele Joras dos Santos (594861), Gabriel Pieruccini Knopp (594975), Vitor Feijó (588403)', font: TNR, size: 24 })] }),
    new Paragraph({ spacing: { after: 160, line: 240 }, children: [new TextRun({ text: 'Profª Leticia Santos Machado', font: TNR, size: 24 })] }),
    P('**Nota para o grupo (apagar antes de entregar):** os trechos em amarelo marcados [GRUPO: ...] precisam ser respondidos ou confirmados por vocês, porque são opinião ou fato que só vocês sabem.'),
  );

  // 1. Escopo
  add(
    H1('1. Escopo da Etapa 2'),
    P('Esta entrega cobre a etapa 2 do enunciado (versão 3): protótipo de alta fidelidade, arquitetura, SDD e GenAI, comparação, decisões e reflexão sobre artefatos gerados com e sem a ajuda de modelos de IA. Ela parte da versão própria do grupo, produzida na Etapa 1: requisitos, user stories, casos de uso, diagramas UML, casos de teste e protótipo.'),
    P('A IA foi usada sobre essa versão, e não no lugar dela. Houve dois experimentos comparando o **Claude Code** e o **Antigravity** (modelo Gemini), sempre com as mesmas entradas e os mesmos prompts:'),
    LI('**SDD:** aplicação das seis fases do Spec-Driven Development à funcionalidade **RF#02 / UC04 - Buscar e Filtrar TCCs** (US#04; CT03, CT05 e CT06);'),
    LI('**Testes funcionais:** ampliação dos casos de teste da Etapa 1 com classes de equivalência e análise de valor limite, para as duas funcionalidades, com um prompt simples e depois um refinado.'),
    P('O UC04 foi escolhido para o SDD por três motivos. Ele combina vários filtros e tem dois fluxos alternativos (FA01, busca sem resultado; FA02, falha no download). Tem três casos de teste prontos, o que permite verificar o resultado de forma automática. E o protótipo já implementa a busca, o que dá uma referência para comparar.'),
    H2('1.1. Como esta entrega responde ao parecer da Etapa 1'),
    P('O parecer da Etapa 1 chegou durante a Etapa 2. Pelo enunciado, o relatório da Etapa 1 com os ajustes aplicados é entregue na Etapa 3, junto com os testes funcionais. Por isso este documento não refaz a Etapa 1: ele atende agora o que o parecer pede para a Etapa 2 e o que já foi possível adiantar, e registra o que fica para a consolidação (Tabela {T:parecer}).'),
    TAB('parecer', 'Resposta ao parecer da Etapa 1'),
    tabela(['Ponto do parecer', 'Atendido nesta entrega', 'Fica para a Etapa 3'], [
      ['1. Arquivo × link do LUME: o sistema guarda o documento ou só o link?', 'Regra definida na seção 2.1 e conferida no protótipo: o link é obrigatório e é a fonte oficial; o arquivo é uma cópia opcional', 'Levar a regra ao RF#01, ao UC01 e ao UC04 (novo fluxo para TCC sem arquivo)'],
      ['1. Regras de publicação, rascunho, edição e acesso', 'Seções 2.2 e 2.3, com a tabela de quem pode publicar, editar, excluir e baixar. As divergências entre especificação e protótipo e as decisões do grupo estão na seção 2.4', 'Especificar o UC02 (Editar TCC) e um caso de uso novo, Excluir TCC; aplicar as decisões ao protótipo'],
      ['2. Diagrama de casos de uso: funcionalidades por ator e limites do sistema', 'Ajustes definidos na Tabela {T:uml}', 'Redesenhar o diagrama'],
      ['2. Diagrama de pacotes: camadas, dependências e notação', 'Ajustes definidos na Tabela {T:uml}; as camadas e dependências pretendidas já aparecem na Figura 1', 'Redesenhar o diagrama'],
      ['2. Diagrama de sequência: conferir o UC01 e incluir a busca com filtros', 'Novo diagrama de sequência do UC04 (Figura 2); correções do UC01 definidas na Tabela {T:uml}', 'Redesenhar o diagrama do UC01'],
      ['2. Diagramas de atividades: caminhos alternativos, decisões e caminhos finais', 'Ajustes definidos na Tabela {T:uml}', 'Redesenhar os dois diagramas'],
      ['3. Testes: classes de equivalência, valor limite, fluxos alternativos, filtros, controle de acesso; separar o CT04', 'Seção 7: 48 casos novos (CT07 a CT54), 31 testes automáticos e a cobertura de cada recomendação na Tabela {T:parecerTestes}', 'Executar os casos manuais e incorporá-los ao relatório consolidado'],
      ['4. Evidências da colaboração humano-IA', 'Ferramentas e atividades: Tabela {T:sdlc}. Prompts e refinamento: seção 6.3 e Anexos A, B e C. Aceito, modificado e descartado: Tabelas {T:registroSdd}, {T:registroTestes} e {T:decisoesHumanas}. Verificação: seções 7.5 e 8.2. Limitações e benefícios: seções 5.6, 10.3 e 11', 'Nada pendente; o grupo completa as avaliações das experiências da Etapa 1 (Anexo C)'],
    ], [3, 4.4, 2.6]),
    FONTE('Fonte: parecer da Etapa 1 (Profª Leticia Santos Machado) e elaboração do grupo.'),
  );

  // 2. Protótipo
  add(
    H1('2. Protótipo de alta fidelidade (interface de interação)'),
    P('O protótipo está publicado em https://extreme500.github.io/subsTCCk/ e foi descrito na seção 3.2.4 da Entrega 1. É uma aplicação React que roda no navegador, sem servidor. Ele cobre as duas funcionalidades:'),
    LI('**RF#01 (UC01, UC02, UC03):** cadastro e edição de TCC, com os limites de 5 tags e 3 imagens, a validação do link do LUME e o salvamento como rascunho;'),
    LI('**RF#02 (UC04, UC05, UC06):** feed de descoberta, busca com filtros combinados, página de detalhes com trabalhos conexos e download.'),
    P('Um painel de demonstração simula o LUME indisponível e a falha de download e restaura os dados iniciais (TCCs A a E). Assim, os seis casos de teste CT01 a CT06 podem ser executados na própria interface, e foi assim que o grupo verificou se o comportamento correspondia ao especificado.'),
    P('O protótipo foi gerado com IA (Claude Code, experiência 5 do Anexo C), como permite o enunciado, a partir dos casos de uso, das regras e dos casos de teste do grupo. [GRUPO: descrever em uma ou duas frases o que vocês revisaram ou pediram para ajustar no protótipo depois de gerado.]'),
    P('O parecer da Etapa 1 pediu que a especificação e o protótipo apresentem o mesmo comportamento e que as regras de publicação, rascunho, edição e acesso fiquem explícitas. As seções 2.1 a 2.3 descrevem as regras como o protótipo as implementa hoje, conferidas no código; a seção 2.4 lista onde a especificação e o protótipo ainda divergem.'),
    H2('2.1. Arquivo do trabalho e link do LUME'),
    P('A plataforma guarda as duas coisas, com papéis diferentes:'),
    LI('**Link do LUME:** obrigatório para publicar. É a fonte oficial do TCC, e a plataforma só o valida e aponta para ele. Toda página de TCC tem o botão "Ver no LUME".'),
    LI('**Arquivo do trabalho (DOCX, PDF ou EPUB):** opcional. É uma cópia guardada pela plataforma para o leitor baixar sem sair dela. Com arquivo, a página mostra "Baixar Artigo"; sem arquivo, mostra "Acessar texto no LUME".'),
    P('Assim, a plataforma não substitui o LUME: um TCC sem link não é publicado, e um TCC sem arquivo continua acessível pelo LUME. [GRUPO: confirmar que esta é a regra desejada. A alternativa seria só o link, sem guardar arquivo, o que eliminaria o download, o FA02 do UC04 e o CT06.]'),
    H2('2.2. Publicação, rascunho e edição'),
    LI('**Publicar:** exige título, resumo, ano/semestre, orientador, ao menos uma tag e o link do LUME. Os campos são validados primeiro (FA01); só depois o link é verificado no LUME (FA02). Publicado, o TCC aparece no feed, na busca e nos trabalhos conexos.'),
    LI('**Rascunho:** o aluno pode salvar como rascunho a qualquer momento, pelo botão "Salvar como rascunho" do formulário, que exige só o título. O sistema também oferece o rascunho quando o link não é validado (FA02). O rascunho só é visto pelo autor, no perfil e na página do TCC, com uma faixa de aviso. Ele nunca aparece no feed, na busca nem nos trabalhos conexos; para os demais usuários, a página mostra "Este TCC não está disponível".'),
    LI('**Editar:** só o autor edita os próprios TCCs, publicados ou em rascunho, no mesmo formulário do cadastro. Ao salvar, os campos e o link são validados de novo, e um rascunho com o link corrigido passa a publicado. Se o TCC já está publicado e o link falha na nova validação, a versão publicada continua no ar, as alterações não são aplicadas e o autor é avisado para corrigir o link; nesse caso o sistema não oferece o rascunho, para que o TCC não saia do feed por uma edição.'),
    LI('**Excluir:** o autor pode excluir o próprio TCC, publicado ou em rascunho; o TCC é removido da plataforma. O orientador ou o coorientador indicado no TCC também pode excluí-lo, para o caso de o aluno tê-lo indicado por engano. Nesse caso o TCC não é apagado: sai do feed, da busca e do perfil do professor e volta a ser um rascunho do aluno, que pode corrigir o orientador e publicar de novo. Nos dois casos o sistema pede confirmação antes de excluir.'),
    H2('2.3. Acesso por tipo de usuário'),
    TAB('acesso', 'O que cada tipo de usuário pode fazer'),
    tabela(['Ação', 'Visitante (sem login)', 'Aluno formando (autenticado)', 'Professor (autenticado)'], [
      ['Ver o feed, buscar e filtrar TCCs publicados', 'Sim', 'Sim', 'Sim'],
      ['Ver os detalhes e os trabalhos conexos de um TCC publicado', 'Sim', 'Sim', 'Sim'],
      ['Baixar o arquivo ou acessar o texto no LUME', 'Sim', 'Sim', 'Sim'],
      ['Cadastrar e publicar TCC', 'Não: tela "Publicação restrita a formandos", com o botão de login', 'Sim', 'Não: mesma tela, com "Voltar ao feed"'],
      ['Editar TCC', 'Não', 'Só os próprios', 'Não'],
      ['Excluir TCC', 'Não', 'Só os próprios (o TCC é removido)', 'Os que orienta ou coorienta (o TCC volta a ser rascunho do aluno)'],
      ['Ver rascunho', 'Não', 'Só os próprios', 'Não'],
      ['Perfil', 'Pede login', 'Lista os próprios TCCs, publicados e rascunhos', 'Lista os trabalhos publicados que orienta ou coorienta'],
    ], [3.4, 2.2, 2.2, 2.2]),
    FONTE('Fonte: comportamento do protótipo, conferido no código (src/views/), e regras decididas pelo grupo (exclusão e rascunho sem link).'),
    P('O protótipo tem só dois perfis autenticados. O "aluno pesquisador" da especificação, que é um aluno autenticado que não é formando, navega como o visitante. [GRUPO: confirmar se isso basta ou se ele deve ter um perfil próprio.]'),
    H2('2.4. Onde a especificação e o protótipo ainda divergem'),
    P('Ao comparar a especificação com o protótipo, o grupo encontrou os pontos abaixo. Para cada um, a regra já está decidida (seção 2.2); falta aplicá-la à especificação, ao protótipo ou aos dois.'),
    LI('**Rascunho sem link:** o UC01 diz que, sem a URL do LUME, o trabalho "pode ser salvo como rascunho", mas o protótipo só oferecia o rascunho depois que a validação do link falha (FA02); com o link vazio, o formulário caía no FA01 e não havia como salvar. Decisão: botão "Salvar como rascunho" no formulário, que exige só o título. Falta implementar no protótipo.'),
    LI('**Edição que despublica:** ao editar um TCC publicado, se o link falhasse na nova validação e o autor aceitasse o rascunho, o TCC saía do feed, e a especificação não previa o caso. Decisão: a versão publicada é mantida e o autor é avisado. Falta especificar no UC02 e implementar no protótipo.'),
    LI('**Exclusão:** não estava na especificação nem no protótipo. Decisão: o autor exclui o próprio TCC; o orientador ou o coorientador devolve o TCC a rascunho do aluno. Falta um caso de uso novo (Excluir TCC) e a implementação no protótipo.'),
    LI('**TCC sem arquivo:** o protótipo trata o caso (botão "Acessar texto no LUME"), mas o UC04 não tem esse fluxo.'),
    LI('**Coleção:** o protótipo filtra por curso, mas o diagrama de classes não tem o atributo (seção 9).'),
    LI('**Limites de tamanho:** os limites de texto e de arquivo propostos na seção 7.2 ainda não são aplicados pelo protótipo.'),
    P('Todos esses ajustes entram na consolidação da Etapa 3. Os casos de teste CT51 a CT54 (seção 7.5) verificam as três decisões novas.'),
  );

  // 3. Arquitetura
  add(
    H1('3. Arquitetura e design'),
    H2('3.1. Visão geral'),
    P('A arquitetura proposta tem um cliente web e um servidor de aplicação. O cliente é uma aplicação de página única (SPA), da qual o protótipo é a primeira versão. Ele se comunica por HTTPS, com dados em JSON, com um servidor monolítico organizado nas camadas do diagrama de pacotes: controller, service, repository, model e dto.'),
    P('Os metadados ficam em um banco relacional, e os arquivos dos TCCs e as imagens ficam em um armazenamento de arquivos. Há dois sistemas externos: o login institucional da UFRGS e o repositório LUME (Figura 1).'),
    legenda('Figura 1 - Arquitetura proposta para a plataforma'),
    new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, children: [new ImageRun({ type: 'png', data: imagem, transformation: { width: 690, height: 414 } })] }),
    FONTE('Fonte: elaborado pelo grupo.'),
    H2('3.2. Componentes e responsabilidades'),
    P('A Tabela {T:componentes} resume o papel de cada componente e os requisitos que ele atende.'),
    TAB('componentes', 'Componentes e responsabilidades'),
    tabela(['Componente', 'Responsabilidade', 'Atende'], [
      ['Cliente web (SPA React)', 'Telas Feed, Busca, Detalhe, Formulário, Perfil e Entrar. Faz validações imediatas (limite de 5 tags e 3 imagens) para dar retorno rápido, sem substituir a validação do servidor.', 'RF#01, RF#02; UC01, UC04'],
      ['controller (TccController)', 'Expõe a API. Converte cada requisição em FiltroBusca ou DTO e devolve as mensagens literais dos casos de uso (FA01, FA02). Não contém regra de negócio.', 'UC01, UC04'],
      ['service (TccService, ValidadorLumeService)', 'Regras de negócio: só TCC publicado aparece; os filtros são combinados com E; rascunho e publicação; campos obrigatórios. O ValidadorLumeService verifica domínio e acesso do link do LUME.', 'RF#01, RF#02; UC01, UC03, UC04'],
      ['ArmazenamentoArquivos (interface)', 'Transfere o arquivo do TCC. A transferência é tudo ou nada: em caso de falha, nada parcial chega ao usuário.', 'UC04 (FA02); CT06'],
      ['repository (TccRepository, TagRepository)', 'Consulta e grava os dados. Os testes usam uma implementação em memória e a produção usaria SQL, com a mesma interface.', 'RF#01, RF#02'],
      ['model e dto', 'Entidades do diagrama de classes (TCC, Usuario, Tag, Area, Midia, ArquivoTcc) e objetos de transferência (FiltroBusca, TccDTO, FeedDTO).', 'Todos'],
      ['Banco de dados relacional', 'TCC, usuários (Aluno Formando, Professor), tags, áreas, mídias e metadados do arquivo.', 'RF#01, RF#02'],
      ['Armazenamento de arquivos', 'Arquivos PDF, DOCX e EPUB e as imagens. O banco guarda só o caminho e o formato.', 'RF#01, RF#02'],
      ['Login institucional (externo)', 'Autentica autores e professores. Visitantes navegam sem login, só com leitura.', 'Stakeholders'],
      ['LUME (externo)', 'Fonte oficial dos TCCs. A plataforma não o substitui: guarda e valida o link permanente.', 'UC03; benchmark'],
    ], [2.2, 5.6, 2.2]),
    FONTE('Fonte: elaborado pelo grupo.'),
    H2('3.3. Comunicação'),
    P('O cliente chama uma API REST. Para o UC04: `GET /tccs?termo=&ano=&autor=&orientador=&tags=&colecao=` (busca), `GET /tccs/{id}` (detalhes) e `GET /tccs/{id}/arquivo` (download). Cadastro e edição (UC01, UC02) usam `POST /tccs` e `PUT /tccs/{id}` e exigem autenticação; o feed usa `GET /feed`.'),
    P('Dentro do servidor, as chamadas descem de forma síncrona (controller → service → repository), como no diagrama de pacotes; uma camada nunca chama a de cima. Os sistemas externos ficam atrás de interfaces, para que os testes possam simular o LUME fora do ar (CT02) ou a queda de conexão no meio do download (CT06).'),
    P('A Figura 2 mostra essa comunicação para o UC04, do clique em "Pesquisar" ao download, com os dois fluxos alternativos. O parecer da Etapa 1 pediu esse diagrama, porque o de sequência entregue cobria só o cadastro (UC01). Os nomes das classes e dos métodos são os do diagrama de classes; o ArmazenamentoArquivos é a interface nova proposta na seção 3.2.'),
    legenda('Figura 2 - Diagrama de sequência do UC04 (Buscar e Filtrar TCCs)'),
    new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, children: [new ImageRun({ type: 'png', data: imagemSeq, transformation: { width: 660, height: 720 } })] }),
    FONTE('Fonte: elaborado pelo grupo.'),
    H2('3.4. Persistência e dados'),
    P('O banco relacional segue o diagrama de classes, com duas mudanças que o experimento mostrou serem necessárias: um atributo **coleção** (curso de origem) no TCC e no FiltroBusca (seção 9), e campos de busca normalizados, sem acentos e em minúsculas, para que "deteccao" encontre "Detecção". Os arquivos ficam fora do banco. O status (RASCUNHO ou PUBLICADO) é uma coluna do TCC, e as consultas públicas filtram por PUBLICADO.'),
    P('O protótipo guarda o estado no `localStorage` do navegador, o que basta para demonstração; as implementações do SDD usam um repositório em memória com os TCCs A a E do CT03.'),
    H2('3.5. Decisões técnicas'),
    TAB('decisoes', 'Decisões técnicas'),
    tabela(['Decisão', 'Motivo', 'Alternativa descartada'], [
      ['Monólito em camadas', 'O escopo é pequeno, a equipe tem 3 pessoas e o diagrama de pacotes já define as camadas.', 'Microsserviços: custo de operação sem ganho neste escopo.'],
      ['SPA + API REST', 'O protótipo já é uma SPA. A API separa interface e regra, e permitiria um aplicativo móvel depois.', 'Páginas geradas no servidor: exigiria reescrever o protótipo.'],
      ['Banco relacional', 'Dados estruturados e relacionados (TCC, Tag, Área, orientação) e filtros combinados.', 'Banco de documentos: consultas por relação ficam mais difíceis.'],
      ['Arquivos fora do banco, atrás de interface', 'Arquivos grandes; a interface permite simular falha de transferência (CT06).', 'Guardar o arquivo no banco.'],
      ['Busca em campos normalizados; o termo casa o início de uma palavra', 'Decisão do grupo (sem acentos e maiúsculas) e o problema do termo curto "IA", que trazia "anomalias" (seção 8.2). "rede" continua encontrando "redes".', 'Busca por qualquer trecho, que gera ruído; palavra inteira, que perderia os plurais; motor de busca dedicado, excessivo para o volume do INF.'],
      ['LUME como fonte oficial', 'Resultado do benchmark: a plataforma divulga e relaciona, não cataloga.', 'Copiar o acervo do LUME.'],
      ['Download tudo ou nada', 'FA02 e CT06: nenhum arquivo incompleto pode ser salvo.', 'Repassar os bytes conforme chegam, sem verificar o fim da transferência.'],
    ], [2.4, 4.4, 3.2]),
    FONTE('Fonte: elaborado pelo grupo.'),
    H2('3.6. Relação com o protótipo e com a implementação do SDD'),
    P('O protótipo é o cliente da Figura 1, ainda sem servidor: a função `buscar()` de `src/lib.js` faz no navegador o que a camada service fará no servidor. As implementações geradas no SDD são o núcleo do servidor para o UC04 (controller, service, repository, model e dto), sem a camada HTTP; nelas, a API pública do TccController faz o papel da interface. As duas partes seguem os mesmos casos de teste, o que permite comparar os comportamentos (seção 8.3).'),
  );

  // 4. Processo
  add(
    H1('4. Processo de Engenharia de Software utilizado'),
    P('Na **Etapa 1**, o grupo seguiu um processo iterativo e majoritariamente manual: problema, pesquisa de campo e benchmark, requisitos, user stories, casos de uso, diagramas UML, casos de teste e protótipo. A IA foi usada em tarefas pontuais, e cada saída foi revisada pelo grupo (seção 3.3 da Entrega 1 e Anexo C).'),
    P('Na **Etapa 2**, o grupo aplicou SDD com IA sobre esse material, em cinco passos:'),
  );
  const passos = novaLista();
  add(
    LN('O grupo montou um pacote de entrada com o material da Etapa 1, sem as seções de protótipo e de GenAI.', passos),
    LN('O grupo escreveu uma constituição, com os princípios que valem para todas as fases, e modelos de documento.', passos),
    LN('O grupo escreveu um prompt por fase.', passos),
    LN('Cada IA executou as fases em ordem, parando ao fim de cada uma; o grupo respondeu às perguntas da fase Clarify.', passos),
    LN('O grupo verificou os resultados com testes próprios e comparou as duas ferramentas.', passos),
    P('A Tabela {T:processo} mostra a que parte do processo clássico cada fase do SDD corresponde.'),
    TAB('processo', 'Processo da Etapa 1 e fluxo de SDD apoiado por IA'),
    tabela(['Fase do SDD', 'O que faz', 'Equivalente na Etapa 1', 'O que mudou'], [
      ['Specify', 'Define o que construir e por quê', 'Requisitos, user stories e casos de uso', 'A IA gera a especificação a partir dos artefatos do grupo e indica a origem de cada requisito.'],
      ['Clarify', 'Identifica ambiguidades e decisões abertas', 'Discussões e revisões do grupo', 'As dúvidas viram perguntas explícitas, com opções e uma recomendação; o grupo decide.'],
      ['Plan', 'Decide como construir', 'Diagramas de classes, pacotes e sequência', 'O plano registra cada divergência entre a especificação e os diagramas.'],
      ['Tasks', 'Divide o trabalho', 'Não existia (divisão informal)', 'Tarefas numeradas, ligadas a requisitos e testes, com os testes antes do código.'],
      ['Implement', 'Constrói e testa', 'Protótipo, com os CTs executados à mão', 'Código e testes automatizados gerados pela IA.'],
      ['Analyze', 'Verifica a coerência entre os artefatos', 'Revisão manual', 'Matriz requisito → tarefa → teste e lista de inconsistências gerada pela IA, conferida pelo grupo.'],
    ], [1.4, 2.4, 2.6, 3.6]),
    FONTE('Fonte: elaborado pelo grupo.'),
  );

  // 5. SDD
  add(
    H1('5. Spec-Driven Development: pesquisa e aplicação'),
    H2('5.1. Conceito'),
    P('No Spec-Driven Development (SDD), uma especificação estruturada, escrita antes do código, é a referência para o planejamento, a divisão em tarefas, a implementação e os testes. Com agentes de IA, a especificação também passa a ser a principal entrada do modelo: em vez de pedir código direto ("vibe coding"), o desenvolvedor descreve o quê e o porquê, revisa um plano e só então deixa o agente implementar, tarefa por tarefa.'),
    P('Böckeler (2025) distingue três níveis de adoção:'),
    LI('**spec-first:** a especificação é escrita antes de cada tarefa e pode ser descartada depois;'),
    LI('**spec-anchored:** a especificação é mantida e evolui junto com o código;'),
    LI('**spec-as-source:** a especificação é o artefato principal, e o código é gerado a partir dela.'),
    P('O experimento deste trabalho é spec-first: a especificação do UC04 foi escrita antes do código e não foi mantida depois.'),
    H2('5.2. Ferramentas disponíveis'),
    TAB('ferramentas', 'Ferramentas de SDD pesquisadas'),
    tabela(['Ferramenta', 'Como funciona', 'Pontos fortes', 'Limitações'], [
      ['GitHub Spec Kit (GitHub, 2025; código aberto)', 'Uma ferramenta de linha de comando prepara o projeto, e comandos no agente executam as fases: constituição, specify, clarify, plan, tasks, implement e analyze. Funciona com vários agentes (Copilot, Claude Code, Gemini CLI e outros).', 'As fases coincidem com as do enunciado; não depende de um agente específico; a constituição fixa princípios para todas as fases.', 'Processo pesado, com muito Markdown para revisar; exige instalar a ferramenta.'],
      ['Kiro (AWS)', 'IDE e linha de comando. Cada funcionalidade tem requirements.md (user stories e critérios de aceitação na notação EARS), design.md e tasks.md, revisados em ordem.', 'Fluxo integrado ao editor; requisitos em formato padronizado (EARS).', 'Ligado a um produto específico; menos flexível para outro agente.'],
      ['Tessl', 'Busca o nível spec-as-source: a especificação é mantida como fonte, e o código é derivado dela.', 'Especificação viva, que não fica desatualizada.', 'Böckeler alerta para a rigidez, semelhante à do desenvolvimento dirigido por modelos, somada ao não determinismo dos modelos de linguagem.'],
      ['OpenSpec (Fission-AI; código aberto)', 'Cada mudança ganha uma pasta com proposta, tarefas e as alterações ("deltas") da especificação.', 'Mais leve que o Spec Kit; pensado para evoluir sistemas que já existem.', 'Menos estrutura para começar um projeto do zero.'],
      ['Agentes com modo de planejamento (Claude Code, Antigravity)', 'Não são ferramentas de SDD, mas planejam antes de editar e executam um plano aprovado.', 'Executam qualquer fluxo descrito em prompts.', 'Sem fases nem artefatos padronizados: o processo precisa vir de fora.'],
    ], [2, 3.4, 2.4, 2.2]),
    FONTE('Fonte: elaborado pelo grupo a partir de Delimarsky (2025), Böckeler (2025), Kiro (2026) e Fission-AI (2026).'),
    P('O grupo escolheu o **GitHub Spec Kit** como base porque as fases dele são exatamente as do enunciado e porque ele não depende de um agente específico, o que permitiu repetir o mesmo processo em duas ferramentas. A ferramenta de linha de comando não foi usada: o grupo escreveu modelos simplificados em português e um prompt por fase (Anexo A), para que as duas IAs recebessem entradas idênticas.'),
    H2('5.3. Preparação'),
    P('A constituição tem seis princípios:'),
    LI('**I. Rastreabilidade:** todo requisito, tarefa e teste indica a origem no relatório.'),
    LI('**II. Testes primeiro:** os testes vêm dos casos de teste e são escritos antes do código.'),
    LI('**III. Fidelidade ao domínio:** nomes dos diagramas, mensagens literais e divergências registradas.'),
    LI('**IV. Camadas:** as dependências externas ficam atrás de interfaces.'),
    LI('**V. Simplicidade:** sem dependências externas, sem interface gráfica, persistência em memória.'),
    LI('**VI. Ambiguidade explícita:** o que não está decidido é marcado e perguntado.'),
    P('Na fase Plan, o grupo fixou as restrições técnicas: JavaScript em Node.js 20 ou superior, sem dependências externas, testes com `node --test`, camadas e nomes dos diagramas, dados iniciais com os TCCs A a E do CT03, e um ponto de entrada `src/app.js` que permite injetar dependências. Essas restrições tornam as duas saídas comparáveis e executáveis com o mesmo comando.'),
    P('Para a comparação ser justa, as duas ferramentas receberam a mesma pasta e os mesmos seis prompts, em uma conversa cada, sem acesso ao protótipo. No Claude Code, o agente rodou com contexto limpo, isolado na própria pasta.'),
    H2('5.4. Resultado por fase'),
    TAB('fases', 'Resultado de cada fase nas duas ferramentas'),
    tabela(['Fase', 'Claude Code (Claude Opus 5.5)', 'Antigravity (Gemini 4 Argon, raciocínio High)'], [
      ['Specify', '3 histórias, 18 requisitos funcionais (FR), 5 pontos marcados para esclarecer. ~3 min', '3 histórias, 10 FR, 5 pontos marcados. ~4 min'],
      ['Clarify', '5 perguntas, entregues de uma vez (limitação do ambiente). ~2 min, sem contar o tempo das respostas', '5 perguntas, uma por vez, com opções e recomendação. ~14,5 min, incluindo as respostas'],
      ['Plan', '12 divergências com os diagramas registradas; falha simulada no meio da transferência. ~6,5 min', '6 divergências registradas; falha simulada por uma chave liga/desliga. ~3,5 min'],
      ['Tasks', '52 tarefas. ~9 min', '25 tarefas. ~2 min'],
      ['Implement', '53 testes, 53 aprovados. Antes do código de cada história falharam 20, 9 e 9 testes. 10 desvios registrados. ~17 min', '12 testes, 12 aprovados. Antes do código falharam 7, 2 e 3. Declarou "nenhum desvio". ~8,5 min'],
      ['Analyze', '24 achados (1 alto, 8 médios, 15 baixos); 100% dos FR com teste; 27 inconsistências no material da Etapa 1. ~22 min', '5 achados (todos baixos); 100% dos FR com teste; 0 violações da constituição declaradas; 9 inconsistências no material da Etapa 1. ~2 min'],
    ], [1.3, 4.35, 4.35]),
    FONTE('Fonte: pastas specs/001-buscar-filtrar-tccs/ de cada ferramenta e registro-experimentos.md. Tempos aproximados.'),
    H2('5.5. O que cada fase trouxe'),
    P('**Specify.** As duas ferramentas transformaram o UC04 e os casos de teste em requisitos com origem indicada, e as duas marcaram como principal dúvida o filtro "Coleção". Isso indica uma lacuna real do material da Etapa 1, e não uma impressão de uma ferramenta só.'),
    P('**Clarify.** Foi a fase mais útil: obrigou o grupo a decidir o que a Etapa 1 deixava implícito (o que é uma coleção, se a busca ignora acentos, o que acontece com um TCC sem arquivo, o que a busca vazia retorna, em que ordem vêm os resultados). Também foi onde a IA mais influenciou o resultado, porque as respostas dependem das perguntas e das opções que ela oferece: o Claude não perguntou sobre acentos nos filtros de autor e orientador e decidiu sozinho; o Gemini não ofereceu nenhuma opção sobre acentos.'),
    P('**Plan.** Mostrou divergências entre a especificação e os diagramas. Por exemplo, o diagrama de classes diz que `buscarTccs` devolve só uma lista, mas o FA01 exige também uma mensagem; e as tags aparecem como texto simples onde deveriam ser uma lista.'),
    P('**Tasks e Implement.** As duas ferramentas puseram os testes antes do código, e as duas entregaram todos os testes aprovados. Mas os testes eram delas mesmas: os testes independentes da seção 8.2 mostraram diferenças que esses testes não pegavam.'),
    P('**Analyze.** O Claude apontou falhas no próprio código (achados A04, A06 e A07). O Gemini declarou zero violações e nenhum desvio, o que não se confirmou na inspeção (Tabela {T:registroSdd}). A autoavaliação da IA precisa ser conferida.'),
    H2('5.6. Benefícios, limitações e percepções do grupo'),
    P('**Benefícios observados:** rastreabilidade de requisito a tarefa e a teste sem trabalho manual; ambiguidades levantadas antes do código; uma auditoria do material da Etapa 1 (27 e 9 inconsistências); uma implementação executável e testada em menos de uma hora de máquina.'),
    P('**Limitações observadas:** a especificação só é tão boa quanto as respostas do Clarify; o volume de texto a revisar é grande (cada plano tem cerca de 300 linhas); a IA escreve os testes e o código que eles verificam, então passar nos próprios testes prova pouco; a profundidade varia muito entre ferramentas com as mesmas entradas.'),
    P('**Aplicabilidade:** o SDD compensou numa funcionalidade com regras e casos-limite, como a busca. Para telas simples ou protótipos descartáveis, o custo de especificar e revisar tende a superar o ganho.'),
    P('**Percepções do grupo:** [GRUPO: em 3 a 5 frases, o que vocês acharam de trabalhar assim. Sugestão para editar: "Responder ao Clarify foi a parte que mais exigiu de nós, porque as perguntas mostraram decisões que não tínhamos tomado na Etapa 1. Ler os planos e as análises tomou mais tempo do que esperávamos. Usaríamos SDD de novo em funcionalidades com muitas regras, mas não para telas simples."]'),
  );

  // 6. GenAI
  add(
    H1('6. Uso de GenAI ao longo do ciclo'),
    H2('6.1. Visão por etapa do ciclo de desenvolvimento'),
    P('A Tabela {T:sdlc} mostra onde a IA entrou no ciclo de desenvolvimento, nas duas etapas. O registro detalhado de cada experiência, com as perguntas do enunciado, está no Anexo C.'),
    TAB('sdlc', 'Uso da IA por etapa do ciclo de desenvolvimento'),
    tabela(['Etapa do ciclo', 'Artefato / atividade', 'Ferramenta (exp.)', 'Uso da IA', 'Contribuição percebida'], [
      ['Requisitos', 'Formulário da pesquisa de campo', 'Gemini (1)', 'Reorganizar o rascunho do grupo segundo um modelo de entrevista', '[GRUPO: avaliar]'],
      ['Requisitos', 'Problema, benchmark, requisitos, user stories, casos de uso', 'Sem IA (só a linha do LUME no benchmark, com Claude Code)', 'Não houve', 'Base de todo o trabalho; as IAs depois acharam lacunas nela (seção 9)'],
      ['Modelagem', 'Diagrama de classes', 'Gemini e Claude (2)', 'Gerar a estrutura a partir dos requisitos; revisão por uma segunda IA sem contexto', '[GRUPO: avaliar] Fato: o SDD achou lacunas nele (coleção, tipos, papéis)'],
      ['Modelagem', 'Diagramas de pacotes e de sequência', 'Gemini (3)', 'Gerar a partir do diagrama de classes', '[GRUPO: avaliar] Fato: 2 dos 6 problemas conhecidos estavam no de sequência'],
      ['Modelagem', 'Diagrama de atividades do UC04', 'Claude Code (5)', 'Gerar no padrão visual do diagrama do UC01', 'Rápido; mas abreviou as mensagens do FA01 e do FA02 (achado do SDD)'],
      ['Testes', 'CT01 a CT03', 'Claude (4)', 'Gerar 3 casos a partir dos requisitos', '[GRUPO: avaliar]'],
      ['Testes', 'CT04 a CT06', 'Claude Code (5)', 'Completar os casos no mesmo formato', 'Usados como estão e executados no protótipo'],
      ['Revisão', 'Relatório da Etapa 1', 'Claude Code (5)', 'Apontar inconsistências entre requisitos, casos de uso, diagramas e testes', 'Alta: os problemas apontados viraram correções'],
      ['Design UX', 'Protótipo de alta fidelidade', 'Claude Code (5)', 'Gerar o protótipo React a partir das especificações', 'Alta em velocidade; [GRUPO: avaliar a qualidade]'],
      ['Implementação (SDD)', 'Especificação, plano, tarefas, código e testes do UC04', 'Claude Code e Antigravity (6, 7)', 'Executar as seis fases do SDD', 'Alta para achar ambiguidades; o código gerado precisou de verificação independente'],
      ['Testes', 'Classes de equivalência e valor limite', 'Claude Code e Antigravity (8, 9)', 'Ampliar os CTs com os critérios funcionais', 'Claude: alta; as lacunas apontadas viraram decisões, e os testes acharam 2 falhas do protótipo. Gemini: baixa com o prompt simples (dados inventados); aproveitável com o refinado'],
      ['Verificação', 'Testes independentes e comparação', 'Claude Code (10)', 'Escrever testes de caixa-preta a partir das decisões do grupo e comparar as saídas', 'Mostrou diferenças que os testes das próprias IAs escondiam'],
      ['Arquitetura e documentação', 'Seção de arquitetura e rascunho deste relatório', 'Claude Code (10)', 'Redigir a partir dos diagramas, do protótipo e dos dados dos experimentos', '[GRUPO: avaliar após a revisão]'],
    ], [1.3, 2.1, 1.6, 2.6, 2.4]),
    FONTE('Fonte: elaborado pelo grupo. Os números entre parênteses remetem às experiências do Anexo C.'),
    H2('6.2. Experimentos de SDD'),
    P('A Tabela {T:registroSdd} registra os dois experimentos de SDD com os campos pedidos na seção 9 do enunciado. O registro completo, com horários e as perguntas de cada ferramenta, está em `etapa2/registro-experimentos.md`.'),
    TAB('registroSdd', 'Registro dos experimentos de SDD'),
    tabela(['Campo', 'Claude Code', 'Antigravity'], [
      ['Ferramenta / modelo', 'Claude Code, modelo Claude Opus 5.5 (Anthropic)', 'Antigravity (Google), modelo Gemini 4 Argon, com raciocínio High. Modo do agente na configuração padrão; o agente executava comandos no terminal sem pedir confirmação.'],
      ['Prompt / estratégia', 'Os 6 prompts do Anexo A, um por fase, com parada ao fim de cada uma. Agente com contexto limpo. As 5 perguntas do Clarify vieram juntas; o grupo respondeu só com as opções oferecidas pelo modelo.', 'Os mesmos 6 prompts, na mesma conversa. As 5 perguntas do Clarify vieram uma por vez; o grupo respondeu só com as opções oferecidas pelo modelo.'],
      ['Artefato / contexto', 'Pacote de entrada: relatório da Etapa 1 (seções 1 a 3.2.3), 6 diagramas em imagem e em transcrição textual, constituição e modelos', 'O mesmo pacote'],
      ['Resultado', 'Especificação (18 FR), plano, 52 tarefas, ~1.430 linhas de JavaScript, 53 testes aprovados e uma análise com 24 achados', 'Especificação (10 FR), plano, 25 tarefas, ~1.040 linhas de JavaScript, 12 testes aprovados e uma análise com 5 achados'],
      ['Aceito', 'Camadas e nomes dos diagramas; mensagens literais; falha simulada no meio da transferência; 4 das 5 recomendações do Clarify', 'Camadas e nomes; mensagens literais; 3 das 5 recomendações do Clarify; registro das mensagens divergentes entre texto e diagrama'],
      ['Alterado', 'Nada no código gerado: o experimento mede a saída como veio. As correções viraram decisões para a versão final (seção 9).', 'Idem'],
      ['Investigado', 'Achados A04, A06 e A07, confirmados pelos testes independentes e pela leitura do código', 'As afirmações "0 violações" e "nenhum desvio". A simulação de falha é só uma chave liga/desliga, e o "buffer parcial" é descartado antes de ser usado.'],
      ['Rejeitado', 'Recomendação "Coleção = área temática (via tags)"', 'Recomendações sobre a ordenação (ordem de cadastro) e sobre o escopo dos detalhes (sem trabalhos conexos)'],
      ['Justificativa', 'Seção 9', 'Seção 9'],
      ['Omissões', 'Não perguntou sobre acentos nos filtros de autor e orientador nem sobre o coorientador; registrou-os como premissas.', 'Não ofereceu opção sobre acentos nem sobre coleção como curso. Não detectou 4 dos 6 problemas conhecidos da Etapa 1. Não testou DOCX e EPUB (ele mesmo apontou).'],
      ['Contradições', 'Decidiu sozinho que autor e orientador diferenciam acentos, contra o princípio VI (o próprio agente apontou, achado A07).', 'Declarou conformidade total, mas o controller guarda estado de tela (página aberta, arquivos "salvos") e o armazenamento está no pacote service, fora dos diagramas.'],
      ['Alucinações', 'Nenhuma identificada', 'Nenhuma identificada'],
      ['Erros', 'Arquivo ausente gera a mensagem "verifique a sua conexão" (A04); termo curto casa trechos de palavras (A06)', 'Termo curto casa trechos de palavras; ano inválido é ignorado em silêncio; "deteccao" não encontra "Detecção"'],
      ['Boas sugestões', 'Coletar a coleção no cadastro (A01); separar "arquivo ausente" de "falha de conexão" (A04); termo por palavra inteira (A06)', 'Mensagem própria para TCC sem arquivo, com o link do LUME; uniformizar as mensagens do diagrama de atividades e do UC04; oferecer a ordenação por recência'],
    ], [1.6, 4.2, 4.2]),
    FONTE('Fonte: registro-experimentos.md e artefatos de cada ferramenta.'),
    P('Os prompts do SDD não foram refinados de propósito: mantê-los fixos era a condição para comparar as duas ferramentas. O efeito de refinar o prompt foi medido no experimento seguinte.'),
    H2('6.3. Experimento de testes funcionais'),
    P('As duas ferramentas receberam o relatório da Etapa 1 e dois prompts, na mesma conversa (Anexo B). O **prompt 1** é simples: pede para ampliar os CTs com classes de equivalência e valor limite. O **prompt 2** é o refinado: fixa a estrutura (condições de entrada, tabela de classes, tabela de limites, casos no formato dos CTs, matriz de cobertura e lacunas), o critério de cobertura (cada caso inválido cobre uma única classe inválida) e proíbe inventar regras que o relatório não define.'),
    ...(TF && TF.registro
      ? [TAB('registroTestes', 'Registro do experimento de testes funcionais'), tabela(['Campo', 'Claude Code', 'Antigravity'], TF.registro, [1.6, 4.2, 4.2]), FONTE('Fonte: pasta etapa2/testes-funcionais/.'), ...(TF.textoRegistro || []).map((t) => P(t))]
      : [P('[PENDENTE: resultado do Claude Code e do Antigravity, a comparação entre o prompt 1 e o prompt 2 e a resposta a "refinar os prompts produziu resultados melhores?".]')]),
  );

  // 7. Testes funcionais
  add(H1('7. Casos de teste funcionais: classes de equivalência e valor limite'));
  if (TF && TF.secao) {
    for (const bloco of TF.secao) {
      if (bloco.h2) add(H2(bloco.h2));
      if (bloco.p) add(P(bloco.p));
      if (bloco.li) bloco.li.forEach((t) => add(LI(t)));
      if (bloco.tabela) add(TAB(bloco.tabela.chave, bloco.tabela.titulo), tabela(bloco.tabela.cab, bloco.tabela.linhas, bloco.tabela.pesos), FONTE(bloco.tabela.fonte || 'Fonte: elaborado pelo grupo.'));
    }
  } else {
    add(P('[PENDENTE: tabelas de classes de equivalência e de valores limite para o UC01 e o UC04 e os novos casos de teste (a partir do CT07), consolidados a partir das duas IAs e revisados pelo grupo.]'));
  }

  // 8. Comparação
  add(
    H1('8. Comparação'),
    H2('8.1. Entre as IAs'),
    TAB('metricas', 'Métricas das duas execuções de SDD'),
    tabela(['Métrica', 'Claude Code', 'Antigravity'], [
      ['Requisitos funcionais na especificação', '18', '10'],
      ['Divergências com os diagramas registradas no plano', '12', '6'],
      ['Tarefas', '52', '25'],
      ['Testes próprios (aprovados)', '53 (53)', '12 (12)'],
      ['Linhas de JavaScript (código + testes)', '~1.430', '~1.040'],
      ['Tempo total aproximado', '~60 min', '~35 min (inclui as respostas do Clarify)'],
      ['Achados na análise final (alto / médio / baixo)', '24 (1 / 8 / 15)', '5 (0 / 0 / 5)'],
      ['Inconsistências apontadas no material da Etapa 1', '27', '9'],
      ['Problemas conhecidos da Etapa 1 encontrados (Tabela {T:gabarito})', '5 de 6', '2 de 6'],
      ['Testes independentes aprovados (Tabela {T:oraculo})', '16 de 17', '13 de 17'],
    ], [5, 2.5, 2.5]),
    FONTE('Fonte: elaborado pelo grupo.'),
    P('O Claude Code foi mais minucioso e mais crítico consigo mesmo, e levou quase o dobro do tempo. O Gemini foi mais rápido e mais enxuto, mas a análise final dele foi otimista demais. Nos casos de teste da Etapa 1, as duas implementações empataram (5 de 5): esses casos sozinhos não distinguem as ferramentas; as diferenças só aparecem nas decisões e nos casos-limite.'),
    P('Antes do experimento, a revisão da Etapa 1 (experiência 5) tinha apontado seis problemas no material. Eles serviram de gabarito para medir a fase Analyze (Tabela {T:gabarito}).'),
    TAB('gabarito', 'Problemas conhecidos da Etapa 1 encontrados por cada IA'),
    tabela(['Problema no material da Etapa 1', 'Claude Code', 'Antigravity'], [
      ['"Coleção" é filtro no RF#02 e no UC04, mas não é atributo nem classe nos diagramas', 'Sim', 'Sim'],
      ['Diagrama de sequência do UC01: seta "status" saindo do TccRepository para o LUME, sem chamada anterior', 'Sim', 'Sim'],
      ['Diagrama de sequência do UC01: validarCamposObrigatorios() como auto-chamada do TccService, mas o método é da classe TCC', 'Sim', 'Não'],
      ['Visitante é ator do UC04, mas não aparece no diagrama de casos de uso nem no de classes', 'Sim', 'Não'],
      ['O mesmo ator com nomes diferentes ("Aluno Graduando" no diagrama de atividades, "Aluno Formando" no texto)', 'Sim', 'Não'],
      ['Numeração das user stories salta de US#01 para US#04', 'Não', 'Não'],
    ], [6, 2, 2]),
    FONTE('Fonte: elaborado pelo grupo a partir dos arquivos analysis.md.'),
    H2('8.2. Testes independentes nas duas implementações'),
    P('Depois das seis fases, o grupo escreveu 17 testes de caixa-preta a partir dos casos de teste e das decisões do Clarify (`etapa2/oraculo/`). Os mesmos testes rodaram nas duas implementações por meio de adaptadores (Tabela {T:oraculo}).'),
    TAB('oraculo', 'Testes independentes'),
    tabela(['Grupo de testes', 'Claude Code', 'Antigravity'], [
      ['Casos de teste da Etapa 1 (CT03, CT03 variação, CT05, CT05 variação, CT06)', '5/5', '5/5'],
      ['Decisões do grupo no Clarify (coleção, maiúsculas, acentos, campos do termo, tags com E, TCC sem arquivo, busca vazia)', '8/8', '6/8 (coleção e acentos)'],
      ['Robustez, não decidida pelo grupo (rascunho bloqueado, autor parcial, termo curto, ano inválido)', '3/4 (termo "IA")', '2/4 (termo "IA"; ano "abc" ignorado)'],
      ['Total', '16/17', '13/17'],
    ], [6, 2, 2]),
    FONTE('Fonte: execução de IMPL=claude node --test oraculo/ e IMPL=antigravity node --test oraculo/.'),
    P('As duas falhas do Antigravity nas decisões do grupo (coleção e acentos) vêm das respostas dadas no Clarify dele (seção 9), não de erro de programação. O termo curto "IA" falhou nas duas: a busca por trecho encontra "IA" dentro de "anomal**ia**s" e "estratég**ia**s". O Claude apontou esse problema na própria análise (A06); o Gemini, não.'),
    P('Limite desta comparação: no Antigravity, a falha do CT06 só pode ser simulada com a conexão já caída antes de começar; a interrupção no meio da transferência, que o CT06 descreve, não pode ser reproduzida nessa implementação.'),
    H2('8.3. Artefatos com e sem IA'),
    P('A Tabela {T:regras} compara a regra de busca do protótipo, gerada com IA a partir das decisões do grupo na Etapa 1, com as regras das duas implementações do SDD.'),
    TAB('regras', 'Regras de busca: protótipo e implementações do SDD'),
    tabela(['Regra', 'Protótipo', 'Claude Code', 'Antigravity'], [
      ['Só TCCs publicados', 'Sim', 'Sim', 'Sim'],
      ['Campos do termo livre', 'Título, resumo, autor, orientador, coorientador, tags', 'Título, resumo, autor, orientador, tags', 'Igual ao protótipo'],
      ['Acentos', 'Ignora em tudo', 'Ignora no termo, não em autor e orientador', 'Não ignora'],
      ['Filtro de orientador', 'Igualdade (vem de uma lista de seleção)', 'Trecho, sem diferenciar maiúsculas', 'Trecho, sem diferenciar maiúsculas'],
      ['Filtro de coleção', 'Curso (lista de seleção)', 'Curso', 'Não existe'],
      ['Várias tags', 'Todas (E)', 'Todas (E)', 'Todas (E)'],
      ['Ordenação', 'Mais recente primeiro', 'Mais recente primeiro', 'Mais recente primeiro'],
      ['TCC sem arquivo', 'Botão "Acessar texto no LUME"', 'Não oferece o download', 'Recusa o download com mensagem e link do LUME'],
      ['Falha no download', 'Mensagem do FA02 (simulada)', 'Mensagem do FA02; nada parcial é entregue', 'Mensagem do FA02; nada parcial é entregue'],
      ['Termo dentro de uma palavra ("IA" em "anomalias")', 'Encontra (problema)', 'Encontra (problema)', 'Encontra (problema)'],
      ['Testes automatizados', 'Na Etapa 1, nenhum (CTs executados à mão); na Etapa 2, 31 testes funcionais da lógica', '53', '12'],
    ], [2.2, 2.8, 2.5, 2.5]),
    FONTE('Fonte: elaborado pelo grupo.'),
    P('Olhando o trabalho todo, três observações respondem à pergunta do enunciado ("o artefato ficou melhor por causa da IA ou apenas foi produzido mais rapidamente?"):'),
    LI('**Os artefatos feitos sem IA carregavam as decisões de domínio.** Problema, requisitos, user stories e casos de uso foram do grupo. Quando havia dúvida, foi a intenção registrada neles que decidiu, como na coleção = curso.'),
    LI('**Os artefatos gerados com IA não vieram livres de erro.** Dois dos seis problemas conhecidos estavam no diagrama de sequência gerado com o Gemini, e o diagrama de atividades do UC04, gerado com o Claude Code, abreviou as mensagens do FA01 e do FA02. A revisão humana da época não pegou esses erros; a revisão cruzada feita depois pelo SDD pegou.'),
    LI('**Onde houve verificação, a IA melhorou o resultado, e não só a velocidade.** Exemplos: testes automatizados, matriz de rastreabilidade e lista de inconsistências. Onde não houve verificação, ela só acelerou a produção, e às vezes acelerou um erro.'),
    P('[GRUPO: confirmar se concordam com esta leitura e acrescentar a percepção de vocês sobre quais artefatos ficaram melhores e quais só saíram mais rápido.]'),
  );

  // 9. Decisões humanas
  add(
    H1('9. Decisões humanas'),
    P('A Tabela {T:decisoesHumanas} registra o que o grupo aceitou, modificou ou rejeitou do que as IAs propuseram, e por quê.'),
    TAB('decisoesHumanas', 'Decisões do grupo sobre as propostas das IAs'),
    tabela(['Proposta da IA', 'Decisão', 'Justificativa'], [
      ['Claude (Clarify): "Coleção" seria a área temática, via tags', 'Rejeitada: coleção é o curso de origem (ex.: Ciência da Computação)', 'O RF#02 e o UC04 usam "Coleção" como no LUME e no benchmark da UCS ("Subcomunidades e Coleções"). O tema já é coberto pelas tags, e o protótipo já usava o curso. Consequência: o diagrama de classes ganha o atributo coleção.'],
      ['Gemini (Clarify): manter só os 5 critérios dos diagramas e tratar coleção como tags', 'Aceita só dentro do experimento; para a versão final vale coleção = curso', 'Com o Gemini, o grupo escolheu responder só com as opções que ele ofereceu, para medir o que o modelo propunha, e nenhuma delas dizia "curso". Ver a observação abaixo da tabela.'],
      ['Gemini (Clarify): ordenar pela ordem de cadastro', 'Rejeitada: mais recente primeiro', 'O CT05 lista os TCCs "A, C e D" como conjunto, não como ordem. O objetivo é descobrir trabalhos recentes, e o protótipo já ordena assim.'],
      ['Gemini (Clarify): detalhes sem trabalhos conexos', 'Rejeitada: incluir trabalhos conexos e contador de visualizações', 'O UC06 (Mapear Trabalhos Conexos) estende a visualização de detalhes no diagrama de casos de uso, e o diagrama de atividades do UC04 já mostra os trabalhos conexos. Relacionar TCCs é parte do objetivo do projeto.'],
      ['Ambas: termo nos campos principais, tags com E, busca vazia lista todos, TCC sem arquivo indica o LUME', 'Aceitas', 'Coincidem com o comportamento do protótipo e com os casos de teste.'],
      ['Claude: acentos ignorados no termo, mas não em autor e orientador (decidido sem perguntar)', 'Rejeitada: ignorar acentos em todos os campos de texto', 'Um usuário que digita "Joao" deve achar "João" em qualquer campo.'],
      ['Claude: arquivo ausente gera a mensagem de falha de conexão (A04)', 'Rejeitada: o UC04 ganha um fluxo próprio para arquivo indisponível', 'Pedir para "verificar a conexão" quando o arquivo não existe leva o usuário a tentar de novo sem chance de sucesso.'],
      ['Ambas: termo casado por qualquer trecho', 'Modificada: o termo casa o início de uma palavra', 'Evita que "IA" traga "anomalias" (seção 8.2), sem perder os plurais ("rede" encontra "redes"). O protótipo tem o mesmo problema e será ajustado.'],
      ['Gemini (Analyze): "0 violações da constituição"', 'Rejeitada após inspeção', 'Ver a Tabela {T:registroSdd} (contradições).'],
      ['Ambas: inconsistências no material da Etapa 1', 'Aceitas e conferidas uma a uma', 'Seção 10.'],
      ['Claude (testes funcionais): versão refinada, com 25 lacunas', 'Aceita como base; lacunas decididas pelo grupo; 20 casos acrescentados (CT31 a CT50)', 'As lacunas eram decisões que a Etapa 1 não tinha tomado; quase todas foram resolvidas pelo comportamento do protótipo ou pelo Clarify (Tabela {T:lacunas}).'],
      ['Claude (testes funcionais): retirar o teste de domínio parecido com o do LUME', 'Rejeitada: o caso voltou como exemplo da classe CI05', 'É um engano realista do usuário e cabe na classe "outro domínio".'],
      ['Antigravity (testes funcionais): classe "semestre posterior ao atual"', 'Aceita, com o ano corrente corrigido de 2025 para 2026/2 (CI29, CT41)', 'É consequência direta da pré-condição "TCC já defendido", e o Claude a tinha deixado como lacuna.'],
      ['Antigravity (testes funcionais, prompt simples): base de teste e casos CT12 e CT20', 'Rejeitados', 'Contradiziam a tabela do CT03 (semestre e tags dos TCCs, autor e orientador do rascunho) e usavam regras que o relatório não define.'],
    ], [3.2, 2.8, 4]),
    FONTE('Fonte: decisoes-clarify.md e registro-experimentos.md.'),
    P('**Observação sobre a coleção.** A mesma dúvida recebeu respostas diferentes nas duas ferramentas. O Claude perguntou "o que é Coleção?" e recomendou a área temática. O Gemini perguntou se o texto ou os diagramas deveriam prevalecer e recomendou os diagramas, citando a constituição.'),
    P('No Antigravity, o grupo decidiu responder só com as opções oferecidas pelo modelo, para observar o que ele propunha sem interferência. Nenhuma das três opções tratava a coleção como curso: a mais próxima falava em "atributo próprio do TCC", sem dizer qual. O grupo escolheu a recomendada (coleção = tags), sabendo que a resposta correta para o projeto é coleção = curso.'),
    P('Por isso, a especificação, o código e os testes do Antigravity ficaram sem o filtro por curso, e dois testes independentes falharam (seção 8.2). A forma da pergunta e as opções oferecidas pela IA limitam a decisão humana; por isso as decisões do Clarify devem ser registradas e revistas pelo grupo, como foi feito em `decisoes-clarify.md`.'),
  );

  // 10. Problemas
  add(
    H1('10. Problemas encontrados e como foram validados ou corrigidos'),
    H2('10.1. No material da Etapa 1'),
    P('Cada inconsistência apontada pelas IAs foi conferida no relatório e nos diagramas originais antes de entrar na Tabela {T:problemas}. As correções serão aplicadas na versão consolidada da Etapa 3.'),
    TAB('problemas', 'Problemas no material da Etapa 1 e correções propostas'),
    tabela(['Problema', 'Apontado por', 'Correção proposta'], [
      ['"Coleção" sem atributo no TCC e no FiltroBusca, e sem campo no cadastro (UC01)', 'Claude e Gemini', 'Atributo coleção (curso) em TCC e FiltroBusca; campo no formulário do UC01 e nos dados do CT01'],
      ['Mensagens do FA01 e do FA02 com textos diferentes no UC04, nos CTs e no diagrama de atividades', 'Claude e Gemini', 'Usar o texto completo do UC04 em todos os lugares'],
      ['Seta "status" do TccRepository para o LUME no diagrama de sequência do UC01', 'Claude e Gemini', 'A resposta do LUME vai para o ValidadorLumeService'],
      ['validarCamposObrigatorios() como auto-chamada do TccService, mas o método é da classe TCC', 'Claude', 'A mensagem passa a ir do TccService para o TCC'],
      ['Visitante fora do diagrama de casos de uso; nomes diferentes para o mesmo ator', 'Claude', 'Incluir o Visitante (ou um "Usuário Leitor" generalizado) e padronizar "Aluno Formando"'],
      ['TccDTO sem os campos mostrados nos detalhes; tags tipadas como texto; FeedDTO.tccsRecentes não é lista', 'Claude e Gemini', 'Completar o TccDTO e tipar tags e tccsRecentes como listas'],
      ['ArquivoTcc (classes) e ArquivoTCC (pacotes)', 'Claude e Gemini', 'Padronizar como ArquivoTcc'],
      ['UC04 sem fluxo para TCC sem arquivo e para TCC inexistente', 'Claude', 'Novos fluxos alternativos no UC04'],
      ['User stories numeradas US#01 e US#04, sem US#02 e US#03', 'Revisão do grupo (nenhuma IA)', 'Renumerar ou explicar a numeração'],
      ['Protótipo: a lista de semestres do cadastro termina em 2026/1, e o semestre atual (2026/2) não pode ser escolhido', 'Testes funcionais (valor limite)', 'A lista vai até o semestre atual [GRUPO: confirmar]'],
      ['Protótipo: o termo casa trechos no meio de palavras ("IA" encontra "anomalias")', 'Testes independentes e funcionais', 'Casar o início de uma palavra'],
      ['UC01 permite rascunho sem link, mas o protótipo só oferece o rascunho depois da falha do link', 'Conferência do protótipo para o parecer', 'Botão "Salvar como rascunho" no formulário, que exige só o título (seção 2.2)'],
      ['Editar um TCC publicado pode transformá-lo em rascunho; o caso não está especificado', 'Conferência do protótipo para o parecer', 'A versão publicada é mantida e o autor é avisado (seção 2.2)'],
      ['Exclusão de TCC não especificada nem implementada', 'Revisão do grupo', 'O autor exclui; o orientador ou o coorientador devolve o TCC a rascunho do aluno (seção 2.2); novo caso de uso Excluir TCC'],
    ], [4.2, 1.8, 4]),
    FONTE('Fonte: analysis.md das duas ferramentas, conferido pelo grupo.'),
    P('O parecer da Etapa 1 apontou problemas nos diagramas UML que coincidem em parte com os achados das IAs. A Tabela {T:uml} junta as duas fontes e define o ajuste de cada diagrama. O diagrama de sequência do UC04 já está nesta entrega (Figura 2); os demais serão redesenhados na Etapa 3.'),
    TAB('uml', 'Ajustes dos diagramas UML: parecer, achados das IAs e correção prevista'),
    tabela(['Diagrama', 'O que o parecer aponta', 'O que as IAs também acharam', 'Ajuste previsto'], [
      ['Casos de uso', 'Funcionalidades de cada ator e limites do sistema pouco claros; conferir os relacionamentos', 'Visitante é ator do UC04, mas não está no diagrama; o Aluno Formando não herda de Usuário Leitor, então pelo diagrama ele não poderia buscar; o UC05 não tem descrição', 'Atores: Visitante, Aluno e Professor como leitores; Aluno Formando como especialização de Aluno. Fronteira do sistema com o LUME e o login do lado de fora. Feed e download como casos de uso do leitor. Rever o «extend» do UC06 e os «include» do UC03. Novo caso de uso Excluir TCC, ligado ao Aluno Formando e ao Professor (seção 2.2)'],
      ['Pacotes', 'Camadas e dependências pouco claras; a notação parece de componentes', 'O pacote dto está na camada de apresentação, mas repository e service dependem dele; ArquivoTcc e ArquivoTCC com grafias diferentes', 'Usar só a notação de pacotes, sem o LUME como componente. Dependências de cima para baixo, como na Figura 1: controller → service → repository → model. O dto sai da apresentação e vira pacote compartilhado'],
      ['Sequência (UC01)', 'Conferir a correspondência com o caso de uso; falta a busca com filtros', 'Seta "status" saindo do TccRepository para o LUME; validarCamposObrigatorios() no TccService, mas o método é do TCC; métodos com grafias diferentes', 'Corrigir as duas mensagens; acrescentar o FA01 (campos incompletos) e as duas respostas à oferta de rascunho. A busca com filtros é a Figura 2 desta entrega'],
      ['Atividades (UC01)', 'Rever caminhos alternativos e condições; os caminhos finais são alternativas ou atividades paralelas?', 'Mensagens diferentes das do UC01; raia "Aluno Graduando" em vez de "Aluno Formando"; a recusa do rascunho não volta ao formulário', 'Os caminhos finais são alternativas: trocar a barra de bifurcação por um nó final depois de "publicar" e outro depois de "salvar rascunho". Tirar as atividades "Consultar TCCs", que são do UC04. Escrever as condições em cada saída das decisões'],
      ['Atividades (UC04)', 'Rever os fluxos de busca sem resultados e as condições das decisões', 'Mensagens do FA01 e do FA02 abreviadas; falta o filtro de coleção; não há caminho para TCC sem arquivo', 'Usar os textos completos do UC04; incluir a coleção nos filtros; nova decisão "o TCC tem arquivo?", com a saída para o LUME'],
    ], [1.3, 2.5, 2.9, 3.3]),
    FONTE('Fonte: parecer da Etapa 1 e arquivos analysis.md das duas ferramentas.'),
    H2('10.2. No código gerado'),
    P('Os erros do código gerado (A04, A06, A07, ano inválido e a simulação de falha só aparente do Antigravity) foram confirmados pelos testes independentes e pela leitura do código. O código foi mantido como as ferramentas o entregaram, para que a comparação reflita a saída real; as correções foram registradas como decisões (Tabela {T:decisoesHumanas}) para a versão final.'),
    H2('10.3. No próprio experimento'),
    LI('**Gravação bloqueada:** o ambiente do Claude Code impediu o agente de gravar o `analysis.md` na fase Analyze. O texto foi transcrito sem alterações pelo experimentador, o que foi registrado como intervenção.'),
    LI('**Clarify em formatos diferentes:** no Claude as perguntas vieram juntas; no Gemini, uma por vez. Nas duas, o grupo respondeu só com as opções oferecidas pelo modelo. A resposta sobre a coleção divergiu porque o Claude ofereceu "curso" como opção e o Gemini não (seção 9).'),
    LI('**Tempos diferentes:** os tempos do Antigravity incluem as respostas humanas no Clarify; os do Claude, não.'),
    LI('**Node 20 não testado:** as duas suítes foram executadas só no Node 26; a compatibilidade com o Node 20 foi inferida pelas APIs usadas.'),
    LI('**Possível viés:** a condução dos experimentos, os testes independentes, a lista de seis problemas da Tabela {T:gabarito} e o rascunho deste relatório tiveram apoio do Claude Code, a mesma família de modelo de uma das ferramentas comparadas. Para reduzir esse viés, as entradas foram idênticas, os testes independentes seguem só os casos de teste e as decisões do grupo, e tudo pode ser reexecutado com os comandos do Anexo D.'),
  );

  // 11. Reflexão e conclusão
  add(
    H1('11. Reflexão e conclusão'),
    P('O grupo tira seis lições dos experimentos.'),
    P('**As decisões continuam humanas, e a forma da pergunta pesa.** A IA produziu em menos de uma hora o que levaria dias, mas as escolhas que mudaram o comportamento do sistema (coleção, acentos, ordenação, TCC sem arquivo) vieram das respostas do grupo no Clarify. Como a mesma dúvida, perguntada de outro jeito, levou a outra resposta, registrar e revisar as decisões faz parte do processo.'),
    P('**Passar nos próprios testes não basta.** As duas IAs entregaram todos os testes aprovados, mas os testes eram delas. Só a verificação independente mostrou as diferenças: testes escritos a partir dos critérios do grupo e a lista de problemas conhecidos.'),
    P('**A autoavaliação da IA varia.** Uma ferramenta apontou as próprias falhas; a outra declarou conformidade total sem tê-la. A fase Analyze serve como lista do que conferir, não como veredito.'),
    P('**Refinar o prompt compensa, sobretudo na ferramenta mais fraca.** Nos testes funcionais, o prompt refinado transformou uma saída descartável do Gemini, com dados de teste inventados, numa saída aproveitável. No Claude, o ganho foi menor, porque a primeira versão já era cuidadosa. Escrever bem o pedido (estrutura, critério de cobertura, proibição de inventar) é parte do trabalho de engenharia.'),
    P('**SDD também revisa o que já existe.** O maior ganho imediato foi a auditoria do material da Etapa 1: a especificação obriga a ler requisitos e diagramas juntos, e as contradições aparecem.'),
    P('**O gargalo muda de lugar.** Escrever deixa de ser o trabalho principal; ler, decidir e verificar passam a ser. Isso exige do grupo mais entendimento do domínio, e não menos. É o que resume a frase do enunciado: "A IA pode produzir artefatos. O grupo precisa produzir entendimento, decisões e evidências."'),
    P('**O que descobrimos durante o processo que não sabíamos quando começamos?** [GRUPO: responder com as palavras de vocês. Sugestão para editar: "Descobrimos que a nossa própria especificação tinha lacunas que só apareceram quando uma IA tentou implementá-la. A mais clara foi a coleção, que estava nos requisitos e nos casos de uso mas em nenhum diagrama. Descobrimos também que a IA não só responde às nossas perguntas: ela escolhe quais perguntas fazer, e com isso influencia as nossas decisões."]'),
  );

  // Referências
  add(
    H1('Referências'),
    P('BÖCKELER, Birgitta. Understanding Spec-Driven-Development: Kiro, spec-kit, and Tessl. martinfowler.com, out. 2025. Disponível em: https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html. Acesso em: 12 nov. 2026.'),
    P('DELIMARSKY, Den. Spec-driven development with AI: get started with a new open source toolkit. The GitHub Blog, 2 set. 2025. Disponível em: https://github.blog/2025-09-02-spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/. Acesso em: 12 nov. 2026.'),
    P('FISSION-AI. OpenSpec. GitHub, 2026. Disponível em: https://github.com/Fission-AI/OpenSpec. Acesso em: 12 nov. 2026.'),
    P('GITHUB. Spec Kit. GitHub, 2026. Disponível em: https://github.com/github/spec-kit. Acesso em: 12 nov. 2026.'),
    P('KIRO. Specs: concepts. Documentação do Kiro, 2026. Disponível em: https://kiro.dev/docs/specs/concepts. Acesso em: 12 nov. 2026.'),
  );

  // Anexo A
  add(new Paragraph({ children: [new PageBreak()] }), H1('Anexo A - Prompts do experimento de SDD (idênticos para as duas ferramentas)'));
  for (const pr of promptsSdd) add(H2(pr.titulo), ...blocoCodigo(pr.texto), new Paragraph({ spacing: { after: 120 }, children: [] }));

  // Anexo B
  add(H1('Anexo B - Prompts do experimento de testes funcionais (idênticos para as duas ferramentas)'));
  for (const pr of promptsTestes) add(H2(pr.titulo), ...blocoCodigo(pr.texto), new Paragraph({ spacing: { after: 120 }, children: [] }));

  // Anexo C
  add(
    H1('Anexo C - Registro detalhado de cada experiência com IA'),
    P('Cada experiência responde às perguntas do enunciado (seção 9, "Registro detalhado de cada experiência"). As experiências 1 a 5 são da Etapa 1; as demais, da Etapa 2.'),
  );
  const PERGUNTAS = [
    'Atividade realizada', 'Artefato produzido ou revisado', 'Ferramenta / modelo', 'Objetivo do uso da IA', 'Contexto fornecido',
    'Instruções ou prompts (refinar melhorou?)', 'Resultado gerado', 'Uso: integral, parcial ou descartado', 'Modificações feitas pela equipe',
    'Como o resultado foi verificado', 'Benefício percebido', 'Problemas, limitações ou riscos', 'Ficou melhor ou só mais rápido?',
  ];
  const G = '[GRUPO: responder]';
  const experiencias = [
    ['1. Pesquisa de campo (Etapa 1)', [
      'Preparar a pesquisa com alunos do INF sobre a interação com TCCs', 'Formulário da pesquisa de campo', 'Gemini (link na seção 3.3 da Entrega 1)',
      'Reorganizar o rascunho do grupo segundo um modelo de entrevista', 'Rascunho do formulário feito pelo grupo e o objetivo da pesquisa',
      'Pedido inicial e, depois da primeira resposta, um segundo pedido para alinhar ao modelo de entrevista. [GRUPO: o segundo pedido melhorou o resultado?]',
      'Versão reorganizada do formulário', G, G, '[GRUPO: responder] (fato: o formulário recebeu 6 respostas, Figura 1 da Entrega 1)', G, G, G,
    ]],
    ['2. Diagrama de classes (Etapa 1)', [
      'Modelagem do domínio', 'Diagrama de classes', 'Gemini, com revisão no Claude sem contexto prévio (links na seção 3.3 da Entrega 1)',
      'Formar o modelo de negócio em UML a partir da estrutura inicial', 'Estrutura inicial do grupo, requisitos revisados e benchmark',
      '[GRUPO: resumir o pedido; houve refinamento?]', 'Diagrama de classes em UML', G, G,
      'Revisão por uma segunda IA sem contexto e revisão do grupo',
      G, 'Fato posterior: o SDD apontou a ausência da coleção, atributos tipados como texto em vez de lista e a falta de papéis entre TCC e Professor', G,
    ]],
    ['3. Diagramas de pacotes e de sequência (Etapa 1)', [
      'Modelagem da solução', 'Diagramas de pacotes e de sequência do UC01', 'Gemini (mesma conversa da experiência 2)',
      'Gerar os diagramas a partir do diagrama de classes validado', 'O diagrama de classes validado', G, 'Os dois diagramas', G, G, G, G,
      'Fato posterior: o diagrama de sequência tinha 2 dos 6 problemas conhecidos (seta "status" do repositório para o LUME e validarCamposObrigatorios na classe errada)', G,
    ]],
    ['4. Casos de teste CT01 a CT03 (Etapa 1)', [
      'Derivação de testes', 'CT01 a CT03', 'Claude (link na seção 3.3 da Entrega 1)', 'Gerar três casos a partir dos requisitos e critérios de aceitação',
      'Requisitos numerados, user stories e casos de uso', 'Pedido de 3 casos com base no material. [GRUPO: houve refinamento?]', 'Três casos de teste', G, G,
      'Execução no protótipo (Etapa 1)', G, G, G,
    ]],
    ['5. Revisão, CT04 a CT06, atividades do UC04 e protótipo (Etapa 1)', [
      'Revisão da Etapa 1 e construção do protótipo', 'Relatório da Etapa 1, CT04 a CT06, diagrama de atividades do UC04, linha do LUME no benchmark, protótipo React',
      'Claude Code (Claude Opus 5.5), executado no repositório', 'Conferir a aderência ao enunciado, apontar inconsistências e completar os artefatos',
      'Enunciado, relatório da Etapa 1 e repositório',
      'Um pedido inicial com quatro itens e, depois, dois pedidos de conferência. Trecho do pedido inicial: "Adicione no word os 3 casos de teste faltantes [...], seguindo o mesmo modelo que usamos"; "Gere [...] o protótipo de alta fidelidade que o enunciado pede"; "liste todas as suas adições e mudanças para mim". O refinamento veio nas conferências: "realizei as mudanças manualmente no doc original, verifique apenas se está tudo de acordo"',
      'Lista de inconsistências e os artefatos citados',
      'Parcial: o grupo não usou o documento gerado; aplicou as mudanças à mão no documento original e pediu duas conferências', G,
      'Os seis casos de teste executados no protótipo', 'Velocidade e uma revisão completa do documento',
      'O diagrama de atividades gerado abreviou as mensagens do FA01 e do FA02 (achado posterior do SDD)', G,
    ]],
    ['6. SDD com o Claude Code (Etapa 2)', [
      'Spec-Driven Development do UC04', 'spec.md, plan.md, tasks.md, código, testes e analysis.md', 'Claude Code (Claude Opus 5.5), agente com contexto limpo',
      'Testar se uma especificação estruturada orienta plano, tarefas, implementação e testes', 'Pacote de entrada (relatório da Etapa 1, diagramas, constituição e modelos)',
      'Seis prompts fixos (Anexo A), sem refinamento, para manter a comparação justa', '18 FR, 52 tarefas, 53 testes aprovados, 24 achados e 27 inconsistências da Etapa 1',
      'Parcial: o código ficou como evidência do experimento; as decisões e inconsistências foram usadas para corrigir a Etapa 1',
      'Nenhuma no código gerado; 5 respostas no Clarify', '17 testes independentes (16 aprovados), leitura do código e conferência de cada achado',
      'Ambiguidades levantadas cedo e auditoria da Etapa 1',
      'Decidiu sozinho uma regra (acentos); mensagem errada para arquivo ausente; termo curto casa trechos de palavras',
      'Melhor no que foi verificado (rastreabilidade e testes); a verificação, porém, teve de ser humana',
    ]],
    ['7. SDD com o Antigravity (Etapa 2)', [
      'Spec-Driven Development do UC04', 'spec.md, plan.md, tasks.md, código, testes e analysis.md', 'Antigravity, Gemini 4 Argon (raciocínio High), comandos no terminal sem confirmação',
      'O mesmo da experiência 6', 'O mesmo pacote de entrada', 'Os mesmos seis prompts (Anexo A)',
      '10 FR, 25 tarefas, 12 testes aprovados, 5 achados e 9 inconsistências da Etapa 1', 'Parcial, como na experiência 6',
      'Nenhuma no código; 5 respostas no Clarify, só com as opções do modelo', '17 testes independentes (13 aprovados) e leitura do código',
      'Rapidez; perguntas do Clarify bem estruturadas, uma por vez',
      'Análise final otimista ("0 violações"); simulação de falha só aparente; sem tratamento de acentos', 'Mais rápido; a qualidade ficou abaixo da execução do Claude nos testes independentes',
    ]],
    ['8. Testes funcionais com o Claude Code (Etapa 2)', TF && TF.exp8 ? TF.exp8 : PERGUNTAS.map(() => '[PENDENTE]')],
    ['9. Testes funcionais com o Antigravity (Etapa 2)', TF && TF.exp9 ? TF.exp9 : PERGUNTAS.map(() => '[PENDENTE]')],
    ['10. Condução, verificação e redação (Etapa 2)', [
      'Orquestrar os experimentos, verificar as saídas e redigir', 'Pacotes de entrada, prompts, testes independentes, figura e texto da arquitetura, rascunho deste relatório',
      'Claude Code (Claude Opus 5.5), em sessão separada dos agentes avaliados', 'Executar o trabalho repetitivo e medir os resultados com o mesmo critério nas duas ferramentas',
      'Enunciado, relatório da Etapa 1, protótipo e as saídas dos experimentos', 'Instruções do grupo em conversa, ao longo de várias sessões',
      'Os arquivos da pasta etapa2/ e este rascunho', 'Parcial: o texto é revisado e editado pelo grupo [GRUPO: confirmar após a revisão]', G,
      'Os testes independentes rodam com um comando; os números do relatório vêm dos arquivos dos experimentos', 'Tempo; mesmo critério de comparação para as duas ferramentas',
      'Viés possível a favor do Claude (seção 10.3)', '[GRUPO: responder após a revisão]',
    ]],
  ];
  for (const [titulo, respostas] of experiencias) {
    add(H2(`Experiência ${titulo}`), tabela(['Pergunta', 'Resposta'], PERGUNTAS.map((p, i) => [p, respostas[i] ?? G]), [3, 7]), new Paragraph({ spacing: { after: 120 }, children: [] }));
  }

  // Anexo D
  add(
    H1('Anexo D - Onde estão os artefatos e como reproduzir'),
    P('Todos os arquivos estão na pasta `etapa2/` do repositório https://github.com/extreme500/subsTCCk:'),
    LI('`pacote-entrada/`, `prompts-sdd.md`, `decisoes-clarify.md` e `registro-experimentos.md`: o experimento de SDD;'),
    LI('`claude-code/` e `antigravity/`: as saídas de cada ferramenta no SDD (`specs/001-buscar-filtrar-tccs/`, `src/`, `tests/`);'),
    LI('`oraculo/`: os 17 testes independentes e os adaptadores;'),
    LI('`testes-funcionais/`: o experimento de classes de equivalência e valor limite (pacote, prompts e saídas); os testes automáticos da lógica do protótipo estão em `tests/testes-funcionais.test.js`, na raiz do repositório (`node --test tests/`);'),
    LI('`relatorio/`: este rascunho, as figuras 1 e 2 e os scripts que os geram.'),
    P('Para reproduzir, com Node.js 20 ou superior e sem `npm install`: `node --test` dentro de `claude-code/` ou de `antigravity/`, e `IMPL=claude node --test oraculo/` ou `IMPL=antigravity node --test oraculo/` dentro de `etapa2/`.'),
  );
  return c;
}

// duas passadas: a primeira descobre a ordem das tabelas, a segunda usa os números
construir();
numeros = Object.fromEntries(ordem.map((k, i) => [k, i + 1]));
ordem = [];
const conteudo = construir();

const listas = [];
for (let i = 1; i <= listaNum; i++) listas.push({ reference: `num${i}`, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] });

const doc = new Document({
  creator: 'Grupo subsTCCk',
  title: 'Entrega 2 - Trabalho Prático - Engenharia de Software',
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 }, paragraph: { spacing: { line: 276 } } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: TNR, size: 24, bold: true }, paragraph: { spacing: { before: 280, after: 120 }, keepNext: true, keepLines: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: TNR, size: 24, bold: true }, paragraph: { spacing: { before: 200, after: 100 }, keepNext: true, keepLines: true, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'marcadores', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] },
      ...listas,
    ],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 567, bottom: 567, left: 567, right: 567, header: 300, footer: 300 } } },
    headers: { default: new Header({ children: [new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: LARGURA }], children: [new TextRun({ text: 'INF01127 - Engenharia de Software N', size: 16, color: '666666' }), new TextRun({ text: '\tTrabalho Prático - Engenharia de Software', size: 16, color: '666666' })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], size: 18 })] })] }) },
    children: conteudo,
  }],
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(SAIDA, buf); console.log('gerado:', SAIDA, buf.length, 'bytes'); });
