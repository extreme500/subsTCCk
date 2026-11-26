// Corpo do relatório técnico final: os 10 itens da seção 11 do enunciado (sem limite de páginas, conforme o e-mail da professora).
module.exports = function corpo(h) {
  const { P, H1, H2, LI, T } = h;
  return [
    // 1
    H1('1. Contexto, problema e escopo'),
    P('No Instituto de Informática da UFRGS, os TCCs são divulgados por e-mail, de forma estática: quem recebe vê o título e a data da banca, mas não o conteúdo nem a relação com outros trabalhos. Na pesquisa de campo do grupo, com 6 alunos do INF, dois ignoraram o último e-mail de banca, dois leram só o assunto e dois abriram o resumo, mas nenhum assistiu à banca (Anexo A). O repositório oficial, o LUME, cataloga os trabalhos, mas mostra listas só de texto e não sugere trabalhos relacionados.'),
    P('Do domínio Universidade, o grupo escolheu o escopo "TCCs e trabalhos acadêmicos: busca, relacionamento, divulgação e acompanhamento". A solução é o **subsTCCk**, uma plataforma web que divulga cada TCC com resumo acessível, imagens e tags e o relaciona a outros trabalhos por tema e por orientador. Ela não substitui o LUME: o link do LUME é a fonte oficial de cada TCC. Os usuários diretos são o aluno formando, que publica o próprio TCC; o professor, que acompanha os trabalhos que orienta; e o leitor (aluno, professor ou visitante sem login), que busca e lê. Foram escolhidas duas funcionalidades:'),
    LI('**RF#01 Cadastro e Edição de TCC:** UC01 Cadastrar, UC02 Editar, UC03 Validar Link do LUME e UC07 Excluir;'),
    LI('**RF#02 Feed de Destaques e Descoberta:** UC04 Buscar e Filtrar, UC05 Visualizar Detalhes, UC06 Mapear Trabalhos Conexos, UC08 Ver Feed e UC09 Baixar Arquivo.'),
    P('Este relatório consolida as Etapas 1 e 2 com os ajustes pedidos no parecer da Etapa 1. Ele segue o ciclo de Engenharia de Software que o grupo percorreu: compreender o problema (seção 1), investigar soluções existentes (seção 2), definir os requisitos, especificar e modelar as funcionalidades, propor a arquitetura e projetar os testes (seção 3) e experimentar o apoio de GenAI (seções 4 a 10). O corpo resume o percurso e as decisões; os artefatos completos estão nos anexos: especificação (A), UML (B), arquitetura e protótipo (C), testes (D), experimentos com IA (E e F) e prompts (G).'),

    // 2
    H1('2. Benchmarking e aprendizados'),
    P('O grupo analisou o sistema da própria universidade e quatro referências externas (Tabela {T:bench}; a análise completa está no Anexo A).'),
    ...T('bench', 'Referências do benchmarking', ['Referência', 'O que foi usado', 'O que não foi usado e por quê'], [
      ['LUME (UFRGS)', 'Metadados (orientador, ano, assuntos) e o link permanente, validado no cadastro', 'Catalogação e armazenamento oficial: a plataforma divulga e relaciona, não cataloga'],
      ['TCCs da UFSM', 'Filtros por data, autor, orientador e assunto', 'Lista contínua, que dificulta separar um TCC do outro'],
      ['TCCs da UCS', 'Filtros simultâneos e "Coleções" como agrupamento por curso', 'Filtros em blocos e visual formal, que reduz o engajamento'],
      ['Substack', 'Feed de posts com imagens', 'Chat, fora do escopo'],
      ['Medium', 'Página de leitura limpa e ações de interação', 'Paywall: a leitura deve ser livre'],
    ], [1.6, 4.2, 4.2], 'Fonte: elaborado pelo grupo (Anexo A).'),
    P('Três aprendizados guiaram os requisitos. Os repositórios acadêmicos já têm bons filtros, mas pouca descoberta: nenhum sugere trabalhos relacionados. As plataformas de conteúdo mostram que imagem e resumo curto atraem o leitor. E o LUME já é a fonte oficial, então o link dele é obrigatório para publicar, e o arquivo guardado na plataforma é só uma cópia opcional. O benchmark também decidiu uma dúvida que só apareceu no SDD: "Coleção", no RF#02, é o agrupamento por curso, como no LUME e na UCS.'),

    // 3
    H1('3. Funcionalidades e decisões de requisitos'),
    P('O RF#01 permite ao aluno formando cadastrar, editar e excluir o próprio TCC, com título, resumo simplificado, orientador, coorientador, ano/semestre, coleção (curso), link do LUME, arquivo DOCX, PDF ou EPUB e até 3 imagens. O RF#02 exibe um feed com os TCCs mais recentes e os tópicos mais explorados e permite buscar e filtrar os TCCs publicados (termo, ano, autor, orientador, tags e coleção), ver os detalhes e os trabalhos conexos e baixar o arquivo. As histórias US#01 e US#02, os casos de uso e as regras de acesso estão no Anexo A. O parecer pediu regras explícitas de publicação, rascunho, edição e acesso; a Tabela {T:decReq} resume as decisões, quase todas tomadas a partir do parecer, do Clarify (seção 7) ou das lacunas apontadas pelos testes.'),
    ...T('decReq', 'Decisões de requisitos', ['Tema', 'Regra decidida', 'Origem'], [
      ['Arquivo × link', 'Link do LUME obrigatório para publicar; arquivo é cópia opcional; sem arquivo, a página mostra "Acessar texto no LUME"', 'Parecer; benchmark'],
      ['Rascunho', 'Botão "Salvar como rascunho" a qualquer momento, exigindo só o título; também oferecido quando o link falha. Só o autor vê o rascunho', 'Parecer; UC01'],
      ['Edição', 'Só o autor edita. Se o link de um TCC publicado falhar na edição, a versão publicada continua no ar e o autor é avisado', 'Conferência do protótipo'],
      ['Exclusão', 'O autor exclui o próprio TCC. O orientador ou o coorientador pode excluir um TCC em que foi indicado por engano: ele volta a ser rascunho do aluno', 'Decisão do grupo'],
      ['Acesso', 'Visitante busca, lê e baixa; só o aluno formando publica; o professor vê no perfil os trabalhos que orienta ou coorienta', 'Parecer'],
      ['Busca', 'Coleção = curso. O termo ignora maiúsculas e acentos e casa o início de uma palavra; filtros e tags combinam por E; o filtro Orientador inclui o coorientador; mais recente primeiro', 'Clarify; testes'],
      ['Limites', '1 a 5 tags; até 3 imagens; título até 200 caracteres, resumo até 1.500, tag até 30; arquivo até 20 MB, imagem até 5 MB; semestre até o atual', 'UC01; parecer; testes'],
    ], [1.3, 6.4, 2.3], 'Fonte: elaborado pelo grupo (regras completas no Anexo A).'),
    P('**Modelagem e arquitetura.** O parecer apontou problemas nos diagramas de casos de uso, pacotes, sequência e atividades, e parte deles coincidiu com o que as IAs acharam no SDD. Todos foram redesenhados (Anexo B): o diagrama de casos de uso ganhou a hierarquia de atores e a fronteira do sistema; o de pacotes passou a usar só notação de pacotes, com dependências de cima para baixo; o de sequência do UC01 corrigiu a mensagem que saía do repositório para o LUME; os de atividades terminam em caminhos finais alternativos, com as condições escritas. O diagrama de classes ganhou o atributo coleção e os papéis de orientador e coorientador, e há um diagrama de sequência novo para a busca. A arquitetura é um monólito em camadas (controller, service, repository, model e dto) atrás de uma API REST, com uma aplicação React como cliente; o LUME, o login da UFRGS e o armazenamento de arquivos ficam atrás de interfaces, o que permite simular falhas nos testes (Figura {F:arquitetura}; detalhes no Anexo C).'),
    ...h.FIG('arquitetura', require('path').join(h.RAIZ, 'etapa3', 'figuras', 'figura-arquitetura.png'), 'Arquitetura proposta para a plataforma', 'Fonte: elaborado pelo grupo.', 0.92),
    P('**Protótipo.** O protótipo de alta fidelidade está em https://extreme500.github.io/subsTCCk/ e cobre as duas funcionalidades. Na Etapa 3 ele passou a aplicar todas as decisões da Tabela {T:decReq}: botão de rascunho, edição que não despublica, exclusão pelo autor e pelo orientador, limites de tamanho, lista de semestres até o atual e busca pelo início da palavra (telas no Anexo C).'),
    P('**Testes.** Os seis casos da Etapa 1 (CT01 a CT06) foram ampliados com classes de equivalência e análise de valor limite, com uma classe inválida por caso, até o CT54 (Anexo D). Todos foram executados: 38 testes automáticos rodam contra o código do protótipo e passam, e os casos que dependem da interface foram percorridos no navegador. Só o CT20 não pode ser verificado, porque o protótipo não consulta o LUME de verdade. Os testes acharam duas falhas no protótipo: o semestre atual (2026/2) não podia ser escolhido, e o termo "IA" encontrava trabalhos sobre "anomalias". As duas foram corrigidas.'),

    // 4
    H1('4. Processo de Engenharia de Software utilizado'),
    P('Na **Etapa 1**, o processo foi iterativo e principalmente manual: problema e pesquisa de campo, benchmark, requisitos, histórias, casos de uso, UML, casos de teste e protótipo. A IA entrou em tarefas pontuais, e cada saída foi revisada pelo grupo. Na **Etapa 2**, o grupo aplicou Spec-Driven Development (SDD) à busca (UC04), em duas ferramentas, e ampliou os testes com IA, sempre a partir do próprio material. Na **Etapa 3**, o grupo consolidou: aplicou o parecer, levou as decisões ao protótipo e aos diagramas e executou os testes. A Tabela {T:processo} compara as duas formas de trabalhar.'),
    ...T('processo', 'Processo da Etapa 1 e processo apoiado por IA', ['Atividade', 'Etapa 1', 'Etapas 2 e 3, com SDD e IA'], [
      ['Especificar', 'Requisitos, histórias e casos de uso escritos pelo grupo', 'A IA gera a especificação e indica a origem de cada requisito; o grupo revisa'],
      ['Esclarecer', 'Discussões informais', 'Perguntas explícitas, com opções e recomendação (Clarify); o grupo decide'],
      ['Planejar e dividir', 'Diagramas; divisão informal das tarefas', 'Plano que registra as divergências com os diagramas; tarefas numeradas, ligadas a requisitos e testes'],
      ['Implementar e testar', 'Protótipo; casos de teste executados à mão', 'Código e testes gerados; 38 testes automáticos contra o protótipo'],
      ['Verificar', 'Revisão manual', 'Matriz requisito → tarefa → teste; testes independentes escritos a partir das decisões do grupo'],
    ], [1.8, 3.4, 4.8], 'Fonte: elaborado pelo grupo.'),

    // 5
    H1('5. Uso de GenAI: ferramentas, estratégias, experimentos e resultados'),
    P('Na Etapa 1 o grupo usou o Gemini e o Claude em chat; nas Etapas 2 e 3, o **Claude Code** (modelo Claude Opus 5.5) e o **Antigravity** (modelo Gemini 4 Argon, com raciocínio High). A Tabela {T:sdlc} mostra onde a IA entrou no ciclo; o registro de cada experiência, com as perguntas do enunciado, está no Anexo F.'),
    ...T('sdlc', 'Uso da IA ao longo do ciclo de desenvolvimento', ['Etapa do ciclo', 'Artefato ou atividade', 'Ferramenta', 'Contribuição percebida'], [
      ['Requisitos', 'Formulário da pesquisa de campo', 'Gemini', 'Facilitou o processo mecânico de criar o questionário'],
      ['Requisitos', 'Problema, benchmark, requisitos, histórias e casos de uso', 'Sem IA', 'Base de todo o trabalho; as IAs depois acharam lacunas nela'],
      ['Modelagem', 'Diagramas de classes, pacotes e sequência', 'Gemini, revisão no Claude', 'Fundamentos corretos, mas 2 dos 6 problemas conhecidos estavam no de sequência'],
      ['Testes', 'Casos CT01 a CT06', 'Claude e Claude Code', 'Boa estrutura; usados como estavam'],
      ['Design UX', 'Protótipo de alta fidelidade', 'Claude Code', 'Rápido e fiel ao que o grupo imaginava'],
      ['Implementação (SDD)', 'Especificação, plano, tarefas, código e testes do UC04', 'Claude Code e Antigravity', 'Alta para achar ambiguidades; o código precisou de verificação independente'],
      ['Testes', 'Classes de equivalência e valor limite', 'Claude Code e Antigravity', 'Claude: alta. Gemini: baixa com o prompt simples, aproveitável com o refinado'],
      ['Verificação e documentação', 'Testes independentes, arquitetura, consolidação e rascunhos do relatório', 'Claude Code', 'Rápido e detalhado, mas extenso: o grupo revisou e enxugou'],
    ], [1.6, 3, 1.8, 3.6], 'Fonte: elaborado pelo grupo (Anexo F).'),
    P('**Estratégias.** Nos dois experimentos, as ferramentas receberam a mesma pasta de entrada e os mesmos prompts. No SDD, foram seis prompts fixos, um por fase, sem refinamento, para a comparação ser justa. Nos testes funcionais, um prompt simples e, na mesma conversa, um refinado, que fixava a estrutura da resposta e o critério de cobertura e proibia inventar regras que o relatório não define (Anexo G).'),
    P('**Um experimento concreto: ampliar os testes funcionais.** O artefato de partida foi do grupo: os casos CT01 a CT06 da Etapa 1, com o UC01 e o UC04. O CT04 já testava 5 e 6 tags e 3 e 4 imagens, mas misturava esses limites com um campo vazio. O prompt simples só pedia para ampliar os casos com classes de equivalência e valor limite. O refinado fixou a estrutura e acrescentou, entre outras, duas instruções: "cada caso inválido cobre uma única classe inválida" e "Quando o relatório não define a regra de uma entrada, NÃO invente: registre a entrada na seção 6" (Anexo G).'),
    P('**Refinar o prompt compensou.** Com o prompt simples, o Gemini inventou uma base de teste que contradizia o CT03 (por exemplo, o TCC D em 2025/2) e errou resultados a partir dela; com o refinado, corrigiu a base e isolou as classes inválidas. No Claude, a primeira versão já era cuidadosa, e o refinamento trocou deduções por 25 perguntas objetivas ao grupo, como o tamanho máximo do título. O grupo decidiu cada uma (200 caracteres no título, por exemplo, verificado pelo CT49), e elas viraram a pauta das decisões da Tabela {T:decReq}.'),

    // 6
    H1('6. Comparação entre as IAs e entre a solução do grupo e a da IA'),
    ...T('comparacao', 'Métricas das duas ferramentas', ['Métrica', 'Claude Code', 'Antigravity'], [
      ['SDD: requisitos na especificação / tarefas', '18 / 52', '10 / 25'],
      ['SDD: testes próprios aprovados', '53 de 53', '12 de 12'],
      ['SDD: problemas conhecidos da Etapa 1 encontrados', '5 de 6', '2 de 6'],
      ['SDD: testes independentes do grupo aprovados', '16 de 17', '13 de 17'],
      ['SDD: tempo aproximado', '~60 min', '~35 min'],
      ['Testes funcionais, prompt refinado: casos novos / lacunas', '24 / 25', '20 / 12'],
    ], [5.6, 2.2, 2.2], 'Fonte: pastas dos experimentos (Anexo E).'),
    P('**Entre as IAs.** O Claude Code foi mais minucioso e mais crítico consigo mesmo: na análise final, apontou falhas no próprio código. O Gemini foi mais rápido e enxuto, mas declarou "0 violações" e "nenhum desvio", o que a inspeção não confirmou. Nos casos de teste da Etapa 1, as duas implementações empataram (5 de 5); as diferenças só apareceram nas decisões e nos casos-limite, que só os testes independentes do grupo cobriam. Nos testes funcionais, o Claude foi mais completo e não inventou dados; o Gemini trouxe uma classe que o Claude deixou de fora (semestre posterior ao atual) e que entrou na versão final.'),
    P('**Entre o grupo e a IA.** As decisões de domínio vieram dos artefatos do grupo: quando houve dúvida, como em "Coleção", foi a intenção registrada no RF#02 e no benchmark que decidiu. Os artefatos gerados com IA na Etapa 1 não vieram livres de erro: dois dos seis problemas conhecidos estavam no diagrama de sequência gerado com o Gemini, e o diagrama de atividades gerado com o Claude Code abreviou as mensagens dos fluxos alternativos. A revisão humana da época não pegou esses erros; a revisão cruzada do SDD pegou. Onde houve verificação, a IA melhorou o resultado, e não só a velocidade (testes, rastreabilidade, lista de inconsistências). Onde não houve, ela só acelerou, e às vezes acelerou um erro: a mesma regra de busca saiu diferente no protótipo e nas duas implementações do SDD, e as três encontravam "IA" dentro de "anomalias".'),

    // 7
    H1('7. Uso de SDD e reflexão sobre um SDLC apoiado por IA'),
    P('No SDD, uma especificação estruturada, escrita antes do código, guia o plano, as tarefas, a implementação e os testes, e passa a ser a principal entrada do agente de IA. Böckeler (2025) distingue três níveis: spec-first, spec-anchored e spec-as-source; o experimento foi spec-first. Entre as ferramentas pesquisadas (GitHub Spec Kit, Kiro, Tessl e OpenSpec; Anexo E), o grupo escolheu o **Spec Kit**, porque as fases dele são as do enunciado (Specify, Clarify, Plan, Tasks, Implement, Analyze) e ele não depende de um agente específico. O grupo o adaptou: uma constituição com seis princípios (rastreabilidade, testes primeiro, fidelidade ao domínio, camadas, simplicidade e ambiguidade explícita), modelos em português e um prompt por fase.'),
    P('**Benefícios:** rastreabilidade de requisito a tarefa e a teste sem trabalho manual; ambiguidades levantadas antes do código; uma auditoria do material da Etapa 1 (27 inconsistências apontadas pelo Claude e 9 pelo Gemini); uma implementação testada em menos de uma hora de máquina. **Limitações:** a especificação só é tão boa quanto as respostas do Clarify; há muito texto para revisar (cerca de 300 linhas por plano); a IA escreve os testes e o código que eles verificam, então passar nos próprios testes prova pouco; e a profundidade varia muito entre ferramentas com as mesmas entradas. O SDD compensou numa funcionalidade com regras e casos-limite, como a busca; em telas simples, o custo de especificar e revisar tende a superar o ganho.'),
    P('**Percepções do grupo:** "A única parte que de fato exigiu esforço nosso foi a do Clarify, já que precisamos discutir quais seriam as respostas para as perguntas das IAs, e também, no fim, decidimos escolher sempre uma das opções dentre as que elas davam, justamente para fornecer uma melhor comparação." Num ciclo de desenvolvimento apoiado por IA, o trabalho humano se concentra em três pontos: dar contexto (o material da Etapa 1 e a constituição), decidir (Clarify e lacunas) e verificar (testes independentes e revisão cruzada). Sem esses três, a IA produz rápido, mas sem garantia.'),

    // 8
    H1('8. Decisões humanas'),
    P('A Tabela {T:decisoes} reúne as principais propostas das IAs e o que o grupo fez com elas; a lista completa está no Anexo E.'),
    ...T('decisoes', 'Propostas das IAs e decisões do grupo', ['Proposta da IA', 'Decisão', 'Por quê'], [
      ['Claude (Clarify): "Coleção" é a área temática', 'Rejeitada: coleção é o curso', 'O RF#02 usa "Coleção" como o LUME e a UCS; o tema já é coberto pelas tags'],
      ['Gemini (Clarify): manter só os 5 critérios dos diagramas e tratar coleção como tags', 'Aceita só no experimento', 'Nenhuma opção do Gemini tratava a coleção como curso, e o grupo respondeu só com as opções oferecidas'],
      ['Gemini (Clarify): ordem de cadastro; detalhes sem trabalhos conexos', 'Rejeitadas', 'O objetivo é descobrir trabalhos recentes e relacionar TCCs (UC06)'],
      ['Claude: acentos ignorados só no termo, decidido sem perguntar', 'Rejeitada: em todos os campos', '"Joao" deve encontrar "João" em qualquer campo'],
      ['Ambas: o termo casa qualquer trecho', 'Modificada: início de palavra', 'Evita que "IA" traga "anomalias", sem perder os plurais'],
      ['Claude: arquivo ausente gera a mensagem de falha de conexão', 'Rejeitada: fluxo próprio no UC04', 'Pedir para "verificar a conexão" leva a tentativas inúteis'],
      ['Gemini (Analyze): "0 violações da constituição"', 'Rejeitada após inspeção', 'O controller guardava estado de tela, e o armazenamento estava fora dos diagramas'],
      ['Antigravity (testes): classe "semestre posterior ao atual"', 'Aceita, com o ano corrigido', 'É consequência de "TCC já defendido"; ele assumira 2025 como ano corrente'],
      ['Antigravity (prompt simples): base de teste própria', 'Rejeitada', 'Contradizia a tabela do CT03'],
    ], [3.6, 2.6, 3.8], 'Fonte: decisoes-clarify.md e registro-experimentos.md (Anexo E).'),
    P('O caso da coleção mostra o limite da decisão humana: a mesma dúvida, perguntada de outro jeito, levou a outra resposta. Como o Gemini não ofereceu "curso" entre as opções, a implementação dele ficou sem o filtro por curso, e dois testes independentes falharam por isso. Registrar e revisar as respostas do Clarify (arquivo decisoes-clarify.md) faz parte do processo.'),

    // 9
    H1('9. Principais problemas encontrados e como foram validados e corrigidos'),
    LI('**No material da Etapa 1:** coleção sem atributo nas classes; mensagens dos fluxos alternativos com textos diferentes; uma seta saindo do repositório para o LUME no diagrama de sequência; um método na classe errada; o visitante fora do diagrama de casos de uso; dois nomes para o mesmo ator. Cada achado das IAs foi conferido nos originais antes de entrar na lista, e todos foram corrigidos na especificação e nos diagramas (Anexos A, B e E).'),
    LI('**No protótipo:** o semestre atual fora da lista e o termo casando trechos de palavras foram achados pelos testes de valor limite e pela classe CI26; rascunho sem link, edição que despublicava e falta de exclusão foram achados na conferência para o parecer. Tudo foi corrigido na Etapa 3 e ganhou testes automáticos (CT33, CT41 e CT49 a CT54).'),
    LI('**No código do SDD:** os erros (mensagem errada para arquivo ausente, termo curto, ano inválido ignorado, simulação de falha só aparente) foram confirmados pelos 17 testes independentes e pela leitura do código. O código ficou como as ferramentas entregaram, para a comparação refletir a saída real; as correções viraram decisões.'),
    LI('**No próprio experimento:** o Clarify veio em formatos diferentes (perguntas juntas no Claude, uma por vez no Gemini), e os tempos não são diretamente comparáveis. Há um viés possível, porque o Claude Code também ajudou a conduzir os experimentos; para reduzi-lo, as entradas foram idênticas, os testes independentes seguem só os casos de teste e as decisões do grupo, e tudo pode ser reexecutado (Anexo G).'),
    LI('**No relatório:** as afirmações da IA sobre o próprio processo também precisaram de conferência. O rascunho da Etapa 2 dizia que o grupo respondera ao Clarify do Claude fora das opções oferecidas, o que não aconteceu; o grupo conferiu nos registros e corrigiu.'),

    // 10
    H1('10. Conclusão'),
    P('O grupo tira seis lições sobre Engenharia de Software na era da GenAI. **As decisões continuam humanas**, e a forma da pergunta pesa: as escolhas que mudaram o comportamento do sistema vieram das respostas do grupo. **Passar nos próprios testes não basta**: só a verificação independente mostrou as diferenças entre as ferramentas. **A autoavaliação da IA varia**: uma ferramenta apontou as próprias falhas, a outra declarou conformidade sem tê-la, então a análise da IA serve como lista do que conferir, não como veredito. **Refinar o prompt compensa**, sobretudo na ferramenta mais fraca: escrever bem o pedido é parte do trabalho de engenharia. **O SDD também revisa o que já existe**: o maior ganho imediato foi a auditoria do material da Etapa 1, porque a especificação obriga a ler requisitos e diagramas juntos, e as contradições aparecem. E **o gargalo muda de lugar**: escrever deixa de ser o trabalho principal, e ler, decidir e verificar passam a ser, o que exige mais entendimento do domínio, e não menos. É o que resume a frase do enunciado: "A IA pode produzir artefatos. O grupo precisa produzir entendimento, decisões e evidências."'),
    P('**O que descobrimos durante o processo que não sabíamos quando começamos?** O que já achávamos que era uma forte ferramenta apenas se mostrou ainda mais poderosa à medida que nós a orientamos com a base da Engenharia de Software e tudo que ela traz consigo (requisitos, testes, arquitetura). Ainda, além de já ter uma base forte com o que entregamos para ela, a IA conseguiu ter autonomia própria o suficiente para encontrar as lacunas e os erros da nossa especificação.'),

    H1('Referências'),
    h.PS('BÖCKELER, Birgitta. Understanding Spec-Driven-Development: Kiro, spec-kit, and Tessl. martinfowler.com, out. 2025. Disponível em: https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html. Acesso em: 12 nov. 2026.'),
    h.PS('DELIMARSKY, Den. Spec-driven development with AI: get started with a new open source toolkit. The GitHub Blog, 2 set. 2025. Disponível em: https://github.blog/2025-09-02-spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/. Acesso em: 12 nov. 2026.'),
    h.PS('FISSION-AI. OpenSpec. GitHub, 2026. Disponível em: https://github.com/Fission-AI/OpenSpec. Acesso em: 12 nov. 2026.'),
    h.PS('GITHUB. Spec Kit. GitHub, 2026. Disponível em: https://github.com/github/spec-kit. Acesso em: 12 nov. 2026.'),
    h.PS('KIRO. Specs: concepts. Documentação do Kiro, 2026. Disponível em: https://kiro.dev/docs/specs/concepts. Acesso em: 12 nov. 2026.'),
  ];
};
