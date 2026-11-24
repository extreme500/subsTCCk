// Anexos do relatório final: artefatos completos (Etapa 1 com os ajustes do parecer) e registros da Etapa 2.
const fs = require('fs');
const path = require('path');

// Tabelas de testes funcionais da Etapa 2, atualizadas com as decisões finais e o protótipo da Etapa 3.
function tabelasTestes(raiz) {
  const TF = require(path.join(raiz, 'etapa2', 'relatorio', 'secao-testes-funcionais.cjs'));
  const trocas = [
    ['Obrigatório (FA01); escolhido numa lista de semestres, sem digitação.', 'Obrigatório (FA01); escolhido numa lista de semestres que vai de 2023/1 até o semestre atual, sem digitação.'],
    ['O termo livre também encontra o coorientador.', 'O termo livre e o filtro Orientador também encontram o coorientador.'],
    ['Protótipo (termo)', 'Decisão do grupo; protótipo'],
    ['Hoje a lista do protótipo termina em 2026/1.', ''],
    ['Manual; o protótipo ainda não aplica o limite', 'Automático e manual'],
    ['Manual; o protótipo ainda não tem o botão', 'Automático e manual'],
    ['Manual; o protótipo ainda não aplica a regra', 'Automático e manual'],
    ['Manual; o protótipo ainda não tem a exclusão', 'Automático e manual'],
    ['Automático; o protótipo diverge na segunda parte', 'Automático'],
    ['Automático; o protótipo diverge no semestre atual', 'Automático'],
    ['Limites propostos na Tabela {T:lacunas}, a confirmar pelo grupo; o protótipo ainda não os aplica', 'Limites definidos na Tabela {T:lacunas} e aplicados pelo protótipo'],
    ['Teste automático, CT41', 'CT41'],
  ];
  const limpar = (texto) => {
    let t = String(texto);
    for (const [a, b] of trocas) t = t.split(a).join(b);
    t = t.replace(/\s*\[GRUPO[^\]]*\]/g, '').replace(/\s+$/, '').replace(/\s{2,}/g, ' ');
    return t;
  };
  const tabelas = {};
  for (const bloco of TF.secao) {
    if (bloco.tabela) {
      const tb = bloco.tabela;
      tabelas[tb.chave] = { ...tb, linhas: tb.linhas.map((l) => l.map(limpar)) };
    }
  }
  const l25 = tabelas.lacunas.linhas.find((l) => l[0].startsWith('L25'));
  l25[1] = 'Sem limite de tentativas; cada tentativa recomeça do início, porque o download é tudo ou nada';
  const l03 = tabelas.lacunas.linhas.find((l) => l[0].startsWith('L03'));
  l03[1] = 'O semestre de defesa não pode ser posterior ao atual (classe apontada pelo Antigravity)';
  return {
    tabelas,
    registro: TF.registro.map((l) => l.map(limpar)),
    exp8: TF.exp8.map(limpar),
    exp9: TF.exp9.map(limpar),
  };
}

function lerPrompts(arquivo, esperado) {
  const md = fs.readFileSync(arquivo, 'utf8').replace(/\r/g, '');
  const lista = [...md.matchAll(/## (Prompt \d - [^\n]+)\n\n```text\n([\s\S]*?)```/g)].map((m) => ({ titulo: m[1], texto: m[2].trim() }));
  if (lista.length !== esperado) throw new Error(`${arquivo}: esperava ${esperado} prompts, achei ${lista.length}`);
  return lista;
}

module.exports = function anexos(h) {
  const { P, PS, H1, H2, LI, T, FIG, FIG2, tabela, TAB, FONTE, blocoCodigo, RAIZ } = h;
  const ETAPA2 = path.join(RAIZ, 'etapa2');
  const FIGS = path.join(RAIZ, 'etapa3', 'figuras');
  const IMG = path.join(RAIZ, 'etapa3', 'relatorio', 'img');
  const TT = tabelasTestes(RAIZ);
  const tb = (chave) => {
    const x = TT.tabelas[chave];
    return T(chave, x.titulo, x.cab, x.linhas, x.pesos, x.fonte, 18);
  };
  const UC = (chave, titulo, linhas) => T(chave, titulo, ['Item', 'Descrição'], linhas, [1.7, 8.3], 'Fonte: elaborado pelo grupo.', 20);
  const c = [];
  const add = (...x) => c.push(...x);

  // ============================== ANEXO A ==============================
  add(
    H1('Anexo A - Especificação consolidada (Etapa 1 com os ajustes do parecer)', true),
    H2('A.1. Problema, pesquisa de campo e stakeholders'),
    P('Para entender o problema, o grupo aplicou um formulário a alunos do INF sobre a interação com a divulgação de TCCs (Figura {F:pesquisa}).'),
    ...FIG('pesquisa', path.join(IMG, 'pesquisa-campo.png'), 'Pesquisa com alunos do INF sobre a interação com trabalhos de TCC (6 respostas)', 'Fonte: Estudo de Campo: Produção de TCCs (respostas).', 0.8),
    LI('**Internos e diretos:** o aluno formando (autor), que cadastra o TCC, escolhe tags, envia imagens e acompanha a visibilidade do trabalho; e os professores, que consultam os trabalhos que orientam, identificam trabalhos relacionados e possíveis parcerias.'),
    LI('**Internos e indiretos:** a direção do INF, que ganha visibilidade institucional sem operar o sistema; e a biblioteca (LUME), que continua responsável pela catalogação formal e recebe mais acessos aos trabalhos.'),
    LI('**Externos e diretos:** a comunidade externa (estudantes de outras instituições, profissionais e pesquisadores), que busca e lê em modo visitante, sem permissão de escrita.'),
    LI('**Externos e indiretos:** a comunidade científica e a sociedade, que se beneficiam quando as pesquisas do INF são descobertas e aplicadas.'),
    H2('A.2. Benchmarking completo'),
    ...T('benchCompleto', 'Benchmark de soluções', ['Referência', 'Funcionalidades', 'Defeitos e críticas', 'Informações relevantes', 'Usado como referência', 'Não usado e por quê'], [
      ['LUME (UFRGS) - TCC\nlume.ufrgs.br/handle/10183/26428', 'Navegar por ano, autor, título, assunto e tipo; filtros por orientador, curso, assunto e ano; página do item com resumo, assuntos e PDF', 'Listas só de texto, sem imagens; resumos truncados; não sugere trabalhos relacionados; o curso vem do cadastro do autor', 'Fonte oficial dos TCCs; cada item tem URL permanente no formato lume.ufrgs.br/handle/10183/NNNNNN', 'Os metadados e o link permanente do LUME, validado no cadastro', 'A catalogação formal e o armazenamento oficial: a plataforma divulga e relaciona, não substitui o LUME'],
      ['Biblioteca Digital de TCCs (UFSM)\nrepositorio.ufsm.br/handle/1/26', 'Filtrar e navegar por data, autores, orientadores, títulos e assuntos', 'Não permite mais de um filtro ao mesmo tempo', 'Filtros intuitivos e em destaque', 'As opções de filtragem', 'A interface em lista contínua, que dificulta separar um TCC do outro'],
      ['Substack\nsubstack.com/explore', 'Pesquisa por tópicos e rolagem vertical', 'Difícil separar um post de um trabalho apenas relacionado à área', 'Parece uma rede social, o que facilita o acesso e a navegação', 'O modelo de rede social de posts com imagens', 'O chat'],
      ['TCCs (UCS)\nrepositorio.ucs.br/11338/1114', 'Filtrar e navegar por subcomunidades e coleções, data, autor, título e assunto', 'Visual formal, que pode diminuir o engajamento', 'Permite filtros simultâneos', 'A visualização dos trabalhos e a filtragem', 'Os filtros em blocos'],
      ['Medium\nmedium.com', 'Ações de engajamento (palmas, respostas, republicação) e leitura de artigos longos', 'Não é acadêmico; paywall', 'Página minimalista, boa para leitura longa', 'A página de leitura e as ações de interação', 'O paywall: a leitura deve ser livre'],
    ], [1.7, 1.8, 1.6, 1.7, 1.6, 1.6], 'Fonte: elaborado pelo grupo (Entrega 1).', 18),
    H2('A.3. Requisitos'),
    ...T('requisitos', 'Sentenças de requisito', ['ID', 'Descrição'], [
      ['RF#01', '**Cadastro e Edição de TCC:** o sistema deve permitir que o aluno formando cadastre, edite e exclua as informações do próprio TCC: título, resumo simplificado, orientador, coorientador, ano/semestre, coleção (curso de origem), link do documento oficial no LUME, arquivo DOCX, PDF ou EPUB e até 3 imagens de demonstração. O link do LUME é obrigatório para publicar; sem ele, o TCC pode ser salvo como rascunho.'],
      ['RF#02', '**Feed de Destaques e Descoberta:** o sistema deve exibir um feed inicial com os TCCs defendidos mais recentemente e os tópicos mais explorados no período, permitir buscar e filtrar os TCCs publicados (por termo, ano, autor, orientador, tags e coleção), mostrar os detalhes e os trabalhos conexos de cada TCC e permitir baixar o arquivo do trabalho.'],
    ], [1, 9], 'Fonte: elaborado pelo grupo (Entrega 1, com os ajustes do parecer).'),
    LI('**Problema do RF#01:** os TCCs ficam restritos a repositórios institucionais que não oferecem uma forma ágil e visual de o aluno destacar o trabalho. **Referência:** Substack e Medium, com escrita direta numa página limpa.'),
    LI('**Problema do RF#02:** a busca por trabalhos anteriores é burocrática e baseada só em palavras-chave, o que gera baixo engajamento. **Referência:** o feed personalizado do Substack e as manchetes do Medium.'),
    H2('A.4. User stories'),
    P('Na Etapa 1, as histórias se chamavam US#01 e US#04. Por indicação da revisão, foram renumeradas como US#01 e US#02, sem mudar o conteúdo.'),
    ...T('us', 'User stories e critérios de aceitação', ['História', 'Critérios de aceitação'], [
      ['**US#01:** "Como aluno formando, quero cadastrar meu TCC com tags, resumo acessível e imagens ilustrativas, para dar visibilidade à minha pesquisa e ser facilmente encontrado por colegas e grupos de pesquisa."', 'Dado que eu quero cadastrar meu TCC, quando eu preencher as informações e clicar em publicar, então ele deve ser divulgado no sistema para outras pessoas.\nDado que eu quero categorizar meu TCC, quando eu selecionar as tags apropriadas, então ele deverá ser atribuído àquela classificação.\nDado que eu quero ilustrar meu trabalho, quando eu inserir uma imagem, então ela será atribuída ao TCC.\nDado que ainda não tenho o link do LUME, quando eu clicar em "Salvar como rascunho", então o TCC fica salvo só para mim.'],
      ['**US#02:** "Como aluno ingressante ou pesquisador, quero filtrar TCCs por áreas de interesse e tags temáticas, para encontrar referências bibliográficas relevantes e identificar potenciais orientadores."', 'Dado que eu quero visualizar um TCC, quando eu clicar nele, então o conteúdo e o projeto deverão ser apresentados.\nDado que eu quero trabalhos de um curso específico, quando eu selecionar a coleção correspondente, então os trabalhos de outros cursos não deverão aparecer.\nDado que eu quero os TCCs de um orientador, quando eu digitar o nome dele na pesquisa ou escolhê-lo no filtro, então só os trabalhos que ele orienta ou coorienta aparecerão.'],
    ], [4, 6], 'Fonte: elaborado pelo grupo (Entrega 1, com os ajustes do parecer).'),
    H2('A.5. Casos de uso'),
    P('O diagrama foi redesenhado conforme o parecer (Figura {F:casosUso}): Visitante, Aluno e Professor são especializações de Usuário Leitor, e o Aluno Formando especializa o Aluno, então herda a busca e a leitura. A fronteira do sistema deixa o LUME e o login da UFRGS do lado de fora. Feed e download passaram a ser casos de uso do leitor, e o novo caso UC07 Excluir TCC liga o Aluno Formando e o Professor.'),
    ...FIG('casosUso', path.join(FIGS, 'uml-casos-de-uso.png'), 'Diagrama de casos de uso'),
    H2('A.6. Especificação dos casos de uso'),
    P('O UC01 e o UC04 foram ajustados conforme as decisões da seção 3; o UC02 e o UC07 são novos. Os demais casos (UC03, UC05, UC06, UC08 a UC10) aparecem como passos destes ou no protótipo.'),
    ...UC('uc01', 'UC01 - Cadastrar TCC (RF#01, US#01)', [
      ['Objetivo', 'Permitir que o aluno formando cadastre os metadados, o link do LUME e os anexos visuais do TCC para publicação, ou salve um rascunho.'],
      ['Atores', 'Principal: Aluno Formando (autor). Secundário: LUME, pelo UC03 Validar Link do LUME.'],
      ['Pré-condições', 'Aluno autenticado com as credenciais institucionais (UC10); TCC já defendido. O link do LUME é exigido só para publicar.'],
      ['Pós-condições', 'O TCC publicado aparece no feed, na busca e nos trabalhos conexos; ou fica salvo como rascunho, visível só para o autor.'],
      ['Fluxo principal', '1. O aluno acessa o perfil e seleciona "Cadastrar Novo TCC".\n2. O sistema exibe o formulário: Título, Resumo, Ano/Semestre, Orientador, Coorientador (opcional), Coleção (preenchida com o curso do aluno), Tags, Imagens, Link do LUME e Arquivo do trabalho (opcional).\n3. O aluno preenche os campos obrigatórios: título com até 200 caracteres, resumo com até 1.500 e semestre escolhido numa lista que vai até o semestre atual.\n4. O aluno escolhe de 1 a 5 tags da lista sugerida ou digita novas, com até 30 caracteres cada.\n5. O aluno anexa até 3 imagens (até 5 MB cada) e, se quiser, o arquivo do trabalho (DOCX, PDF ou EPUB, até 20 MB).\n6. O aluno informa a URL do TCC no LUME e clica em "Publicar TCC".\n7. O sistema valida os campos obrigatórios e, depois, a integridade do link (UC03).\n8. O sistema salva o TCC como PUBLICADO, indexa-o para a busca e exibe "TCC publicado com sucesso!".\n9. O caso de uso se encerra.'],
      ['FA01 - Campos obrigatórios incompletos', 'No passo 7, falta um campo obrigatório. O sistema não publica, mantém os dados, destaca os campos pendentes em vermelho e exibe "Preencha todos os campos obrigatórios". O aluno completa os campos e volta ao passo 6.'],
      ['FA02 - Link do LUME inexistente ou inacessível', 'No passo 7, a validação do link falha (link quebrado, domínio incorreto ou LUME indisponível). O sistema exibe "A URL informada não pertence ao domínio do LUME ou está inacessível. Deseja salvar como rascunho até que a publicação no LUME esteja homologada?". Se o aluno aceitar, o sistema salva como RASCUNHO e exibe "Rascunho salvo com sucesso". Se recusar, volta ao formulário com os dados mantidos.'],
      ['FA03 - Salvar como rascunho', 'Em qualquer passo, o aluno clica em "Salvar como rascunho". Com o título preenchido, o sistema salva como RASCUNHO sem validar os outros campos nem o link e exibe "Rascunho salvo com sucesso"; sem título, exibe "Para salvar o rascunho, informe pelo menos o título."'],
      ['FA04 - Limites do formulário', 'A 6ª tag, a 4ª imagem, um arquivo de outro tipo ou acima do tamanho não são adicionados, e o sistema avisa: "Limite de 5 tags atingido. Remova uma tag para adicionar outra.", "Limite de 3 imagens atingido. Remova uma imagem para adicionar outra.", "Formato não suportado. Envie um arquivo DOCX, PDF ou EPUB." ou o aviso do limite de tamanho. Um segundo arquivo só entra depois que o atual é removido.'],
      ['FA05 - Usuário sem permissão', 'Um visitante ou um professor que acessa o cadastro vê "Publicação restrita a formandos": o visitante, com o botão "Entrar com a UFRGS"; o professor, com "Voltar ao feed".'],
    ]),
    ...UC('uc02', 'UC02 - Editar TCC (RF#01)', [
      ['Objetivo', 'Permitir que o autor altere um TCC próprio, publicado ou em rascunho.'],
      ['Atores', 'Principal: Aluno Formando (autor). Secundário: LUME (UC03).'],
      ['Pré-condições', 'Aluno autenticado; o TCC é dele.'],
      ['Pós-condições', 'As alterações ficam salvas; um rascunho com link válido passa a publicado. Um TCC publicado nunca sai do ar por causa de uma edição.'],
      ['Fluxo principal', '1. O aluno abre "Meu perfil" ou a página do TCC e clica em "Editar".\n2. O sistema exibe o formulário do UC01 preenchido com os dados atuais.\n3. O aluno altera os campos e clica em "Publicar TCC".\n4. O sistema valida os campos (como no FA01 do UC01) e o link (UC03).\n5. O sistema salva as alterações; se o TCC era rascunho, ele passa a PUBLICADO. O sistema exibe "TCC publicado com sucesso!".\n6. O caso de uso se encerra.'],
      ['FA01 - Link inválido em TCC publicado', 'No passo 4, a validação do link falha. O sistema não aplica as alterações, mantém a versão publicada no ar e exibe "As alterações não foram salvas": a URL não pertence ao domínio do LUME ou está inacessível, e a versão publicada continua no ar. O rascunho não é oferecido. O aluno corrige o link e volta ao passo 3.'],
      ['FA02 - Link inválido em rascunho', 'Como o FA02 do UC01: o sistema oferece manter como rascunho.'],
      ['FA03 - Salvar como rascunho', 'Só para TCC em rascunho, como o FA03 do UC01. Um TCC publicado não oferece esse botão.'],
      ['FA04 - TCC de outro autor', 'O sistema exibe "Você só pode editar os seus próprios TCCs."'],
    ]),
    ...UC('uc04', 'UC04 - Buscar e Filtrar TCCs (RF#02, US#02)', [
      ['Objetivo', 'Permitir que o leitor encontre TCCs publicados combinando um termo com filtros, veja os detalhes do trabalho escolhido e baixe o arquivo.'],
      ['Atores', 'Principal: Usuário Leitor (visitante, aluno ou professor, com ou sem login). Secundário: Armazenamento de arquivos.'],
      ['Pré-condições', 'Nenhuma; só TCCs com status PUBLICADO participam da busca.'],
      ['Pós-condições', 'Os resultados compatíveis foram apresentados; o arquivo do TCC escolhido foi salvo no dispositivo, ou o leitor foi levado ao LUME.'],
      ['Fluxo principal', '1. O usuário seleciona "Buscar TCC".\n2. O sistema exibe a barra de pesquisa e os filtros Ano, Autor, Orientador, Coleção (curso) e Tags.\n3. O usuário digita termos e/ou escolhe filtros e clica em "Pesquisar".\n4. O sistema aplica todos os critérios ao mesmo tempo, só sobre TCCs publicados, e mostra os resultados em feed, do mais recente para o mais antigo. Sem nenhum critério, lista todos os publicados.\n5. O usuário seleciona um trabalho.\n6. O sistema mostra os detalhes (resumo, imagens, tags, orientação e coleção) e os trabalhos conexos (UC05 e UC06).\n7. O usuário clica em "Baixar Artigo".\n8. O sistema transfere o arquivo inteiro e o salva no dispositivo (UC09).\n9. O caso de uso se encerra.'],
      ['FA01 - Nenhum trabalho atende aos critérios', 'No passo 4, o sistema exibe "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros." O usuário ajusta os critérios e volta ao passo 3.'],
      ['FA02 - Falha durante o download', 'No passo 8, a transferência é interrompida. Nada parcial é salvo, e o sistema exibe "Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente." O usuário tenta de novo (passo 7), sem limite de tentativas; cada tentativa recomeça do início.'],
      ['FA03 - TCC sem arquivo', 'No passo 6, o TCC não tem arquivo. O sistema mostra "Acessar texto no LUME" no lugar de "Baixar Artigo", e o leitor vai à página do TCC no LUME.'],
      ['FA04 - Arquivo indisponível', 'No passo 8, o arquivo registrado não é encontrado. O sistema exibe "O arquivo deste TCC está indisponível no momento. Acesse o texto pelo LUME."'],
      ['Regras da busca', 'O termo procura em título, resumo, autor, orientador, coorientador e tags, ignora maiúsculas e acentos e casa o início de uma palavra ("rede" encontra "redes"; "IA" não encontra "anomalias"). O filtro Autor aceita um trecho do nome; o filtro Orientador também encontra o coorientador; várias tags combinam por E; o filtro Ano não separa semestres.'],
    ]),
    ...UC('uc07', 'UC07 - Excluir TCC (RF#01)', [
      ['Objetivo', 'Retirar um TCC da plataforma pelo autor, ou devolvê-lo ao aluno quando o professor foi indicado por engano.'],
      ['Atores', 'Aluno Formando (autor do TCC); Professor (orientador ou coorientador indicado no TCC).'],
      ['Pré-condições', 'Usuário autenticado; autor do TCC, ou professor indicado como orientador ou coorientador de um TCC publicado.'],
      ['Pós-condições', 'Pelo autor: o TCC foi removido. Pelo professor: o TCC voltou a ser rascunho do aluno e saiu do feed, da busca e do perfil do professor.'],
      ['Fluxo principal (autor)', '1. O aluno abre o TCC ou "Meu perfil" e clica em "Excluir".\n2. O sistema pede confirmação: "Excluir este TCC?", avisando que a ação não pode ser desfeita.\n3. O aluno confirma.\n4. O sistema remove o TCC e exibe "TCC excluído".'],
      ['FA01 - Exclusão pelo orientador ou coorientador', 'No passo 1, o professor abre o TCC e clica em "Excluir". O sistema pergunta "Remover este TCC da sua orientação?" e explica que o TCC voltará a ser rascunho do aluno. Ao confirmar, o TCC passa a RASCUNHO, marcado como devolvido pelo professor, e o sistema exibe "TCC devolvido ao aluno como rascunho". O aluno vê o aviso no rascunho, corrige o orientador e pode publicar de novo (UC02).'],
      ['FA02 - Cancelar', 'O usuário clica em "Cancelar", e nada muda.'],
      ['Regra', 'Visitantes, outros alunos e outros professores não veem a opção "Excluir".'],
    ]),
    H2('A.7. Regras de acesso'),
    ...T('acesso', 'O que cada tipo de usuário pode fazer', ['Ação', 'Visitante (sem login)', 'Aluno formando', 'Professor'], [
      ['Ver o feed, buscar e filtrar TCCs publicados', 'Sim', 'Sim', 'Sim'],
      ['Ver os detalhes e os trabalhos conexos de um TCC publicado', 'Sim', 'Sim', 'Sim'],
      ['Baixar o arquivo ou acessar o texto no LUME', 'Sim', 'Sim', 'Sim'],
      ['Cadastrar e publicar TCC', 'Não: tela "Publicação restrita a formandos", com o botão de login', 'Sim', 'Não: mesma tela, com "Voltar ao feed"'],
      ['Editar TCC', 'Não', 'Só os próprios', 'Não'],
      ['Excluir TCC', 'Não', 'Só os próprios (o TCC é removido)', 'Os que orienta ou coorienta (o TCC volta a ser rascunho do aluno)'],
      ['Ver rascunho', 'Não', 'Só os próprios', 'Não'],
      ['Perfil', 'Pede login', 'Lista os próprios TCCs, publicados e rascunhos', 'Lista os trabalhos publicados que orienta ou coorienta'],
    ], [3.4, 2.2, 2.2, 2.2], 'Fonte: regras decididas pelo grupo e aplicadas no protótipo (src/views/ e src/lib.js).'),
    P('O protótipo tem dois perfis autenticados. O aluno pesquisador, que é um aluno autenticado que não é formando, navega como o visitante.'),
  );

  // ============================== ANEXO B ==============================
  add(
    H1('Anexo B - Diagramas UML', true),
    P('Os diagramas abaixo substituem os da Etapa 1. Cada um traz as correções pedidas no parecer e as inconsistências apontadas pelas IAs e conferidas pelo grupo (Tabela {T:correcoes}, no Anexo E).'),
    ...FIG('classes', path.join(FIGS, 'uml-classes.png'), 'Diagrama de classes'),
    P('Mudanças: atributo coleção no TCC e no FiltroBusca; papéis de autor, orientador e coorientador nas associações; tags e listas tipadas como List; TccDTO completo; ResultadoBuscaDTO, que leva a lista e a mensagem do FA01; operações de rascunho e exclusão; e a interface ArmazenamentoArquivos.'),
    ...FIG('pacotes', path.join(FIGS, 'uml-pacotes.png'), 'Diagrama de pacotes'),
    P('Mudanças: só notação de pacotes, sem o LUME como componente; dependências de cima para baixo (controller → service → repository → model); o dto saiu da camada de apresentação e virou pacote compartilhado; grafia ArquivoTcc padronizada.'),
    ...FIG('seqUc01', path.join(FIGS, 'uml-sequencia-uc01.png'), 'Diagrama de sequência do UC01 (Cadastrar TCC)'),
    P('Mudanças: a resposta do LUME volta ao ValidadorLumeService (antes, uma seta "status" saía do TccRepository); validarCamposObrigatorios() é mensagem para o TCC, dono do método; entraram o FA01 e as duas respostas à oferta de rascunho.'),
    ...FIG('seqUc04', path.join(ETAPA2, 'relatorio', 'figura2-sequencia-uc04.png'), 'Diagrama de sequência do UC04 (Buscar e Filtrar TCCs)'),
    P('Novo, pedido no parecer: a busca com filtros, do clique em "Pesquisar" ao download, com o FA01 e o FA02.'),
    ...FIG('ativUc01', path.join(FIGS, 'uml-atividades-uc01.png'), 'Diagrama de atividades do UC01 (Cadastrar TCC)'),
    P('Mudanças: os caminhos finais são alternativos (a barra de bifurcação saiu); as atividades "Consultar TCCs", que são do UC04, saíram; toda saída de decisão tem condição; a recusa do rascunho volta ao formulário; a raia passou a se chamar Aluno Formando; entrou o botão "Salvar como rascunho".'),
    ...FIG('ativUc04', path.join(FIGS, 'uml-atividades-uc04.png'), 'Diagrama de atividades do UC04 (Buscar e Filtrar TCCs)'),
    P('Mudanças: mensagens completas do UC04; filtro de coleção; decisão "O TCC tem arquivo?", com a saída para o LUME; fluxo de arquivo indisponível.'),
  );

  // ============================== ANEXO C ==============================
  add(
    H1('Anexo C - Arquitetura, design e protótipo', true),
    H2('C.1. Visão geral e componentes'),
    P('A arquitetura tem um cliente web e um servidor de aplicação (Figura {F:arquitetura}, na seção 3). O cliente é uma aplicação de página única (SPA), da qual o protótipo é a primeira versão. Ele se comunica por HTTPS, com dados em JSON, com um servidor monolítico organizado nas camadas do diagrama de pacotes. Os metadados ficam num banco relacional, e os arquivos e as imagens, num armazenamento de arquivos. Há dois sistemas externos: o login institucional da UFRGS e o LUME.'),
    ...T('componentes', 'Componentes e responsabilidades', ['Componente', 'Responsabilidade', 'Atende'], [
      ['Cliente web (SPA React)', 'Telas Feed, Busca, Detalhe, Formulário, Perfil e Entrar. Faz validações imediatas (limites de tags, imagens, tamanhos) para dar retorno rápido, sem substituir a validação do servidor.', 'RF#01, RF#02'],
      ['controller (TccController)', 'Expõe a API. Converte cada requisição em FiltroBusca ou DTO e devolve as mensagens literais dos casos de uso. Não contém regra de negócio.', 'UC01, UC02, UC04, UC07'],
      ['service (TccService, ValidadorLumeService)', 'Regras de negócio: só TCC publicado aparece; filtros combinados por E; rascunho, publicação, edição e exclusão; campos obrigatórios e limites. O ValidadorLumeService verifica o domínio e o acesso do link do LUME.', 'RF#01, RF#02; UC03'],
      ['ArmazenamentoArquivos (interface)', 'Transfere o arquivo do TCC. A transferência é tudo ou nada: em caso de falha, nada parcial chega ao usuário.', 'UC04 (FA02); CT06'],
      ['repository (TccRepository, TagRepository)', 'Consulta e grava os dados. Os testes usam uma implementação em memória; a produção usaria SQL, com a mesma interface.', 'RF#01, RF#02'],
      ['model e dto', 'Entidades do diagrama de classes e objetos de transferência (FiltroBusca, TccDTO, FeedDTO, ResultadoBuscaDTO).', 'Todos'],
      ['Banco relacional', 'TCC, usuários, tags, áreas, mídias e metadados do arquivo; campos de busca normalizados, sem acentos e em minúsculas; status (RASCUNHO ou PUBLICADO) como coluna.', 'RF#01, RF#02'],
      ['Armazenamento de arquivos', 'Arquivos PDF, DOCX e EPUB e as imagens. O banco guarda só o caminho e o formato.', 'RF#01, RF#02'],
      ['Login institucional e LUME (externos)', 'Autenticação de alunos e professores; o LUME é a fonte oficial, e a plataforma só guarda e valida o link permanente.', 'UC03, UC10'],
    ], [2.6, 5.6, 1.8], 'Fonte: elaborado pelo grupo.'),
    H2('C.2. Comunicação e persistência'),
    P('O cliente chama uma API REST: `GET /tccs?termo=&ano=&autor=&orientador=&tags=&colecao=` (busca), `GET /tccs/{id}` (detalhes), `GET /tccs/{id}/arquivo` (download) e `GET /feed`. Cadastro, edição e exclusão usam `POST /tccs`, `PUT /tccs/{id}` e `DELETE /tccs/{id}` e exigem autenticação; o DELETE do orientador devolve o TCC a rascunho em vez de removê-lo. Dentro do servidor, as chamadas descem de forma síncrona (controller → service → repository), e uma camada nunca chama a de cima. Os sistemas externos ficam atrás de interfaces, para que os testes simulem o LUME fora do ar (CT02) ou a queda da conexão no meio do download (CT06). O protótipo guarda o estado no localStorage do navegador, o que basta para a demonstração.'),
    ...T('decisoesTecnicas', 'Decisões técnicas', ['Decisão', 'Motivo', 'Alternativa descartada'], [
      ['Monólito em camadas', 'Escopo pequeno, equipe de 3 pessoas, camadas já definidas no diagrama de pacotes', 'Microsserviços: custo de operação sem ganho neste escopo'],
      ['SPA + API REST', 'O protótipo já é uma SPA; a API separa interface e regra e permitiria um aplicativo móvel', 'Páginas geradas no servidor: exigiria reescrever o protótipo'],
      ['Banco relacional', 'Dados estruturados e relacionados (TCC, tag, área, orientação) e filtros combinados', 'Banco de documentos: consultas por relação ficam mais difíceis'],
      ['Arquivos fora do banco, atrás de interface', 'Arquivos grandes; a interface permite simular falha de transferência (CT06)', 'Guardar o arquivo no banco'],
      ['Termo casa o início de uma palavra, em campos normalizados', 'Ignora acentos e maiúsculas; evita que "IA" traga "anomalias" sem perder os plurais', 'Busca por qualquer trecho (ruído); palavra inteira (perde plurais); motor de busca dedicado (excessivo)'],
      ['LUME como fonte oficial', 'Resultado do benchmark: a plataforma divulga e relaciona, não cataloga', 'Copiar o acervo do LUME'],
      ['Download tudo ou nada', 'FA02 e CT06: nenhum arquivo incompleto pode ser salvo', 'Repassar os bytes conforme chegam'],
    ], [2.6, 4.2, 3.2], 'Fonte: elaborado pelo grupo.'),
    H2('C.3. Protótipo de alta fidelidade'),
    P('O protótipo está publicado em https://extreme500.github.io/subsTCCk/ (código em https://github.com/extreme500/subsTCCk). É uma aplicação React responsiva, sem servidor: a validação do link do LUME e o download são simulados no navegador. Ele cobre as telas Descobrir (feed com os TCCs recentes e os tópicos mais explorados), Buscar TCC, Detalhes (com trabalhos conexos, download e acesso ao LUME), Entrar, Cadastrar/Editar TCC e Meu perfil. O botão "Demonstração" simula o LUME indisponível e a falha de download, restaura os dados iniciais e mostra o roteiro dos casos de teste. Contas de demonstração: aluno formando 00312345 e professor 00012345, ambas com a senha "demo".'),
    P('O protótipo foi gerado com IA (Claude Code, experiência 5 do Anexo F), a partir dos casos de uso, das regras e dos casos de teste do grupo, como permite o enunciado. Na Etapa 3 ele passou a aplicar as decisões da seção 3: botão "Salvar como rascunho", edição que não despublica, exclusão pelo autor e pelo orientador, limites de tamanho, lista de semestres até o atual, busca pelo início da palavra e filtro Orientador com o coorientador (Figuras {F:telasFeed} a {F:telasCelular}).'),
    ...FIG('telasFeed', path.join(IMG, 'tela-01-feed.png'), 'Protótipo: feed de descoberta (computador)', 'Fonte: protótipo do grupo.', 0.85),
    ...FIG2('telasCadastro', [path.join(IMG, 'tela-05-cadastro-fa01.png'), path.join(IMG, 'tela-06-edicao-link-invalido.png')], 'Protótipo: cadastro com o FA01 e edição com link inválido (a versão publicada é mantida)'),
    ...FIG2('telasExclusao', [path.join(IMG, 'tela-07-exclusao-orientador.png'), path.join(IMG, 'tela-08-perfil-devolvido.png')], 'Protótipo: o orientador devolve o TCC a rascunho, que aparece no perfil do aluno'),
    ...FIG2('telasCelular', [path.join(IMG, 'tela-09-celular-feed.png'), path.join(IMG, 'tela-10-celular-detalhe.png'), path.join(IMG, 'tela-11-celular-cadastro.png')], 'Protótipo no celular: feed, detalhes e cadastro'),
  );

  // ============================== ANEXO D ==============================
  add(
    H1('Anexo D - Casos de teste', true),
    H2('D.1. Casos de teste da Etapa 1 (CT01 a CT06)'),
    P('Os casos foram mantidos, com as mensagens completas dos casos de uso. O CT04, que reunia vários limites e um campo vazio, ficou como teste de regressão; os limites isolados estão nos CT13, CT16 e CT17, como pediu o parecer. A base de dados do CT03 (TCCs A a E) é usada por todos os testes de busca.'),
    ...T('cts16', 'Casos de teste CT01 a CT06', ['Caso', 'Relação e tipo', 'Pré-condições, entrada e passos', 'Resultado esperado'], [
      ['CT01 Cadastrar TCC com dados válidos', 'RF#01, UC01, US#01; positivo', 'Aluno autenticado; link ativo no LUME. Título "Detecção de anomalias em redes veiculares", resumo, 2025/2, Prof. Carlos Lima (sem coorientador), coleção Ciência da Computação, link válido, tags Redes, IA e Segurança, 2 imagens PNG. Acessar "Cadastrar Novo TCC", preencher e clicar em "Publicar TCC"', '"TCC publicado com sucesso!"; status PUBLICADO; aparece no feed; a busca pela tag Redes retorna o TCC'],
      ['CT02 Cadastrar com link fora do LUME (FA02)', 'RF#01, UC01 (FA02); negativo', 'Mesmos dados do CT01, com o link http://exemplo.com/tcc-123. Publicar e, no aviso, escolher "Salvar como rascunho"', 'Aviso do FA02; depois, "Rascunho salvo com sucesso"; status RASCUNHO, dados preservados, fora do feed e da busca. Variação: recusar o rascunho volta ao formulário com os dados'],
      ['CT03 Buscar com filtros combinados', 'RF#02, UC04, US#02; positivo', 'Base: A (2025/1, Carlos Lima, Redes, publicado), B (2025/1, Carlos Lima, IA), C (2024/2, Carlos Lima, Redes), D (2025/1, Ana Reis, Redes), E (2025/1, Carlos Lima, Redes, rascunho). Filtros Ano 2025, Orientador Carlos Lima, Tag Redes', 'Só o TCC A, porque os filtros valem juntos e E é rascunho. Variação: Ano 2023 e Tag Redes leva ao FA01'],
      ['CT04 Limites de tags e imagens (FA01)', 'RF#01, UC01 (FA01), US#01; limite e exceção; regressão', 'Mesmos dados do CT01; tentar a 6ª tag e a 4ª imagem; deixar o resumo em branco e publicar; depois preencher e publicar', 'A 6ª tag e a 4ª imagem não entram, com os avisos de limite; sem resumo, FA01; depois, publica com 5 tags e 3 imagens'],
      ['CT05 Buscar sem correspondência (FA01)', 'RF#02, UC04 (FA01), US#02; negativo', 'Base do CT03. Termo "blockchain" e Tag Redes; depois, remover o termo', '"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."; sem o termo, A, C e D (E continua oculto). Variação: o título do rascunho E também não é encontrado'],
      ['CT06 Falha durante o download (FA02)', 'RF#02, UC04 (FA02), US#02; exceção', 'TCC A com PDF; abrir, clicar em "Baixar Artigo", interromper a conexão, restabelecer e tentar de novo', '"Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente."; nada incompleto salvo; o botão continua disponível; na nova tentativa, o PDF é salvo'],
    ], [2, 1.7, 3.6, 2.7], 'Fonte: elaborado pelo grupo (Entrega 1, com os ajustes do parecer).', 18),
    H2('D.2. Como os casos novos foram construídos'),
    P('As duas IAs aplicaram classes de equivalência e análise de valor limite aos CT01 a CT06, primeiro com um prompt simples e depois com um refinado (Anexo E). A base consolidada é a saída refinada do Claude Code; do Antigravity entrou a classe "semestre posterior ao atual" (CI29, caso CT41). O grupo decidiu as 25 lacunas que a IA apontou (Tabela {T:lacunas}), conferiu as recomendações do parecer (Tabela {T:parecerTestes}) e acrescentou os casos que faltavam (CT42 a CT54). O texto completo de cada caso, no formato dos CT01 a CT06, está em `etapa2/testes-funcionais/`.'),
    ...tb('lacunas'),
    H2('D.3. UC01 Cadastrar TCC: classes de equivalência e valores limite'),
    ...tb('ceUc01'),
    ...tb('vlUc01'),
    H2('D.4. UC04 Buscar e Filtrar TCCs: classes de equivalência e valores limite'),
    ...tb('ceUc04'),
    ...tb('vlUc04'),
    H2('D.5. Casos novos (CT07 a CT54) e execução'),
    ...tb('novosCts'),
    P('**Execução.** Os casos de lógica são 38 testes automáticos que rodam contra o código do protótipo (`npm test`, na raiz do repositório), e todos passam. Na Etapa 2 eram 31, com 2 divergências: o semestre atual (2026/2) fora da lista e o termo "IA" encontrando "anomalias". As duas foram corrigidas na Etapa 3, e as regras novas ganharam testes próprios (CT49 a CT54). Os casos que dependem da interface foram executados no protótipo, como os CT01 a CT06, e os fluxos de rascunho, edição e exclusão também foram percorridos por um script no navegador. Só o CT20 não pode ser verificado, porque o protótipo não consulta o LUME de verdade.'),
    ...tb('parecerTestes'),
  );

  // ============================== ANEXO E ==============================
  add(
    H1('Anexo E - Experimentos de SDD e de testes funcionais', true),
    H2('E.1. Ferramentas de SDD pesquisadas'),
    ...T('ferramentasSdd', 'Ferramentas de SDD pesquisadas', ['Ferramenta', 'Como funciona', 'Pontos fortes', 'Limitações'], [
      ['GitHub Spec Kit (GitHub, 2026; código aberto)', 'Uma ferramenta de linha de comando prepara o projeto, e comandos no agente executam as fases: constituição, specify, clarify, plan, tasks, implement e analyze. Funciona com vários agentes', 'As fases coincidem com as do enunciado; não depende de um agente; a constituição fixa princípios para todas as fases', 'Processo pesado, com muito Markdown para revisar; exige instalar a ferramenta'],
      ['Kiro (AWS)', 'IDE e linha de comando; cada funcionalidade tem requirements.md (critérios na notação EARS), design.md e tasks.md', 'Fluxo integrado ao editor; requisitos em formato padronizado', 'Ligado a um produto; menos flexível para outro agente'],
      ['Tessl', 'Busca o nível spec-as-source: a especificação é a fonte, e o código é derivado dela', 'Especificação viva, que não fica desatualizada', 'Böckeler alerta para a rigidez, somada ao não determinismo dos modelos'],
      ['OpenSpec (Fission-AI)', 'Cada mudança ganha uma pasta com proposta, tarefas e as alterações ("deltas") da especificação', 'Mais leve; pensado para sistemas que já existem', 'Menos estrutura para começar do zero'],
      ['Agentes com modo de planejamento (Claude Code, Antigravity)', 'Planejam antes de editar e executam um plano aprovado', 'Executam qualquer fluxo descrito em prompts', 'Sem fases nem artefatos padronizados'],
    ], [2, 3.2, 2.5, 2.3], 'Fonte: elaborado pelo grupo a partir de Delimarsky (2025), Böckeler (2025), Kiro (2026) e Fission-AI (2026).', 18),
    H2('E.2. Execução do SDD nas duas ferramentas'),
    P('As duas ferramentas receberam a mesma pasta (o relatório da Etapa 1 até a seção 3.2.3, os seis diagramas em imagem e em texto, a constituição e os modelos) e os mesmos seis prompts, em uma conversa cada, sem acesso ao protótipo. Na fase Plan, o grupo fixou as restrições técnicas: JavaScript em Node.js 20 ou superior, sem dependências externas, testes com `node --test`, camadas e nomes dos diagramas e dados iniciais com os TCCs A a E do CT03.'),
    ...T('fases', 'Resultado de cada fase nas duas ferramentas', ['Fase', 'Claude Code (Claude Opus 5.5)', 'Antigravity (Gemini 4 Argon, raciocínio High)'], [
      ['Specify', '3 histórias, 18 requisitos (FR), 5 pontos marcados para esclarecer; ~3 min', '3 histórias, 10 FR, 5 pontos marcados; ~4 min'],
      ['Clarify', '5 perguntas, entregues de uma vez; ~2 min, sem contar as respostas', '5 perguntas, uma por vez, com opções e recomendação; ~14,5 min, com as respostas'],
      ['Plan', '12 divergências com os diagramas registradas; falha simulada no meio da transferência; ~6,5 min', '6 divergências registradas; falha simulada por uma chave liga/desliga; ~3,5 min'],
      ['Tasks', '52 tarefas; ~9 min', '25 tarefas; ~2 min'],
      ['Implement', '53 testes, 53 aprovados; antes do código falharam 20, 9 e 9; 10 desvios registrados; ~17 min', '12 testes, 12 aprovados; antes do código falharam 7, 2 e 3; declarou "nenhum desvio"; ~8,5 min'],
      ['Analyze', '24 achados (1 alto, 8 médios, 15 baixos); 100% dos FR com teste; 27 inconsistências na Etapa 1; ~22 min', '5 achados (todos baixos); 100% dos FR com teste; "0 violações"; 9 inconsistências na Etapa 1; ~2 min'],
    ], [1.4, 4.3, 4.3], 'Fonte: pastas specs/001-buscar-filtrar-tccs/ de cada ferramenta e registro-experimentos.md.', 18),
    ...T('registroSdd', 'Registro dos experimentos de SDD', ['Campo', 'Claude Code', 'Antigravity'], [
      ['Ferramenta / modelo', 'Claude Code, modelo Claude Opus 5.5 (Anthropic), agente com contexto limpo', 'Antigravity (Google), modelo Gemini 4 Argon, raciocínio High; agente na configuração padrão, executando comandos sem pedir confirmação'],
      ['Prompt / estratégia', 'Os 6 prompts do Anexo G, um por fase, com parada ao fim de cada uma. As 5 perguntas do Clarify vieram juntas; o grupo respondeu só com as opções oferecidas pelo modelo', 'Os mesmos 6 prompts, na mesma conversa. As 5 perguntas vieram uma por vez; o grupo respondeu só com as opções oferecidas'],
      ['Resultado', 'Especificação (18 FR), plano, 52 tarefas, ~1.430 linhas de JavaScript, 53 testes aprovados e uma análise com 24 achados', 'Especificação (10 FR), plano, 25 tarefas, ~1.040 linhas, 12 testes aprovados e uma análise com 5 achados'],
      ['Aceito', 'Camadas e nomes dos diagramas; mensagens literais; falha simulada no meio da transferência; 4 das 5 recomendações do Clarify', 'Camadas e nomes; mensagens literais; 3 das 5 recomendações; registro das mensagens divergentes entre texto e diagrama'],
      ['Alterado', 'Nada no código: o experimento mede a saída como veio. As correções viraram decisões (Tabela {T:decisoesCompletas})', 'Idem'],
      ['Investigado', 'Achados A04, A06 e A07, confirmados pelos testes independentes e pela leitura do código', 'As afirmações "0 violações" e "nenhum desvio"; a simulação de falha é só uma chave, e o "buffer parcial" é descartado antes de ser usado'],
      ['Rejeitado', 'Recomendação "Coleção = área temática (via tags)"', 'Ordenação por ordem de cadastro; detalhes sem trabalhos conexos'],
      ['Omissões', 'Não perguntou sobre acentos nos filtros de autor e orientador nem sobre o coorientador; registrou-os como premissas', 'Não ofereceu opção sobre acentos nem sobre coleção como curso; não detectou 4 dos 6 problemas conhecidos; não testou DOCX e EPUB'],
      ['Contradições', 'Decidiu sozinho que autor e orientador diferenciam acentos, contra o princípio VI (ele mesmo apontou, achado A07)', 'Declarou conformidade total, mas o controller guarda estado de tela e o armazenamento está fora dos diagramas'],
      ['Alucinações', 'Nenhuma identificada', 'Nenhuma identificada'],
      ['Erros', 'Arquivo ausente gera "verifique a sua conexão" (A04); termo curto casa trechos de palavras (A06)', 'Termo curto casa trechos de palavras; ano inválido ignorado em silêncio; "deteccao" não encontra "Detecção"'],
      ['Boas sugestões', 'Coletar a coleção no cadastro (A01); separar "arquivo ausente" de "falha de conexão" (A04); termo por palavra (A06)', 'Mensagem própria para TCC sem arquivo, com o link do LUME; uniformizar as mensagens; ordenar por recência'],
    ], [1.6, 4.2, 4.2], 'Fonte: registro-experimentos.md e artefatos de cada ferramenta.', 18),
    ...T('problemasConhecidos', 'Problemas conhecidos da Etapa 1 encontrados por cada IA na fase Analyze', ['Problema no material da Etapa 1', 'Claude Code', 'Antigravity'], [
      ['"Coleção" é filtro no RF#02 e no UC04, mas não é atributo nem classe nos diagramas', 'Sim', 'Sim'],
      ['Diagrama de sequência do UC01: seta "status" saindo do TccRepository para o LUME', 'Sim', 'Sim'],
      ['Diagrama de sequência do UC01: validarCamposObrigatorios() como auto-chamada do TccService, mas o método é da classe TCC', 'Sim', 'Não'],
      ['Visitante é ator do UC04, mas não aparece no diagrama de casos de uso nem no de classes', 'Sim', 'Não'],
      ['O mesmo ator com nomes diferentes ("Aluno Graduando" e "Aluno Formando")', 'Sim', 'Não'],
      ['Numeração das user stories salta de US#01 para US#04', 'Não', 'Não'],
    ], [7, 1.5, 1.5], 'Fonte: arquivos analysis.md das duas ferramentas. A lista foi levantada antes do experimento, na revisão da Etapa 1.', 18),
    ...T('independentes', 'Testes independentes nas duas implementações', ['Grupo de testes', 'Claude Code', 'Antigravity'], [
      ['Casos de teste da Etapa 1 (CT03, CT03 variação, CT05, CT05 variação, CT06)', '5/5', '5/5'],
      ['Decisões do grupo no Clarify (coleção, maiúsculas, acentos, campos do termo, tags com E, TCC sem arquivo, busca vazia)', '8/8', '6/8 (coleção e acentos)'],
      ['Robustez (rascunho bloqueado, autor parcial, termo curto, ano inválido)', '3/4 (termo "IA")', '2/4 (termo "IA"; ano "abc" ignorado)'],
      ['Total', '16/17', '13/17'],
    ], [6, 2, 2], 'Fonte: execução de IMPL=claude node --test oraculo/ e IMPL=antigravity node --test oraculo/. As duas falhas de decisão do Antigravity vêm das respostas dadas no Clarify, não de erro de programação.', 18),
    ...T('regrasBusca', 'Regras de busca: protótipo final e implementações do SDD', ['Regra', 'Protótipo (Etapa 3)', 'Claude Code', 'Antigravity'], [
      ['Só TCCs publicados', 'Sim', 'Sim', 'Sim'],
      ['Campos do termo livre', 'Título, resumo, autor, orientador, coorientador, tags', 'Título, resumo, autor, orientador, tags', 'Igual ao protótipo'],
      ['Acentos', 'Ignora em tudo', 'Ignora no termo, não em autor e orientador', 'Não ignora'],
      ['Filtro de orientador', 'Orientador ou coorientador (lista de seleção)', 'Trecho, sem diferenciar maiúsculas', 'Trecho, sem diferenciar maiúsculas'],
      ['Filtro de coleção', 'Curso', 'Curso', 'Não existe'],
      ['Várias tags / ordenação', 'Todas (E) / mais recente primeiro', 'Todas (E) / mais recente primeiro', 'Todas (E) / mais recente primeiro'],
      ['TCC sem arquivo', 'Botão "Acessar texto no LUME"', 'Não oferece o download', 'Recusa o download com mensagem e link do LUME'],
      ['Termo dentro de uma palavra ("IA" em "anomalias")', 'Não encontra (corrigido na Etapa 3)', 'Encontra (problema)', 'Encontra (problema)'],
      ['Testes automatizados', '38 testes funcionais da lógica', '53', '12'],
    ], [2.4, 2.8, 2.4, 2.4], 'Fonte: elaborado pelo grupo.', 18),
    H2('E.3. Experimento de testes funcionais'),
    ...T('registroTestes', 'Registro do experimento de testes funcionais', ['Campo', 'Claude Code', 'Antigravity'], TT.registro, [1.6, 4.2, 4.2], 'Fonte: pasta etapa2/testes-funcionais/.', 18),
    H2('E.4. Decisões do grupo e correções aplicadas'),
    ...T('decisoesCompletas', 'Todas as decisões do grupo sobre as propostas das IAs', ['Proposta da IA', 'Decisão', 'Justificativa'], [
      ['Claude (Clarify): "Coleção" seria a área temática, via tags', 'Rejeitada: coleção é o curso de origem', 'O RF#02 e o UC04 usam "Coleção" como o LUME e a UCS; o tema já é coberto pelas tags, e o protótipo já usava o curso'],
      ['Gemini (Clarify): manter só os 5 critérios dos diagramas e tratar coleção como tags', 'Aceita só dentro do experimento; vale coleção = curso', 'O grupo respondeu às duas IAs só com as opções que elas ofereceram; o Claude ofereceu "curso", o Gemini não'],
      ['Gemini (Clarify): ordenar pela ordem de cadastro', 'Rejeitada: mais recente primeiro', 'O CT05 lista os TCCs como conjunto, não como ordem; o objetivo é descobrir trabalhos recentes'],
      ['Gemini (Clarify): detalhes sem trabalhos conexos', 'Rejeitada', 'O UC06 estende a visualização de detalhes; relacionar TCCs é parte do objetivo do projeto'],
      ['Ambas: termo nos campos principais, tags com E, busca vazia lista todos, TCC sem arquivo indica o LUME', 'Aceitas', 'Coincidem com o protótipo e com os casos de teste'],
      ['Claude: acentos ignorados no termo, mas não em autor e orientador', 'Rejeitada: ignorar em todos os campos', 'Um usuário que digita "Joao" deve achar "João" em qualquer campo'],
      ['Claude: arquivo ausente gera a mensagem de falha de conexão (A04)', 'Rejeitada: o UC04 ganhou o FA04', 'Pedir para "verificar a conexão" leva a tentativas sem chance de sucesso'],
      ['Ambas: termo casado por qualquer trecho', 'Modificada: início de uma palavra', 'Evita "IA" em "anomalias" sem perder os plurais; aplicada ao protótipo na Etapa 3'],
      ['Gemini (Analyze): "0 violações da constituição"', 'Rejeitada após inspeção', 'Ver a Tabela {T:registroSdd} (contradições)'],
      ['Ambas: inconsistências no material da Etapa 1', 'Aceitas e conferidas uma a uma', 'Corrigidas nos Anexos A e B (Tabela {T:correcoes})'],
      ['Claude (testes): versão refinada, com 25 lacunas', 'Aceita como base; lacunas decididas pelo grupo', 'Eram decisões que a Etapa 1 não tinha tomado (Tabela {T:lacunas})'],
      ['Claude (testes): retirar o teste de domínio parecido com o do LUME', 'Rejeitada: o caso voltou na classe CI05', 'É um engano realista do usuário'],
      ['Antigravity (testes): classe "semestre posterior ao atual"', 'Aceita, com o ano corrente corrigido para 2026/2', 'Consequência de "TCC já defendido"; o Claude a deixara como lacuna'],
      ['Antigravity (testes, prompt simples): base de teste e casos CT12 e CT20', 'Rejeitados', 'Contradiziam a tabela do CT03 e usavam regras que o relatório não define'],
    ], [3.4, 2.8, 3.8], 'Fonte: decisoes-clarify.md e registro-experimentos.md.', 18),
    ...T('correcoes', 'Problemas encontrados e correções aplicadas', ['Problema', 'Apontado por', 'Correção aplicada'], [
      ['"Coleção" sem atributo no TCC e no FiltroBusca, e sem campo no cadastro', 'Claude e Gemini', 'Atributo coleção no diagrama de classes e no FiltroBusca; campo Coleção no UC01 e no protótipo'],
      ['Mensagens do FA01 e do FA02 com textos diferentes no UC04, nos CTs e no diagrama de atividades', 'Claude e Gemini', 'Texto completo do UC04 em todos os artefatos'],
      ['Seta "status" do TccRepository para o LUME no diagrama de sequência do UC01', 'Claude e Gemini', 'A resposta do LUME vai para o ValidadorLumeService (Figura {F:seqUc01})'],
      ['validarCamposObrigatorios() como auto-chamada do TccService', 'Claude', 'Mensagem do TccService para o TCC'],
      ['Visitante fora do diagrama de casos de uso; nomes diferentes para o mesmo ator', 'Claude', 'Hierarquia de atores e nome Aluno Formando padronizado (Figura {F:casosUso})'],
      ['TccDTO incompleto; tags tipadas como texto; FeedDTO.tccsRecentes não é lista', 'Claude e Gemini', 'TccDTO completo; tags e tccsRecentes como List (Figura {F:classes})'],
      ['ArquivoTcc (classes) e ArquivoTCC (pacotes)', 'Claude e Gemini', 'Grafia ArquivoTcc'],
      ['UC04 sem fluxo para TCC sem arquivo nem para arquivo indisponível', 'Claude', 'FA03 e FA04 do UC04'],
      ['User stories US#01 e US#04, sem US#02 e US#03', 'Revisão do grupo', 'Renumeradas como US#01 e US#02'],
      ['Protótipo: o semestre atual (2026/2) não podia ser escolhido', 'Testes funcionais (valor limite)', 'A lista vai até o semestre atual (CT41)'],
      ['Protótipo: "IA" encontrava "anomalias"', 'Testes independentes e funcionais', 'O termo casa o início de uma palavra (CT33)'],
      ['UC01 permitia rascunho sem link, mas o protótipo não tinha como salvar', 'Conferência para o parecer', 'Botão "Salvar como rascunho" (CT51)'],
      ['Editar um TCC publicado podia transformá-lo em rascunho', 'Conferência para o parecer', 'A versão publicada é mantida (UC02 FA01; CT52)'],
      ['Exclusão de TCC não especificada nem implementada', 'Revisão do grupo', 'UC07 Excluir TCC e implementação no protótipo (CT53, CT54)'],
    ], [4.2, 2, 3.8], 'Fonte: arquivos analysis.md das duas ferramentas e parecer da Etapa 1, conferidos pelo grupo.', 18),
  );

  // ============================== ANEXO F ==============================
  const PERGUNTAS = [
    'Atividade realizada', 'Artefato produzido ou revisado', 'Ferramenta / modelo', 'Objetivo do uso da IA', 'Contexto fornecido',
    'Instruções ou prompts (refinar melhorou?)', 'Resultado gerado', 'Uso: integral, parcial ou descartado', 'Modificações feitas pela equipe',
    'Como o resultado foi verificado', 'Benefício percebido', 'Problemas, limitações ou riscos', 'Ficou melhor ou só mais rápido?',
  ];
  const experiencias = [
    ['1. Pesquisa de campo (Etapa 1)', ['Preparar a pesquisa com alunos do INF sobre a interação com TCCs', 'Formulário da pesquisa de campo', 'Gemini', 'Reorganizar o rascunho do grupo segundo um modelo de entrevista', 'Rascunho do formulário feito pelo grupo e o objetivo da pesquisa', 'Pedido inicial e, depois da primeira resposta, um segundo pedido para alinhar ao modelo de entrevista. Refinar os prompts sem dúvida melhorou o resultado', 'Versão reorganizada do formulário', 'Integral', 'Nenhuma necessária', 'O formulário recebeu 6 respostas (Figura {F:pesquisa})', 'Velocidade, e o grupo não precisou gastar tempo aprendendo a criar um formulário do zero', 'Foi preciso conferir todas as perguntas para garantir que nada "incorreto" fosse enviado a outras pessoas', 'Ambos']],
    ['2. Diagrama de classes (Etapa 1)', ['Modelagem do domínio', 'Diagrama de classes', 'Gemini, com revisão no Claude sem contexto prévio', 'Formar o modelo de negócio em UML a partir da estrutura inicial', 'Estrutura inicial do grupo, requisitos revisados e benchmark', 'Não foi necessário refinar: a primeira versão já foi boa o suficiente', 'Diagrama de classes em UML', 'Integral', 'Nenhuma necessária', 'Revisão por uma segunda IA sem contexto e revisão do grupo', 'Facilidade em criar um diagrama com os fundamentos corretos, especialmente para quem ainda aprendia o assunto', 'Fato posterior: o SDD apontou a ausência da coleção, atributos tipados como texto em vez de lista e a falta de papéis entre TCC e Professor, corrigidos na Etapa 3', 'Ambos']],
    ['3. Diagramas de pacotes e de sequência (Etapa 1)', ['Modelagem da solução', 'Diagramas de pacotes e de sequência do UC01', 'Gemini (mesma conversa da experiência 2)', 'Gerar os diagramas a partir do diagrama de classes validado', 'O diagrama de classes validado', 'Não foi necessário refinar: a primeira versão já foi boa o suficiente', 'Os dois diagramas', 'Integral', 'Nenhuma necessária', 'Revisão por uma segunda IA sem contexto e revisão do grupo', 'Facilidade em criar diagramas com os fundamentos corretos', 'Fato posterior: o de sequência tinha 2 dos 6 problemas conhecidos, e o parecer apontou a notação do de pacotes; os dois foram redesenhados na Etapa 3', 'Ambos']],
    ['4. Casos de teste CT01 a CT03 (Etapa 1)', ['Derivação de testes', 'CT01 a CT03', 'Claude', 'Gerar três casos a partir dos requisitos e critérios de aceitação', 'Requisitos numerados, user stories e casos de uso', 'Pedido de 3 casos com base no material. Não foi necessário refinar', 'Três casos de teste', 'Integral', 'Nenhuma necessária', 'Execução no protótipo', 'Facilidade em criar casos com os fundamentos corretos', 'Foi preciso verificar todos os casos para garantir que não eram "otimistas" demais', 'Ambos']],
    ['5. Revisão, CT04 a CT06, atividades do UC04 e protótipo (Etapa 1)', ['Revisão da Etapa 1 e construção do protótipo', 'Relatório da Etapa 1, CT04 a CT06, diagrama de atividades do UC04, linha do LUME no benchmark, protótipo React', 'Claude Code (Claude Opus 5.5), executado no repositório', 'Conferir a aderência ao enunciado, apontar inconsistências e completar os artefatos', 'Enunciado, relatório da Etapa 1 e repositório', 'Um pedido inicial com quatro itens ("Adicione no word os 3 casos de teste faltantes [...]"; "Gere [...] o protótipo de alta fidelidade"; "liste todas as suas adições e mudanças para mim") e dois pedidos de conferência', 'Lista de inconsistências e os artefatos citados', 'Parcial: o grupo aplicou as mudanças à mão no documento original e pediu duas conferências', 'Correção na formatação, apenas', 'Os seis casos de teste executados no protótipo', 'Velocidade e uma revisão completa do documento', 'O diagrama de atividades gerado abreviou as mensagens do FA01 e do FA02 (achado posterior do SDD)', 'Ambos']],
    ['6. SDD com o Claude Code (Etapa 2)', ['Spec-Driven Development do UC04', 'spec.md, plan.md, tasks.md, código, testes e analysis.md', 'Claude Code (Claude Opus 5.5), agente com contexto limpo', 'Testar se uma especificação estruturada orienta plano, tarefas, implementação e testes', 'Pacote de entrada (relatório da Etapa 1, diagramas, constituição e modelos)', 'Seis prompts fixos (Anexo G), sem refinamento, para manter a comparação justa', '18 FR, 52 tarefas, 53 testes aprovados, 24 achados e 27 inconsistências da Etapa 1', 'Parcial: o código ficou como evidência; as decisões e inconsistências corrigiram a Etapa 1', 'Nenhuma no código gerado; 5 respostas no Clarify', '17 testes independentes (16 aprovados), leitura do código e conferência de cada achado', 'Ambiguidades levantadas cedo e auditoria da Etapa 1', 'Decidiu sozinho uma regra (acentos); mensagem errada para arquivo ausente; termo curto casa trechos de palavras', 'Melhor no que foi verificado (rastreabilidade e testes); a verificação, porém, teve de ser humana']],
    ['7. SDD com o Antigravity (Etapa 2)', ['Spec-Driven Development do UC04', 'spec.md, plan.md, tasks.md, código, testes e analysis.md', 'Antigravity, Gemini 4 Argon (raciocínio High), comandos sem confirmação', 'O mesmo da experiência 6', 'O mesmo pacote de entrada', 'Os mesmos seis prompts (Anexo G)', '10 FR, 25 tarefas, 12 testes aprovados, 5 achados e 9 inconsistências da Etapa 1', 'Parcial, como na experiência 6', 'Nenhuma no código; 5 respostas no Clarify, só com as opções do modelo', '17 testes independentes (13 aprovados) e leitura do código', 'Rapidez; perguntas do Clarify bem estruturadas, uma por vez', 'Análise final otimista ("0 violações"); simulação de falha só aparente; sem tratamento de acentos', 'Mais rápido; a qualidade ficou abaixo da do Claude nos testes independentes']],
    ['8. Testes funcionais com o Claude Code (Etapa 2)', TT.exp8],
    ['9. Testes funcionais com o Antigravity (Etapa 2)', TT.exp9],
    ['10. Condução, verificação e redação (Etapa 2)', ['Orquestrar os experimentos, verificar as saídas e redigir', 'Pacotes de entrada, prompts, testes independentes, figura e texto da arquitetura, rascunho do relatório da Etapa 2', 'Claude Code (Claude Opus 5.5), em sessão separada dos agentes avaliados', 'Executar o trabalho repetitivo e medir os resultados com o mesmo critério nas duas ferramentas', 'Enunciado, relatório da Etapa 1, protótipo e as saídas dos experimentos', 'Instruções do grupo em conversa, ao longo de várias sessões', 'Os arquivos da pasta etapa2/ e o rascunho do relatório', 'Parcial: o texto foi revisado e editado pelo grupo', 'Formatação e preenchimento das seções subjetivas; correção de uma afirmação errada sobre o Clarify', 'Os testes independentes rodam com um comando; os números do relatório vêm dos arquivos dos experimentos', 'Tempo; mesmo critério de comparação para as duas ferramentas', 'Viés possível a favor do Claude (seção 9); texto extenso demais', 'Muito mais rápido e, onde houve verificação, muito melhor']],
    ['11. Consolidação final (Etapa 3)', ['Aplicar as decisões ao protótipo, redesenhar os diagramas, enxugar as Etapas 1 e 2 neste relatório e preparar a apresentação', 'Protótipo (src/ e tests/), diagramas UML do Anexo B, este relatório e os slides', 'Claude Code (Claude Opus 5.5), executado no repositório', 'Implementar as regras decididas pelo grupo e condensar os dois relatórios no formato da seção 11 do enunciado', 'Enunciado (versão 3), parecer da Etapa 1, relatórios das Etapas 1 e 2 e repositório', 'Um pedido do grupo: "implementar no protótipo todas as coisas que faltam e que foram discutidas, enxugar todo o conteúdo das entregas 1 e 2 e gerar o relatório técnico final de 5 a 8 páginas e a apresentação final"', 'Protótipo com as regras da seção 3 e 38 testes; seis diagramas redesenhados; este relatório; os slides', '[GRUPO: integral, parcial ou descartado, depois da revisão]', '[GRUPO: o que vocês mudaram no texto, nos diagramas e nos slides]', '38 testes automáticos (todos passam) e um script que percorre no navegador os fluxos de rascunho, edição e exclusão', '[GRUPO: benefício percebido]', 'Viés possível a favor do Claude; diagramas desenhados por script, que o grupo precisa conferir contra o parecer', '[GRUPO: melhor ou só mais rápido?]']],
  ];
  add(
    H1('Anexo F - Registro detalhado de cada experiência com IA', true),
    P('Cada experiência responde às perguntas do enunciado ("Registro detalhado de cada experiência"). As experiências 1 a 5 são da Etapa 1, as 6 a 10 da Etapa 2 e a 11 da Etapa 3.'),
  );
  for (const [titulo, respostas] of experiencias) {
    add(h.legenda(`Experiência ${titulo}`), tabela(['Pergunta', 'Resposta'], PERGUNTAS.map((p, i) => [p, respostas[i]]), [3, 7], 18), PS(''));
  }

  // ============================== ANEXO G ==============================
  const promptsSdd = lerPrompts(path.join(ETAPA2, 'prompts-sdd.md'), 6);
  const promptsTestes = lerPrompts(path.join(ETAPA2, 'testes-funcionais', 'prompts-testes.md'), 2);
  add(H1('Anexo G - Prompts dos experimentos e reprodução', true), H2('G.1. Prompts do experimento de SDD (idênticos para as duas ferramentas)'));
  for (const p of promptsSdd) add(PS(`**${p.titulo}**`), ...blocoCodigo(p.texto), PS(''));
  add(H2('G.2. Prompts do experimento de testes funcionais (idênticos para as duas ferramentas)'));
  for (const p of promptsTestes) add(PS(`**${p.titulo}**`), ...blocoCodigo(p.texto), PS(''));
  add(
    H2('G.3. Onde estão os artefatos e como reproduzir'),
    P('Todos os arquivos estão no repositório https://github.com/extreme500/subsTCCk:'),
    LI('`src/` e `tests/`: o protótipo e os 38 testes funcionais da lógica (`npm test`);'),
    LI('`etapa2/`: o experimento de SDD (pacote de entrada, prompts, decisões do Clarify, registro, saídas de cada ferramenta em `claude-code/` e `antigravity/`), os 17 testes independentes (`oraculo/`) e o experimento de testes funcionais (`testes-funcionais/`);'),
    LI('`etapa3/`: os diagramas UML redesenhados (`figuras/`, com os scripts que os geram), este relatório e a apresentação.'),
    P('Para reproduzir, com Node.js 20 ou superior: `npm test` na raiz do repositório; `node --test` dentro de `etapa2/claude-code/` ou de `etapa2/antigravity/`; e `IMPL=claude node --test oraculo/` ou `IMPL=antigravity node --test oraculo/` dentro de `etapa2/`.'),
  );
  return c;
};
