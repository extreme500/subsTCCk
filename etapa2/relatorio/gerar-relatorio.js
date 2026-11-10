// Gera o rascunho do relatório da Etapa 2 no formato da Entrega 1.
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

// ---------- texto com marcação mínima: **negrito**, `código`, [CONFIRMAR ...] ----------
function runs(texto, base = {}) {
  const partes = texto.split(/(\*\*[^*]+\*\*|`[^`]+`|\[CONFIRMAR[^\]]*\])/g).filter((p) => p !== '');
  return partes.map((p) => {
    if (p.startsWith('**')) return new TextRun({ ...base, text: p.slice(2, -2), bold: true });
    if (p.startsWith('`')) return new TextRun({ ...base, text: p.slice(1, -1), font: 'Consolas', size: base.size ? base.size - 2 : 20 });
    if (p.startsWith('[CONFIRMAR')) return new TextRun({ ...base, text: p, bold: true, shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'FFFF00' } });
    return new TextRun({ ...base, text: p });
  });
}
const P = (texto, opts = {}) =>
  new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 120 }, ...opts, children: runs(texto) });
const H1 = (texto) => new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.JUSTIFIED, children: [new TextRun(texto)] });
const H2 = (texto) => new Paragraph({ heading: HeadingLevel.HEADING_2, alignment: AlignmentType.JUSTIFIED, children: [new TextRun(texto)] });
const LI = (texto, nivel = 0) =>
  new Paragraph({ numbering: { reference: 'marcadores', level: nivel }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 60 }, children: runs(texto) });
const LN = (texto, ref) =>
  new Paragraph({ numbering: { reference: ref, level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 60 }, children: runs(texto) });
const LEGENDA = (texto) =>
  new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 160, after: 80 }, children: [new TextRun({ text: texto, font: TNR, bold: true, size: 24 })] });
const FONTE = (texto) =>
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 200 }, children: [new TextRun({ text: texto, font: TNR, size: 22 })] });

// ---------- tabelas ----------
const borda = { style: BorderStyle.SINGLE, size: 4, color: 'A6A6A6' };
const bordas = { top: borda, bottom: borda, left: borda, right: borda };
function tabela(cabecalho, linhas, pesos) {
  const soma = pesos.reduce((a, b) => a + b, 0);
  const larguras = pesos.map((w) => Math.floor((w / soma) * LARGURA));
  larguras[larguras.length - 1] += LARGURA - larguras.reduce((a, b) => a + b, 0);
  const celula = (texto, i, cab) =>
    new TableCell({
      borders: bordas,
      width: { size: larguras[i], type: WidthType.DXA },
      shading: cab ? { fill: 'D9E2F3', type: ShadingType.CLEAR, color: 'auto' } : undefined,
      margins: { top: 60, bottom: 60, left: 90, right: 90 },
      children: String(texto).split('\n').map((linha) =>
        new Paragraph({ spacing: { after: 0, line: 240 }, children: runs(linha, { size: 18, bold: cab || undefined }) })),
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

// ---------- prompts (anexo), lidos do arquivo para não haver erro de transcrição ----------
const promptsMd = fs.readFileSync(path.join(ETAPA2, 'prompts-sdd.md'), 'utf8').replace(/\r/g, '');
const prompts = [...promptsMd.matchAll(/## (Prompt \d - [A-Z /]+)\n\n```text\n([\s\S]*?)```/g)].map((m) => ({ titulo: m[1], texto: m[2].trim() }));
if (prompts.length !== 6) throw new Error(`esperava 6 prompts, achei ${prompts.length}`);
const blocoCodigo = (texto) =>
  texto.split('\n').map((linha) =>
    new Paragraph({ spacing: { after: 0, line: 240 }, children: [new TextRun({ text: linha === '' ? ' ' : linha, font: 'Consolas', size: 16 })] }));

const imagem = fs.readFileSync(path.join(ETAPA2, 'relatorio', 'figura1-arquitetura.png'));

// =====================================================================================
const conteudo = [];
const add = (...x) => conteudo.push(...x);

// Cabeçalho do documento (igual ao da Entrega 1)
add(
  new Paragraph({ spacing: { after: 0, line: 240 }, children: [new TextRun({ text: 'Tornar TCCs de computação visíveis, relacionados e úteis', font: TNR, bold: true, size: 24 })] }),
  new Paragraph({ spacing: { after: 0, line: 240 }, children: [new TextRun({ text: 'Entrega 2: arquitetura, SDD e GenAI, comparação, decisões e reflexão', font: TNR, size: 24 })] }),
  new Paragraph({ spacing: { after: 0, line: 240 }, children: [new TextRun({ text: 'Andriele Joras dos Santos (594861), Gabriel Pieruccini Knopp (594975), Vitor Feijó (588403)', font: TNR, size: 24 })] }),
  new Paragraph({ spacing: { after: 240, line: 240 }, children: [new TextRun({ text: 'Profª Leticia Santos Machado', font: TNR, size: 24 })] }),
);

// 1. Escopo
add(
  H1('1. Escopo da Etapa 2'),
  P('Esta entrega cobre a etapa 2 do enunciado: arquitetura, SDD e GenAI, comparação, decisões e reflexão. Ela parte da versão própria do grupo, produzida na Etapa 1: requisitos, user stories, casos de uso, diagramas UML, casos de teste e o protótipo de alta fidelidade em React.'),
  P('A IA foi usada sobre essa versão, e não no lugar dela. O experimento central aplica Spec-Driven Development (SDD) a uma funcionalidade já especificada pelo grupo, o **RF#02 / UC04 - Buscar e Filtrar TCCs** (US#04; CT03, CT05 e CT06). O experimento foi feito com duas ferramentas, o **Claude Code** e o **Antigravity** (modelo Gemini), com as mesmas entradas e os mesmos prompts. Os resultados são comparados entre si e com a solução do grupo.'),
  P('O UC04 foi escolhido por três motivos. Ele combina vários filtros e tem dois fluxos alternativos (FA01, busca sem resultado; FA02, falha no download). Tem três casos de teste prontos, o que permite verificar o resultado de forma automática. E o protótipo já implementa a busca, o que dá uma referência para comparar.'),
);

// 2. Arquitetura
add(
  H1('2. Arquitetura e design'),
  H2('2.1. Visão geral'),
  P('A arquitetura proposta tem um cliente web e um servidor de aplicação. O cliente é uma aplicação de página única (SPA), da qual o protótipo da Etapa 1 é a primeira versão. Ele se comunica por HTTPS, com dados em JSON, com um servidor monolítico organizado nas camadas do diagrama de pacotes: controller, service, repository, model e dto.'),
  P('Os metadados ficam em um banco relacional, e os arquivos dos TCCs e as imagens ficam em um armazenamento de arquivos. Há dois sistemas externos: o login institucional da UFRGS e o repositório LUME (Figura 1).'),
  LEGENDA('Figura 1 - Arquitetura proposta para a plataforma'),
  new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, children: [new ImageRun({ type: 'png', data: imagem, transformation: { width: 690, height: 414 } })] }),
  FONTE('Fonte: elaborado pelo grupo.'),
  H2('2.2. Componentes e responsabilidades'),
  P('A Tabela 1 resume o papel de cada componente e os requisitos que ele atende.'),
  LEGENDA('Tabela 1 - Componentes e responsabilidades'),
  tabela(['Componente', 'Responsabilidade', 'Atende'], [
    ['Cliente web (SPA React)', 'Telas Feed, Busca, Detalhe, Formulário, Perfil e Entrar. Faz validações imediatas (limite de 5 tags e 3 imagens) para dar retorno rápido, sem substituir a validação do servidor.', 'RF#01, RF#02; UC01, UC04'],
    ['controller (TccController)', 'Expõe a API. Converte cada requisição em FiltroBusca ou DTO e devolve as mensagens literais dos casos de uso (FA01, FA02). Não contém regra de negócio.', 'UC01, UC04'],
    ['service (TccService, ValidadorLumeService)', 'Regras de negócio: só TCC publicado aparece; os filtros são combinados com E; rascunho e publicação; campos obrigatórios. O ValidadorLumeService verifica domínio e acesso do link do LUME.', 'RF#01, RF#02; UC01, UC03, UC04'],
    ['ArmazenamentoArquivos (interface)', 'Transfere o arquivo do TCC. A transferência é tudo ou nada: em caso de falha, nada parcial chega ao usuário.', 'UC04 (FA02); CT06'],
    ['repository (TccRepository, TagRepository)', 'Consulta e grava os dados. Os testes usam uma implementação em memória e a produção usaria SQL, com a mesma interface.', 'RF#01, RF#02'],
    ['model e dto', 'Entidades do diagrama de classes (TCC, Usuario, Tag, Area, Midia, ArquivoTcc) e objetos de transferência (FiltroBusca, TccDTO, FeedDTO).', 'Todos'],
    ['Banco de dados relacional', 'TCC, usuários (Aluno Formando, Professor), tags, áreas, mídias e metadados do arquivo.', 'RF#01, RF#02'],
    ['Armazenamento de arquivos', 'Arquivos PDF, DOCX e EPUB e as imagens. O banco guarda só o caminho e o formato.', 'RF#01, RF#02'],
    ['Login institucional (externo)', 'Autentica autores e professores. Visitantes navegam sem login, só com leitura.', 'Stakeholders (2.1)'],
    ['LUME (externo)', 'Fonte oficial dos TCCs. A plataforma não o substitui: guarda e valida o link permanente.', 'UC03; benchmark'],
  ], [2.2, 5.6, 2.2]),
  FONTE('Fonte: elaborado pelo grupo.'),
  H2('2.3. Comunicação'),
  P('O cliente chama uma API REST. Para o UC04, as chamadas seriam:'),
  LI('`GET /tccs?termo=&ano=&autor=&orientador=&tags=&colecao=`, para a busca;'),
  LI('`GET /tccs/{id}`, para os detalhes;'),
  LI('`GET /tccs/{id}/arquivo`, para o download.'),
  P('Cadastro e edição (UC01, UC02) usam `POST /tccs` e `PUT /tccs/{id}` e exigem autenticação. O feed usa `GET /feed`.'),
  P('Dentro do servidor, as chamadas descem de forma síncrona: controller → service → repository, como no diagrama de pacotes. Uma camada nunca chama a camada de cima.'),
  P('Os sistemas externos (LUME, armazenamento) ficam atrás de interfaces. Assim os testes podem trocá-los por versões simuladas, por exemplo para simular o LUME fora do ar (CT02) ou a queda de conexão no meio do download (CT06).'),
  H2('2.4. Persistência e dados'),
  P('O banco relacional segue o diagrama de classes, com duas mudanças que o experimento mostrou serem necessárias:'),
  LI('um atributo **coleção** (curso de origem) no TCC e no FiltroBusca (seção 7);'),
  LI('campos de busca normalizados, sem acentos e em minúsculas, para que "deteccao" encontre "Detecção".'),
  P('Os arquivos ficam fora do banco. O status (RASCUNHO ou PUBLICADO) é uma coluna do TCC e todas as consultas públicas filtram por PUBLICADO.'),
  P('Os protótipos usam formas mais simples de guardar os dados:'),
  LI('o protótipo React guarda o estado no `localStorage` do navegador, o que basta para demonstração;'),
  LI('a implementação feita no SDD usa um repositório em memória com os TCCs A a E do CT03.'),
  H2('2.5. Decisões técnicas'),
  LEGENDA('Tabela 2 - Decisões técnicas'),
  tabela(['Decisão', 'Motivo', 'Alternativa descartada'], [
    ['Monólito em camadas', 'O escopo é pequeno, a equipe tem 3 pessoas e o diagrama de pacotes já define as camadas.', 'Microsserviços: custo de operação sem ganho neste escopo.'],
    ['SPA + API REST', 'O protótipo já é uma SPA. A API separa interface e regra, e permitiria um aplicativo móvel depois.', 'Páginas geradas no servidor: exigiria reescrever o protótipo.'],
    ['Banco relacional', 'Dados estruturados e relacionados (TCC, Tag, Área, orientação) e filtros combinados.', 'Banco de documentos: consultas por relação ficam mais difíceis.'],
    ['Arquivos fora do banco, atrás de interface', 'Arquivos grandes; a interface permite simular falha de transferência (CT06).', 'Guardar o arquivo no banco.'],
    ['Busca em campos normalizados, termo por palavra inteira', 'Decisão 2 do grupo (sem acentos e maiúsculas) e o problema do termo curto "IA", que trazia "anomalias" (seção 6.2).', 'Busca por qualquer trecho, que gera ruído; motor de busca dedicado, excessivo para o volume do INF.'],
    ['LUME como fonte oficial', 'Resultado do benchmark: a plataforma divulga e relaciona, não cataloga.', 'Copiar o acervo do LUME.'],
    ['Download tudo ou nada', 'FA02 e CT06: nenhum arquivo incompleto pode ser salvo.', 'Repassar os bytes conforme chegam, sem verificar o fim da transferência.'],
  ], [2.4, 4.4, 3.2]),
  FONTE('Fonte: elaborado pelo grupo.'),
  H2('2.6. Relação com o protótipo e com a implementação do SDD'),
  P('O protótipo é o cliente da Figura 1, ainda sem servidor: a função `buscar()` de `src/lib.js` faz no navegador o que a camada service fará no servidor.'),
  P('As implementações geradas no experimento de SDD são o núcleo do servidor para o UC04 (controller, service, repository, model e dto), sem a camada HTTP. Nelas, a API pública do TccController faz o papel da interface. As duas partes seguem os mesmos casos de teste, o que permite comparar o comportamento do protótipo com o das implementações geradas (seção 6.3).'),
);

// 3. Processo
add(
  H1('3. Processo de Engenharia de Software utilizado'),
  P('Na **Etapa 1**, o grupo seguiu um processo iterativo e manual: problema, pesquisa de campo e benchmark, requisitos, user stories, casos de uso, diagramas UML, casos de teste e protótipo. A IA foi usada em tarefas pontuais, e cada saída foi revisada pelo grupo (seção 3.3 da Entrega 1).'),
  P('Na **Etapa 2**, o grupo aplicou SDD com IA sobre esse material, em cinco passos:'),
  LN('O grupo montou um pacote de entrada com o material da Etapa 1, sem as seções de protótipo e de GenAI.', 'passos'),
  LN('O grupo escreveu uma constituição, com os princípios que valem para todas as fases, e modelos de documento.', 'passos'),
  LN('O grupo escreveu um prompt por fase.', 'passos'),
  LN('Cada IA executou as fases em ordem, parando ao fim de cada uma; o grupo respondeu às perguntas da fase Clarify.', 'passos'),
  LN('O grupo verificou os resultados com testes próprios e comparou as duas ferramentas.', 'passos'),
  P('A Tabela 3 mostra a que parte do processo clássico cada fase do SDD corresponde.'),
  LEGENDA('Tabela 3 - Processo da Etapa 1 e fluxo de SDD apoiado por IA'),
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

// 4. SDD
add(
  H1('4. SDD aplicado ao RF#02 / UC04'),
  H2('4.1. Abordagem e preparação'),
  P('O grupo adaptou as seis fases do GitHub Spec Kit (Specify, Clarify, Plan, Tasks, Implement e Analyze), sem usar a ferramenta de linha de comando dele. Em vez disso, escreveu modelos simplificados em português e um prompt por fase (Anexo A). A constituição tem seis princípios:'),
  LI('**I. Rastreabilidade:** todo requisito, tarefa e teste indica a origem no relatório.'),
  LI('**II. Testes primeiro:** os testes vêm dos casos de teste e são escritos antes do código.'),
  LI('**III. Fidelidade ao domínio:** nomes dos diagramas, mensagens literais e divergências registradas.'),
  LI('**IV. Camadas:** as dependências externas ficam atrás de interfaces.'),
  LI('**V. Simplicidade:** sem dependências externas, sem interface gráfica, persistência em memória.'),
  LI('**VI. Ambiguidade explícita:** o que não está decidido é marcado e perguntado.'),
  P('Na fase Plan, o grupo fixou as restrições técnicas: JavaScript em Node.js 20 ou superior, sem dependências externas, testes com `node --test`, camadas e nomes dos diagramas, dados iniciais com os TCCs A a E do CT03, e um ponto de entrada `src/app.js` que permite injetar dependências. Essas restrições tornam as duas saídas comparáveis e executáveis com o mesmo comando.'),
  P('Para a comparação ser justa:'),
  LI('as duas ferramentas receberam a mesma pasta e os mesmos seis prompts, em uma conversa cada;'),
  LI('nenhuma teve acesso ao protótipo;'),
  LI('no Claude Code, o agente rodou com contexto limpo, isolado na própria pasta.'),
  H2('4.2. Resultado por fase'),
  LEGENDA('Tabela 4 - Resultado de cada fase nas duas ferramentas'),
  tabela(['Fase', 'Claude Code (Claude Opus 5.5)', 'Antigravity (Gemini 4 Argon High)'], [
    ['Specify', '3 histórias, 18 requisitos funcionais (FR), 5 pontos marcados para esclarecer. ~3 min', '3 histórias, 10 FR, 5 pontos marcados. ~4 min'],
    ['Clarify', '5 perguntas, entregues de uma vez (limitação do ambiente). ~2 min, sem contar o tempo das respostas', '5 perguntas, uma por vez, com opções e recomendação. ~14,5 min, incluindo as respostas'],
    ['Plan', '12 divergências com os diagramas registradas; falha simulada no meio da transferência. ~6,5 min', '6 divergências registradas; falha simulada por uma chave liga/desliga. ~3,5 min'],
    ['Tasks', '52 tarefas. ~9 min', '25 tarefas. ~2 min'],
    ['Implement', '53 testes, 53 aprovados. Antes do código de cada história falharam 20, 9 e 9 testes. 10 desvios registrados. ~17 min', '12 testes, 12 aprovados. Antes do código falharam 7, 2 e 3. Declarou "nenhum desvio". ~8,5 min'],
    ['Analyze', '24 achados (1 alto, 8 médios, 15 baixos); 100% dos FR com teste; 27 inconsistências no material da Etapa 1. ~22 min', '5 achados (todos baixos); 100% dos FR com teste; 0 violações da constituição declaradas; 9 inconsistências no material da Etapa 1. ~2 min'],
  ], [1.3, 4.35, 4.35]),
  FONTE('Fonte: pastas specs/001-buscar-filtrar-tccs/ de cada ferramenta e registro-experimentos.md. Tempos aproximados.'),
  H2('4.3. O que cada fase trouxe'),
  P('**Specify.** As duas ferramentas transformaram o UC04 e os casos de teste em requisitos com origem indicada. As duas marcaram como principal dúvida o filtro "Coleção". Isso indica que essa é uma lacuna real do material da Etapa 1, e não uma impressão de uma ferramenta só.'),
  P('**Clarify.** Foi a fase mais útil. Ela obrigou o grupo a decidir o que a Etapa 1 deixava implícito: o que é uma coleção, se a busca ignora acentos, o que acontece com um TCC sem arquivo, o que a busca vazia retorna e em que ordem vêm os resultados.'),
  P('Também foi a fase em que a IA mais influenciou o resultado, porque as respostas dependem das perguntas e opções que ela oferece. O Claude não perguntou sobre acentos nos filtros de autor e orientador e decidiu sozinho. O Gemini não ofereceu nenhuma opção sobre acentos.'),
  P('**Plan.** Mostrou divergências entre a especificação e os diagramas. Por exemplo, o diagrama de classes diz que `buscarTccs` devolve só uma lista, mas o FA01 exige também uma mensagem; e as tags aparecem como texto simples onde deveriam ser uma lista.'),
  P('**Tasks.** As duas ferramentas puseram os testes antes do código. O Claude dividiu o trabalho em tarefas menores (52 contra 25).'),
  P('**Implement.** As duas entregaram todos os testes aprovados, mas os testes eram delas mesmas. Os testes independentes da seção 6.2 mostraram diferenças que esses testes não pegavam.'),
  P('**Analyze.** O Claude apontou falhas no próprio código (achados A04, A06 e A07, seção 6.2). O Gemini declarou zero violações e nenhum desvio, o que não se confirmou na inspeção (seção 5). A autoavaliação da IA precisa ser conferida.'),
  H2('4.4. Benefícios, limitações e impacto no processo'),
  P('**Benefícios:**'),
  LI('rastreabilidade de requisito a tarefa e a teste sem trabalho manual;'),
  LI('ambiguidades levantadas antes do código;'),
  LI('uma auditoria do material da Etapa 1 (27 e 9 inconsistências);'),
  LI('uma implementação executável e testada em menos de uma hora de máquina.'),
  P('**Limitações:**'),
  LI('a especificação só é tão boa quanto as respostas do Clarify;'),
  LI('o volume de texto a revisar é grande (cada plano tem cerca de 300 linhas);'),
  LI('a IA escreve os testes e o código que eles verificam, então passar nos próprios testes prova pouco;'),
  LI('a profundidade varia muito entre ferramentas com as mesmas entradas.'),
  P('**Impacto no processo:** o trabalho humano deixou de ser escrever os artefatos e passou a ser decidir (Clarify) e verificar (testes independentes, conferência dos achados).'),
);

// 5. Experimentos GenAI
add(
  H1('5. Experimentos com GenAI'),
  H2('5.1. Experimentos da Etapa 1'),
  P('Na Etapa 1 o grupo já tinha usado três ferramentas: Gemini, Claude (chat) e Claude Code (seção 3.3 da Entrega 1). Foram cinco usos:'),
  LN('formulário da pesquisa de campo (Gemini);', 'e1'),
  LN('diagrama de classes, gerado no Gemini e revisado sem contexto prévio no Claude;', 'e1'),
  LN('diagramas de pacotes e de sequência (Gemini);', 'e1'),
  LN('casos de teste CT01 a CT03 (Claude);', 'e1'),
  LN('revisão do relatório, CT04 a CT06, diagrama de atividades do UC04 e protótipo em React (Claude Code).', 'e1'),
  P('Em todos, o grupo conferiu a saída contra os requisitos antes de usar.'),
  H2('5.2. Experimentos de SDD (Etapa 2)'),
  P('A Tabela 5 registra os dois experimentos de SDD com os campos pedidos na seção 9 do enunciado. O registro completo, com horários e as perguntas de cada ferramenta, está em `etapa2/registro-experimentos.md`.'),
  LEGENDA('Tabela 5 - Registro dos experimentos de SDD'),
  tabela(['Campo', 'Claude Code', 'Antigravity'], [
    ['Ferramenta / modelo', 'Claude Code, modelo Claude Opus 5.5 (Anthropic)', 'Antigravity (Google), modelo Gemini 4 Argon, com raciocínio High. Modo do agente na configuração padrão; o agente executava comandos no terminal sem pedir confirmação.'],
    ['Prompt / estratégia', 'Os 6 prompts do Anexo A, um por fase, com parada ao fim de cada uma. Agente com contexto limpo. As 5 perguntas do Clarify vieram juntas e foram respondidas pelo grupo.', 'Os mesmos 6 prompts, na mesma conversa. As 5 perguntas do Clarify vieram uma por vez e foram respondidas pelo grupo.'],
    ['Artefato / contexto', 'Pacote de entrada: relatório da Etapa 1 (seções 1 a 3.2.3), 6 diagramas em imagem e em transcrição textual, constituição e modelos', 'O mesmo pacote'],
    ['Resultado', 'Especificação (18 FR), plano, 52 tarefas, ~1.430 linhas de JavaScript, 53 testes aprovados e uma análise com 24 achados', 'Especificação (10 FR), plano, 25 tarefas, ~1.040 linhas de JavaScript, 12 testes aprovados e uma análise com 5 achados'],
    ['Aceito', 'Camadas e nomes dos diagramas; mensagens literais; falha simulada no meio da transferência; 4 das 5 recomendações do Clarify', 'Camadas e nomes; mensagens literais; 3 das 5 recomendações do Clarify; registro das mensagens divergentes entre texto e diagrama'],
    ['Alterado', 'Nada no código gerado: o experimento mede a saída como veio. As correções viraram decisões para a versão final (seções 6 e 7).', 'Idem'],
    ['Investigado', 'Achados A04, A06 e A07, confirmados pelos testes independentes e pela leitura do código', 'As afirmações "0 violações" e "nenhum desvio". A simulação de falha é só uma chave liga/desliga, e o "buffer parcial" é descartado antes de ser usado.'],
    ['Rejeitado', 'Recomendação "Coleção = área temática (via tags)"', 'Recomendações sobre a ordenação (ordem de cadastro) e sobre o escopo dos detalhes (sem trabalhos conexos)'],
    ['Justificativa', 'Seção 7', 'Seção 7'],
    ['Omissões', 'Não perguntou sobre acentos nos filtros de autor e orientador nem sobre o coorientador; registrou-os como premissas.', 'Não ofereceu opção sobre acentos. Não detectou 4 dos 6 problemas conhecidos da Etapa 1. Não testou DOCX e EPUB (ele mesmo apontou).'],
    ['Contradições', 'Decidiu sozinho que autor e orientador diferenciam acentos, contra o princípio VI (o próprio agente apontou, achado A07).', 'Declarou conformidade total, mas o controller guarda estado de tela (página aberta, arquivos "salvos") e o armazenamento está no pacote service, fora dos diagramas.'],
    ['Alucinações', 'Nenhuma identificada', 'Nenhuma identificada'],
    ['Erros', 'Arquivo ausente gera a mensagem "verifique a sua conexão" (A04); termo curto casa trechos de palavras (A06)', 'Termo curto casa trechos de palavras; ano inválido é ignorado em silêncio; "deteccao" não encontra "Detecção"'],
    ['Boas sugestões', 'Coletar a coleção no cadastro (A01); separar "arquivo ausente" de "falha de conexão" (A04); termo por palavra inteira (A06)', 'Mensagem própria para TCC sem arquivo, com o link do LUME; uniformizar as mensagens do diagrama de atividades e do UC04; oferecer a ordenação por recência'],
  ], [1.6, 4.2, 4.2]),
  FONTE('Fonte: registro-experimentos.md e artefatos de cada ferramenta.'),
);

// 6. Comparação
add(
  H1('6. Comparação'),
  H2('6.1. Entre as IAs'),
  LEGENDA('Tabela 6 - Métricas das duas execuções'),
  tabela(['Métrica', 'Claude Code', 'Antigravity'], [
    ['Requisitos funcionais na especificação', '18', '10'],
    ['Divergências com os diagramas registradas no plano', '12', '6'],
    ['Tarefas', '52', '25'],
    ['Testes próprios (aprovados)', '53 (53)', '12 (12)'],
    ['Linhas de JavaScript (código + testes)', '~1.430', '~1.040'],
    ['Tempo total aproximado', '~60 min', '~35 min (inclui as respostas do Clarify)'],
    ['Achados na análise final (alto / médio / baixo)', '24 (1 / 8 / 15)', '5 (0 / 0 / 5)'],
    ['Inconsistências apontadas no material da Etapa 1', '27', '9'],
    ['Problemas conhecidos da Etapa 1 encontrados (Tabela 7)', '5 de 6', '2 de 6'],
    ['Testes independentes aprovados (Tabela 8)', '16 de 17', '13 de 17'],
  ], [5, 2.5, 2.5]),
  FONTE('Fonte: elaborado pelo grupo.'),
  P('O Claude Code foi mais minucioso e mais crítico consigo mesmo, e levou quase o dobro do tempo. O Gemini foi mais rápido e mais enxuto, mas a análise final dele foi otimista demais.'),
  P('Nos casos de teste da Etapa 1, as duas implementações empataram (5 de 5, Tabela 8). Esses casos sozinhos não distinguem as ferramentas: as diferenças só aparecem nas decisões e nos casos-limite.'),
  P('Antes do experimento, a revisão da Etapa 1 (item 5 da seção 3.3 da Entrega 1) tinha apontado seis problemas no material. Eles serviram de gabarito para medir a fase Analyze (Tabela 7).'),
  LEGENDA('Tabela 7 - Problemas conhecidos da Etapa 1 encontrados por cada IA'),
  tabela(['Problema no material da Etapa 1', 'Claude Code', 'Antigravity'], [
    ['"Coleção" é filtro no RF#02 e no UC04, mas não é atributo nem classe nos diagramas', 'Sim', 'Sim'],
    ['Diagrama de sequência do UC01: seta "status" saindo do TccRepository para o LUME, sem chamada anterior', 'Sim', 'Sim'],
    ['Diagrama de sequência do UC01: validarCamposObrigatorios() como auto-chamada do TccService, mas o método é da classe TCC', 'Sim', 'Não'],
    ['Visitante é ator do UC04, mas não aparece no diagrama de casos de uso nem no de classes', 'Sim', 'Não'],
    ['O mesmo ator com nomes diferentes ("Aluno Graduando" no diagrama de atividades, "Aluno Formando" no texto)', 'Sim', 'Não'],
    ['Numeração das user stories salta de US#01 para US#04', 'Não', 'Não'],
  ], [6, 2, 2]),
  FONTE('Fonte: elaborado pelo grupo a partir dos arquivos analysis.md.'),
  H2('6.2. Testes independentes nas duas implementações'),
  P('Depois das seis fases, o grupo escreveu 17 testes de caixa-preta a partir dos casos de teste e das decisões do Clarify (`etapa2/oraculo/`). Os mesmos testes rodaram nas duas implementações por meio de adaptadores (Tabela 8).'),
  LEGENDA('Tabela 8 - Testes independentes'),
  tabela(['Grupo de testes', 'Claude Code', 'Antigravity'], [
    ['Casos de teste da Etapa 1 (CT03, CT03 variação, CT05, CT05 variação, CT06)', '5/5', '5/5'],
    ['Decisões do grupo no Clarify (Coleção, maiúsculas, acentos, campos do termo, tags com E, TCC sem arquivo, busca vazia)', '8/8', '6/8 (Coleção e acentos)'],
    ['Robustez, não decidida pelo grupo (rascunho bloqueado, autor parcial, termo curto, ano inválido)', '3/4 (termo "IA")', '2/4 (termo "IA"; ano "abc" ignorado)'],
    ['Total', '16/17', '13/17'],
  ], [6, 2, 2]),
  FONTE('Fonte: execução de IMPL=claude node --test oraculo/ e IMPL=antigravity node --test oraculo/.'),
  P('As duas falhas do Antigravity nas decisões do grupo (Coleção e acentos) vêm das respostas dadas no Clarify dele (seção 7), não de erro de programação.'),
  P('O termo curto "IA" falhou nas duas: a busca por trecho encontra "IA" dentro de "anomal**ia**s" e "estratég**ia**s" e traz TCCs que não tratam de inteligência artificial. O Claude apontou esse problema na própria análise (A06); o Gemini, não.'),
  P('Há um limite nesta comparação: no Antigravity, a falha do CT06 só pode ser simulada com a conexão já caída antes de começar. A interrupção no meio da transferência, que o CT06 descreve, não pode ser reproduzida nessa implementação.'),
  H2('6.3. Solução do grupo e resultados das IAs'),
  P('A Tabela 9 compara a regra de busca do protótipo (`src/lib.js`), escrita na Etapa 1, com as regras das duas implementações geradas.'),
  LEGENDA('Tabela 9 - Regras de busca: protótipo do grupo e implementações geradas'),
  tabela(['Regra', 'Protótipo (grupo)', 'Claude Code', 'Antigravity'], [
    ['Só TCCs publicados', 'Sim', 'Sim', 'Sim'],
    ['Campos do termo livre', 'Título, resumo, autor, orientador, coorientador, tags', 'Título, resumo, autor, orientador, tags', 'Igual ao protótipo'],
    ['Acentos', 'Ignora em tudo', 'Ignora no termo, não em autor e orientador', 'Não ignora'],
    ['Filtro de orientador', 'Igualdade (vem de uma lista de seleção)', 'Trecho, sem diferenciar maiúsculas', 'Trecho, sem diferenciar maiúsculas'],
    ['Filtro de coleção', 'Curso (lista de seleção)', 'Curso', 'Não existe'],
    ['Várias tags', 'Todas (E)', 'Todas (E)', 'Todas (E)'],
    ['Ordenação', 'Mais recente primeiro', 'Mais recente primeiro', 'Mais recente primeiro'],
    ['TCC sem arquivo', 'Botão "Acessar texto no LUME"', 'Não oferece o download', 'Recusa o download com mensagem e link do LUME'],
    ['Falha no download', 'Mensagem do FA02 (simulada)', 'Mensagem do FA02; nada parcial é entregue', 'Mensagem do FA02; nada parcial é entregue'],
    ['Testes automatizados', 'Nenhum (CTs executados à mão)', '53', '12'],
  ], [2.2, 2.8, 2.5, 2.5]),
  FONTE('Fonte: elaborado pelo grupo.'),
  P('O protótipo do grupo já tratava "Coleção" como curso, ignorava acentos e incluía o coorientador no termo livre. Nesses pontos ele estava mais próximo das decisões do grupo do que as duas IAs.'),
  P('As IAs, por outro lado, trouxeram o que o protótipo não tinha: testes automatizados, separação em camadas e um registro explícito de cada decisão e divergência.'),
);

// 7. Decisões humanas
add(
  H1('7. Decisões humanas'),
  P('A Tabela 10 registra o que o grupo aceitou, modificou ou rejeitou do que as IAs propuseram, e por quê.'),
  LEGENDA('Tabela 10 - Decisões do grupo sobre as propostas das IAs'),
  tabela(['Proposta da IA', 'Decisão', 'Justificativa'], [
    ['Claude (Clarify): "Coleção" seria a área temática, via tags', 'Rejeitada: Coleção é o curso de origem (ex.: Ciência da Computação)', 'O RF#02 e o UC04 usam "Coleção" como no LUME e no benchmark da UCS ("Subcomunidades e Coleções"). O tema já é coberto pelas tags, e o protótipo já usava o curso. Consequência: o diagrama de classes ganha o atributo coleção.'],
    ['Gemini (Clarify): manter só os 5 critérios dos diagramas e tratar coleção como tags', 'Aceita só dentro do experimento; para a versão final vale Coleção = curso', 'Com o Gemini, o grupo escolheu responder só com as opções que ele ofereceu, para medir o que o modelo propunha, e nenhuma delas dizia "curso". Ver a observação abaixo da tabela.'],
    ['Gemini (Clarify): ordenar pela ordem de cadastro', 'Rejeitada: mais recente primeiro', 'O CT05 lista os TCCs "A, C e D" como conjunto, não como ordem. O objetivo é descobrir trabalhos recentes, e o protótipo já ordena assim.'],
    ['Gemini (Clarify): detalhes sem trabalhos conexos', 'Rejeitada: incluir trabalhos conexos e contador de visualizações', 'O UC06 (Mapear Trabalhos Conexos) estende a visualização de detalhes no diagrama de casos de uso, e o diagrama de atividades do UC04 já mostra "trabalhos conexos" nos detalhes. Relacionar TCCs é parte do objetivo do projeto.'],
    ['Ambas: termo nos campos principais, tags com E, busca vazia lista todos, TCC sem arquivo indica o LUME', 'Aceitas', 'Coincidem com o comportamento do protótipo e com os casos de teste.'],
    ['Claude: acentos ignorados no termo, mas não em autor e orientador (decidido sem perguntar)', 'Rejeitada: ignorar acentos em todos os campos de texto', 'Decisão 2 do grupo. Um usuário que digita "Joao" deve achar "João" em qualquer campo.'],
    ['Claude: arquivo ausente gera a mensagem de falha de conexão (A04)', 'Rejeitada: o UC04 ganha um fluxo próprio para arquivo indisponível', 'Pedir para "verificar a conexão" quando o arquivo não existe leva o usuário a tentar de novo sem chance de sucesso.'],
    ['Ambas: termo casado por qualquer trecho', 'Modificada: termo casado por palavra inteira', 'Evita que "IA" traga "anomalias" (seção 6.2).'],
    ['Gemini (Analyze): "0 violações da constituição"', 'Rejeitada após inspeção', 'Ver a Tabela 5 (contradições).'],
    ['Ambas: inconsistências no material da Etapa 1', 'Aceitas e conferidas uma a uma', 'Seção 8.'],
  ], [3.2, 2.8, 4]),
  FONTE('Fonte: decisoes-clarify.md e registro-experimentos.md.'),
  P('**Observação sobre a coleção.** A mesma dúvida recebeu respostas diferentes nas duas ferramentas:'),
  LI('o Claude perguntou "o que é Coleção?" e recomendou a área temática;'),
  LI('o Gemini perguntou se o texto ou os diagramas deveriam prevalecer, e recomendou os diagramas citando a constituição.'),
  P('No Antigravity, o grupo decidiu responder só com as opções oferecidas pelo modelo, para observar o que ele propunha sem interferência. Nenhuma das três opções tratava a coleção como curso: a mais próxima falava em "atributo próprio do TCC", sem dizer qual. O grupo escolheu a recomendada (coleção = tags), sabendo que a resposta correta para o projeto é Coleção = curso.'),
  P('O resultado é que a especificação, o código e os testes do Antigravity ficaram sem o filtro por curso, e dois testes independentes falharam por isso (seção 6.2). Isso mostra que a forma da pergunta e as opções oferecidas pela IA limitam a decisão humana. É mais um motivo para que as decisões do Clarify sejam registradas e revistas pelo grupo, como foi feito em `decisoes-clarify.md`.'),
);

// 8. Problemas
add(
  H1('8. Problemas encontrados e como foram validados ou corrigidos'),
  H2('8.1. No material da Etapa 1'),
  P('Cada inconsistência apontada pelas IAs foi conferida no relatório e nos diagramas originais antes de entrar na Tabela 11. As correções serão aplicadas na versão consolidada da Etapa 3.'),
  LEGENDA('Tabela 11 - Problemas no material da Etapa 1 e correções propostas'),
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
  ], [4.2, 1.8, 4]),
  FONTE('Fonte: analysis.md das duas ferramentas, conferido pelo grupo.'),
  H2('8.2. No código gerado'),
  P('Os erros do código gerado (A04, A06, A07, ano inválido e a simulação de falha só aparente do Antigravity) foram confirmados pelos testes independentes e pela leitura do código. O código foi mantido como as ferramentas o entregaram, para que a comparação reflita a saída real. As correções foram registradas como decisões (Tabela 10) para a versão final.'),
  H2('8.3. No próprio experimento'),
  LI('**Gravação bloqueada:** o ambiente do Claude Code impediu o agente de gravar o `analysis.md` na fase Analyze. O texto foi transcrito sem alterações pelo experimentador, o que foi registrado como intervenção.'),
  LI('**Clarify em formatos diferentes:** no Claude as perguntas vieram juntas; no Gemini, uma por vez. O critério de resposta também foi diferente: ao Claude o grupo respondeu com as próprias decisões, mesmo fora das opções; ao Gemini, só com as opções que ele ofereceu. Por isso a resposta sobre a coleção divergiu (seção 7).'),
  LI('**Tempos diferentes:** os tempos do Antigravity incluem as respostas humanas no Clarify; os do Claude, não.'),
  LI('**Node 20 não testado:** as duas suítes foram executadas só no Node 26; a compatibilidade com o Node 20 foi inferida pelas APIs usadas.'),
  LI('**Possível viés:** a condução do experimento, os testes independentes e a lista de seis problemas da Tabela 7 tiveram apoio do Claude Code, a mesma família de modelo de uma das ferramentas comparadas. Para reduzir esse viés, as entradas foram idênticas, os testes independentes seguem só os casos de teste e as decisões do grupo, e tudo pode ser reexecutado com os comandos do Anexo B.'),
);

// 9. Reflexão
add(
  H1('9. Reflexão sobre um ciclo de desenvolvimento apoiado por IA'),
  P('O grupo tira cinco lições do experimento.'),
  P('**As decisões continuam humanas, e a forma da pergunta pesa.** A IA produziu em menos de uma hora o que levaria dias, mas as escolhas que mudaram o comportamento do sistema (coleção, acentos, ordenação, TCC sem arquivo) vieram das respostas do grupo no Clarify. Como a mesma dúvida, perguntada de outro jeito, levou a outra resposta, o registro e a revisão das decisões são parte do processo, e não burocracia.'),
  P('**Passar nos próprios testes não basta.** As duas IAs entregaram todos os testes aprovados, mas os testes eram delas. Só a verificação independente mostrou as diferenças: testes escritos pelo grupo a partir dos próprios critérios, e a lista de problemas conhecidos.'),
  P('**A autoavaliação da IA varia.** Uma ferramenta apontou as próprias falhas; a outra declarou conformidade total sem tê-la. A fase Analyze serve como lista do que conferir, não como veredito.'),
  P('**SDD também revisa o que já existe.** O maior ganho imediato foi a auditoria do material da Etapa 1: a especificação obriga a ler requisitos e diagramas juntos, e as contradições aparecem.'),
  P('**O gargalo muda de lugar.** Escrever deixa de ser o trabalho principal; ler, decidir e verificar passam a ser. Na prática, isso exige do grupo mais entendimento do domínio, e não menos. É o que resume a frase do enunciado: "A IA pode produzir artefatos. O grupo precisa produzir entendimento, decisões e evidências."'),
);

// Anexo A
add(new Paragraph({ children: [new PageBreak()] }), H1('Anexo A - Prompts do experimento de SDD (idênticos para as duas ferramentas)'));
for (const pr of prompts) {
  add(H2(pr.titulo), ...blocoCodigo(pr.texto), new Paragraph({ spacing: { after: 120 }, children: [] }));
}

// Anexo B
add(
  H1('Anexo B - Onde estão os artefatos e como reproduzir'),
  P('Todos os arquivos estão na pasta `etapa2/` do repositório do projeto:'),
  LI('`pacote-entrada/`: o pacote entregue às duas ferramentas (constituição, modelos, relatório da Etapa 1 e diagramas);'),
  LI('`prompts-sdd.md`: os seis prompts;'),
  LI('`decisoes-clarify.md`: as decisões do grupo e as respostas dadas a cada ferramenta;'),
  LI('`registro-experimentos.md`: o registro completo, com horários, intervenções e análise;'),
  LI('`claude-code/` e `antigravity/`: as saídas de cada ferramenta (`specs/001-buscar-filtrar-tccs/`, `src/`, `tests/`). O `claude-code/` tem um commit por fase;'),
  LI('`oraculo/`: os 17 testes independentes e os adaptadores.'),
  P('Para reproduzir, é preciso Node.js 20 ou superior, sem `npm install`:'),
  LI('dentro de `claude-code/` ou de `antigravity/`, rodar `node --test` executa os testes de cada ferramenta;'),
  LI('dentro de `etapa2/`, rodar `IMPL=claude node --test oraculo/` ou `IMPL=antigravity node --test oraculo/` executa os testes independentes.'),
);

// =====================================================================================
const doc = new Document({
  creator: 'Grupo subsTCCk',
  title: 'Entrega 2 - Trabalho Prático - Engenharia de Software',
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 }, paragraph: { spacing: { line: 276 } } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: TNR, size: 24, bold: true }, paragraph: { spacing: { before: 280, after: 120 }, keepNext: true, keepLines: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: TNR, size: 24, bold: true }, paragraph: { spacing: { before: 200, after: 100 }, keepNext: true, keepLines: true, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'marcadores', levels: [
        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } },
        { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 270 } } } },
      ] },
      ...['passos', 'e1'].map((ref) => ({ reference: ref, levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } },
      ] })),
    ],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 567, bottom: 567, left: 567, right: 567, header: 300, footer: 300 } } },
    headers: { default: new Header({ children: [new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: LARGURA }],
      children: [new TextRun({ text: 'INF01127 - Engenharia de Software N', size: 16, color: '666666' }), new TextRun({ text: '\tTrabalho Prático - Engenharia de Software', size: 16, color: '666666' })],
    })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], size: 18 })] })] }) },
    children: conteudo,
  }],
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(SAIDA, buf); console.log('gerado:', SAIDA, buf.length, 'bytes'); });
