# Análise de coerência: Buscar e Filtrar TCCs

> O agente não pôde gravar este arquivo, porque o ambiente de subagente bloqueia a gravação de relatórios. O conteúdo abaixo é a resposta da Fase 6, copiada sem alterações pelo experimentador.

**Pasta:** `specs/001-buscar-filtrar-tccs` | **Data:** 2026-11-08

**Artefatos analisados:**

- `.specify/memory/constitution.md`
- `spec.md`, `plan.md`, `tasks.md`
- `src/**`, `tests/**`
- `contexto/relatorio-etapa1.md`, `contexto/diagramas/*.png`, `contexto/diagramas/transcricao-diagramas.md`

**Método:**

- leitura cruzada dos artefatos;
- execução de `node --test`;
- sondagens somente leitura do comportamento (`node -e`) para confirmar os achados A04, A05, A06 e A07.

Nenhum arquivo existente foi alterado.

## 1. Achados

| ID | Categoria | Severidade | Local | Resumo | Recomendação |
|---|---|---|---|---|---|
| A01 | inconsistência | ALTA | spec FR-003a e Entidades-chave; plan D1/D2; `src/model/TCC.js`, `src/dto/FiltroBusca.js` × `classes.png` (TCC, FiltroBusca) × relatório RF#01 e UC01 passo 2 | A coleção (curso de origem, Esclarecimentos P1) é um dado novo que nenhum artefato da Etapa 1 coleta: o formulário do UC01 não tem o campo e os diagramas não têm o atributo. O filtro só funciona com os dados iniciais preenchidos à mão; num sistema real com o cadastro atual ele nunca encontraria nada. | Incluir o curso de origem no RF#01/UC01 (campo do formulário) e no diagrama de classes (`TCC.colecao`, `FiltroBusca.colecao`). Até lá, manter a dependência explícita em "Fora de escopo" da spec. |
| A02 | violação da constituição | MÉDIA | `src/controller/TccController.js:6` (`import { FormatoArquivo } from '../model/FormatoArquivo.js'`) | O princípio IV manda seguir as dependências do diagrama de pacotes, que só tem controller → service e controller → dto. O controller importa `model` para montar a tabela de tipos MIME. A dependência não está no diagrama nem foi registrada no plan ou nos desvios. | Mover o mapeamento formato → MIME para o service (ex.: `transferirArquivo` devolve também o MIME) ou para um DTO, ou registrar a divergência. |
| A03 | inconsistência | MÉDIA | `classes.png` (TccController, TccService) × plan D5, D6, D7 × `TccController.js`, `TccService.js` | O código diverge da assinatura dos diagramas: `buscarTccs` devolve `ResultadoBuscaDTO`, não `List<TccDTO>`; `baixarArquivo` devolve `Promise<RespostaDownloadDTO>`, não `File`. Há também o método novo `transferirArquivo` e a interface nova `ArmazenamentoArquivos`. Tudo está registrado no plan (princípio III cumprido), mas os diagramas ficaram desatualizados. | Atualizar os diagramas de classes e de pacotes na entrega da Etapa 2, ou anexar a tabela de divergências do plan. |
| A04 | inconsistência | MÉDIA | `src/repository/ArmazenamentoArquivosEmMemoria.js` (`transferir`, caminho inexistente) → `TccService.transferirArquivo` → `TccController.baixarArquivo` | Arquivo cadastrado mas ausente do armazenamento vira `FalhaTransferenciaError`, e o usuário recebe "verifique a sua conexão com a internet e tente novamente" com `podeTentarNovamente: true`. A causa real é falta de dado, e nova tentativa nunca resolve. Confirmado por sondagem. | Na spec, definir o comportamento para arquivo ausente no armazenamento. No código, separar esse erro do erro de transferência. |
| A05 | ambiguidade | MÉDIA | spec FR-004 (P2); `TccRepositoryEmMemoria.atendeTermo` | O termo com várias palavras é tratado como um único trecho contíguo. "anomalias Carlos" não encontra o TCC A, embora as duas palavras estejam nele (título e orientador). A spec não diz se as palavras se combinam (E, em qualquer ordem) ou formam uma frase. | Perguntar ao usuário. Se a resposta for "palavras com E em qualquer ordem", ajustar FR-004 e acrescentar teste. |
| A06 | ambiguidade | MÉDIA | spec FR-004 (correspondência parcial) × objetivo do RF#2; `atendeTermo` | Correspondência parcial sem limite gera ruído em termos curtos. O termo "IA" devolve A, B e C, porque casa "anomal**ia**s", "estratég**ia**s" etc., e não só o TCC com a tag IA. Isso vai contra a meta de uma descoberta mais precisa. | Definir regra para termos curtos (casar no início de palavra ou exigir tamanho mínimo) e registrar em Esclarecimentos. |
| A07 | ambiguidade | MÉDIA | spec FR-004 × FR-007; plan "Decisões técnicas" e "Riscos"; `normalizacao.minusculas` | Os acentos são tratados de forma assimétrica: o termo livre ignora acentos, mas os filtros de autor e orientador não. Na sondagem, `orientador: "Profa Ana"` não encontrou "Profª Ana Reis". A decisão não foi confirmada com o usuário. | Confirmar com o usuário e, se for o caso, usar `normalizarTexto` também nesses filtros (mudança local). |
| A08 | subespecificação | MÉDIA | spec FR-014; relatório UC04 (sem FA); plan "Riscos"; `visualizarDetalhes`/`baixarArquivo` | Pedir um TCC inexistente ou em rascunho pelo id lança `TccNaoEncontradoError` sem mensagem ao usuário. Nenhum caso de uso define o texto. | Definir no relatório (novo FA do UC04/UC05) a mensagem para trabalho inexistente ou indisponível. |
| A09 | subespecificação | MÉDIA | spec Premissas ("Filtro de orientador e coorientador") e FR-004; `TccRepositoryEmMemoria` | A exclusão do coorientador do filtro de orientador e do termo livre é uma premissa que não foi perguntada no Clarify (limite de 5 perguntas). Ela afeta a US#04 ("identificar potenciais orientadores"): um professor que só coorientou não é encontrado pelo nome. | Levar ao usuário numa nova sessão de Clarify. |
| A10 | inconsistência | BAIXA | spec, cabeçalho ("Status: Rascunho (esclarecida...)") e Premissas ("Pode ser revisto na fase Clarify") | O texto ficou desatualizado: o Clarify já terminou sem tratar o item, e o status continua "Rascunho" com o código entregue. | Atualizar o status e a frase ("não confirmado no Clarify; ver A09"). |
| A11 | inconsistência | BAIXA | spec FR-003 ("na tela 'Buscar TCC'"), FR-015/FR-015a ("botão") × constituição V | A spec fala em tela e botão, mas a constituição exclui interface gráfica; a tradução para a API (`arquivoDisponivel`) está só no plan. | Descrever em termos de ação, ou registrar que tela/botão correspondem a operações da API. |
| A12 | violação da constituição | BAIXA | `src/dto/TccDTO.js` (`static deTcc(tcc)`) × `pacotes.png` (dto sem dependências de saída) | O mapeamento modelo → DTO faz o pacote dto depender conceitualmente de model, o que não está no diagrama. A dependência existe só via JSDoc, sem `import` em execução. | Mover o mapeamento para o service ou registrar a divergência. |
| A13 | violação da constituição | BAIXA | `tasks.md` T001, T008, T014, T022, T030, T034, T037, T042, T047, T048, T051 | O princípio I diz que toda tarefa indica os requisitos que atende. Essas tarefas citam só o plan ou a constituição (infraestrutura ou execução de testes). | Aceitar como transversais declaradas, ou citar os FRs que elas viabilizam. |
| A14 | violação da constituição | BAIXA | `tests/ct06-falha-download.test.js` ("CT06 passo 1"); `tasks.md`, Desvios item 5 | Princípio II: um teste da História 3 já passava antes da implementação da História 3, porque só usa busca e detalhes. O desvio está registrado. | Aceitar (é pré-condição do CT06) ou marcar o teste como pré-condição. |
| A15 | subespecificação | BAIXA | plan Contratos (`FiltroInvalidoError`); `src/dto/FiltroBusca.js` | A spec não diz o que fazer com ano inválido; o plan decidiu lançar exceção sem mensagem ao usuário. | Registrar na spec como premissa (o ano vem de seleção) ou definir mensagem. |
| A16 | ambiguidade | BAIXA | relatório UC04 passo 2 ("Data/Ano"); spec FR-003/FR-006 | "Data/Ano" foi implementado só como ano. Não se decidiu se "Data" significa intervalo, semestre ou data de defesa, e o semestre não é filtrável. | Confirmar com o usuário; se for só o ano, renomear o critério na spec. |
| A17 | lacuna de cobertura | BAIXA | `tests/busca-tags-colecao.test.js`; `FiltroBusca.js` | Duas regras implementadas não têm teste: comparar tags ignorando acentos ("robotica" × "Robótica") e remover tags repetidas no filtro. | Acrescentar os dois testes citando FR-008. |
| A18 | lacuna de cobertura | BAIXA | `tests/acesso-leitura.test.js` (testes FR-001) | Os testes de FR-001 passam por construção: a API não tem parâmetro de credencial, então não há caso negativo possível. | Documentar que FR-001 é garantido pela assinatura da API. |
| A19 | lacuna de cobertura | BAIXA | `tasks.md`, Desvios item 1; plan "Contexto técnico" | A suíte só rodou no Node v26.13.0. A compatibilidade com Node 20, que é restrição do grupo, foi inferida pelas APIs usadas, sem execução. | Rodar `node --test` num Node 20 antes da entrega. |
| A20 | duplicação | BAIXA | spec "Casos-limite" × FR-004, FR-008, FR-011, FR-015a; plan "Rastreabilidade" × origens em `tasks.md` | Regras repetidas em mais de um lugar, e a mesma rastreabilidade mantida em dois artefatos, aumentam o risco de divergência. | Nos casos-limite, apenas referenciar os FRs; manter a matriz num só artefato. |
| A21 | inconsistência | BAIXA | `tasks.md` T051 ("corrigir o plano") × instrução da fase Implement (não alterar `plan.md`) | Uma tarefa previa alterar o plan, o que era proibido. Não houve efeito (Desvios item 8). | Redigir como "registrar divergência". |
| A22 | inconsistência | BAIXA | `TccService.compararMaisRecentePrimeiro` (desempate por `id`) × plan "Contratos" | O desempate final por id não está no plan nem na spec. Está registrado em Desvios (item 4). | Incorporar ao plan na próxima revisão. |
| A23 | subespecificação | BAIXA | plan "Decisões técnicas"; `TccRepositoryEmMemoria.js` | As regras de correspondência (FR-004 a FR-008) ficam na implementação em memória. Outra implementação de `TccRepository` teria de reproduzi-las, e os testes só cobrem a em memória. | Documentar as regras no contrato de `buscarPorFiltros` ou extrair um módulo de critérios. |
| A24 | inconsistência | BAIXA | `tests/apoio/fabricas.js` (`fotografarRepositorio`) × contrato `TccRepository` | Os testes de FR-002 leem `tccRepository.tccs`, detalhe interno que não faz parte da interface. | Aceitar como acoplamento de teste ou expor a leitura só no dublê. |

## 2. Matriz de cobertura (FR → tarefas → testes)

| FR | Tarefas | Testes (arquivo: nome resumido) | Com teste? |
|---|---|---|---|
| FR-001 | T021, T033, T041 | `acesso-leitura`: busca sem credencial; detalhes sem credencial; "FR-001, FR-002 (SC-006)" fluxo completo | Sim (estrutural, A18) |
| FR-002 | T021, T025, T033, T041 | `acesso-leitura`: alterar DTOs da busca; alterar DTO dos detalhes; fluxo SC-006 | Sim |
| FR-003 | T019, T024, T029 | `busca-tags-colecao`: "FR-003, FR-005 (SC-005)"; instância de FiltroBusca; ano inválido | Sim |
| FR-003a | T005, T013, T019, T024, T027 | `busca-tags-colecao`: cenário 7; TCC sem curso | Sim |
| FR-004 | T003, T013, T017, T018, T023, T027 | `busca-termo-livre`: 6 testes; `ct05`: passo 3 | Sim |
| FR-005 | T016, T017, T027 | `ct03`: SC-001; `ct05`: passo 3; `busca-tags-colecao`: SC-005 | Sim |
| FR-006 | T013, T016, T019, T027 | `ct03`: SC-001; `busca-tags-colecao`: dois semestres | Sim |
| FR-007 | T003, T016, T018, T023, T027 | `ct03`: SC-001; `busca-termo-livre`: 3 testes FR-007 | Sim |
| FR-008 | T004, T013, T019, T024, T027 | `busca-tags-colecao`: 5 testes FR-008 | Sim (parcial, A17) |
| FR-009 | T002, T009, T016, T017, T020, T028 | `ct03`: E oculto; `ct05`: passo 4 e variação; `busca-sem-criterios`: SC-008 | Sim |
| FR-010 | T016, T020, T025, T028 | `ct03`: campos do item; `busca-sem-criterios`: 2 testes de ordem | Sim |
| FR-011 | T020, T024, T028, T029 | `busca-sem-criterios`: 3 testes | Sim |
| FR-012 | T007, T016, T017, T019, T026, T029 | `ct03`: variação; `ct05`: 3 testes; `busca-tags-colecao`: FR-008/012; `busca-sem-criterios`: FR-011/012 | Sim |
| FR-013 | T003, T004, T005, T013, T025, T031, T032, T036 | `detalhes`: 3 testes; `ct03`: passo 4 | Sim |
| FR-014 | T002, T006, T009, T031, T035, T040, T044 | `detalhes`: E não apresentado; id inexistente; download de E/inexistente | Sim |
| FR-015 | T002, T004, T010, T011, T039, T040, T045, T046 | `ct06`: passo 4; `detalhes`: DOCX de B, EPUB de C, A oferece download | Sim |
| FR-015a | T005, T006, T012, T025, T031, T036, T040, T044 | `detalhes`: D sem botão + link do LUME; download de D lança erro | Sim |
| FR-016 | T006, T007, T010, T038, T039, T043, T045, T046 | `ct06`: passos 2-3, passo 4, variação, falha antes do 1º byte | Sim |

**FR sem teste:** nenhum.

**Critérios de sucesso:** todos têm teste.

| SC | Teste |
|---|---|
| SC-001 | `ct03` |
| SC-002 | `ct05` (variação) |
| SC-003 | `ct05` (passo 4) |
| SC-004 | `ct06` |
| SC-005 | `busca-tags-colecao` |
| SC-006 | `acesso-leitura` |
| SC-007 | `detalhes` |
| SC-008 | `busca-sem-criterios` |

**Casos de teste do relatório:**

- CT03: `tests/ct03-buscar-filtros-combinados.test.js` (passos 1–4 e variação).
- CT05: `tests/ct05-busca-sem-correspondencia.test.js` (passos 3–4 e variação).
- CT06: `tests/ct06-falha-download.test.js` (passos 1–4, variação e um caso extra).

## 3. Inconsistências no material da Etapa 1

| ID | Local exato | Inconsistência | Tratamento nesta feature |
|---|---|---|---|
| E01 | relatório §3.2.1 (RF#02) e §3.2.1.3 UC04 passo 2 × `atividades-uc04.png`, nó "Inserir termos e/ou selecionar filtros (Ano, Autor, Orientador, Tags)" × `classes.png`, `FiltroBusca` | O relatório tem 5 filtros (inclui Coleções); o diagrama de atividades e `FiltroBusca` têm 4. | Esclarecimentos P1; plan D1 |
| E02 | relatório RF#02 e UC04 passo 2 ("Coleções") × `classes.png` (TCC, FiltroBusca) | "Coleção" não é definida em nenhum lugar e não existe como atributo nem classe. | P1 (curso de origem); A01 |
| E03 | relatório UC04 FA01 × CT03 "Variação" × `atividades-uc04.png`, nó "Sistema exibe 'Nenhum trabalho encontrado…'" | A mensagem aparece em três versões: completa com ponto final (UC04, CT05), sem o ponto final (CT03) e truncada (diagrama). | Spec, Divergências; texto do UC04 |
| E04 | relatório UC04 FA02 × `atividades-uc04.png`, nó "Sistema exibe 'Ocorreu um erro durante o download, verifique a sua conexão'" | A mensagem está truncada no diagrama. | Spec, Divergências; texto do UC04 |
| E05 | relatório UC01 FA01 × `atividades-uc01.png` ("…obrigatórios corretamente") | Mensagem diferente entre texto e diagrama. | Fora de escopo (UC01) |
| E06 | relatório UC01 FA02 × `atividades-uc01.png` ("A URL informada não pertence ao domínio do LUME") | O diagrama omite "ou está inacessível" e a pergunta sobre rascunho. | Fora de escopo (UC01) |
| E07 | CT01 Entrada ("Prof. Carlos Lima") × CT03 tabela/Entrada ("Profº Carlos Lima") × CT03 passo 2 ("Carlos Lima") | O nome do mesmo orientador está grafado de três formas. | FR-007 (correspondência parcial) |
| E08 | `classes.png` (`ArquivoTcc`) × `pacotes.png`, pacote model (`ArquivoTCC`) | O nome da classe difere entre os diagramas. | Plan D8 |
| E09 | UC04 passo 7 × `atividades-uc04.png`, nó "Exibir detalhes do TCC (resumo, imagens, tags e trabalhos conexos)" × `classes.png`, `TccDTO` | O conteúdo dos detalhes é diferente em cada fonte, e "trabalhos conexos" é o UC06 («extend» UC05), não o UC04. | FR-013, Fora de escopo; D4, D11 |
| E10 | `casos-de-uso.png` (UC05 "Visualizar Detalhes do TCC") × relatório §3.2.1.3 | O UC05 não tem descrição textual; o comportamento dele está dentro do UC04 (passos 6–9). | Detalhes tratados no UC04 |
| E11 | UC04 "Ator principal" (inclui Visitante) e US#04 ("aluno ingressante ou pesquisador") × `casos-de-uso.png` (sem ator Visitante) × `classes.png` (só Professor e AlunoFormando herdam de Usuario) | Os atores leitores não coincidem entre as três fontes. | FR-001 |
| E12 | `atividades-uc01.png`, raia "Aluno Graduando" × relatório ("Aluno Formando") | O mesmo ator tem nomes diferentes. | Fora de escopo (UC01) |
| E13 | UC04 FA01 ("O fluxo retorna ao passo 5") × UC04 passos 3–4 × `atividades-uc04.png` (volta a "Inserir termos…") | O ponto de retorno é incoerente: o usuário redefine critérios (passo 3) e pesquisa (passo 4), mas o texto manda voltar ao passo 5. | Spec, Divergências; FR-012 |
| E14 | `classes.png`: `FiltroBusca.tags: String`, `TccDTO.tags: String`, `FeedDTO.tccsRecentes: TccDTO`, `TccDTO.resumoSimplificado` sem tipo × TCC ◇— Tag (1..5) | Atributos no singular onde deveria haver coleção, e um atributo sem tipo. | Plan D3, D4 |
| E15 | `classes.png`, TCC (0..n) — Professor (1..2) sem papéis × RF#01 e UC01 passo 2 (orientador; coorientador opcional) | A associação não distingue orientador de coorientador. | Plan D10 |
| E16 | `classes.png` `TccService.cadastrarTCC`/`editarTCC` × `sequencia-uc01.png`, mensagem 2 `cadastrarTcc(tcc)` × `TccController.cadastrarTcc`/`editarTcc` | A grafia dos métodos é inconsistente. | Fora de escopo |
| E17 | `sequencia-uc01.png`, mensagem 6 "TccRepository - - > LUME: status" | Há um retorno do repositório para o LUME sem chamada anterior; o esperado é LUME → ValidadorLumeService. | Fora de escopo |
| E18 | `sequencia-uc01.png`, mensagem 3 "TccService → TccService: validarCamposObrigatorios()" × `classes.png` (método de `TCC`) | Uma auto-chamada do serviço usa um método que pertence a `TCC`. | Fora de escopo |
| E19 | `classes.png` `validarIntegridadeLink(link: Url)` × `TCC.linkLume: String` | O tipo `Url` não está definido. | Fora de escopo (UC03) |
| E20 | UC01 passo 6 ("caso existente") e `classes.png` (ArquivoTcc 0..1) × UC04 pós-condição e passos 8–9 | O arquivo é opcional no cadastro, mas o UC04 não tem fluxo para TCC sem arquivo. | P4; FR-015a |
| E21 | US#04 cenário 2 ("filtro respectivo" da "área da computação") × UC04 passo 2 (sem filtro de área) × `classes.png` (`Area` fora de `FiltroBusca`) | O filtro por área citado na user story não existe no caso de uso. | P1 (cenário associado à coleção) |
| E22 | `atividades-uc04.png`, raia "Armazenamento de Arquivos" × `classes.png`/`pacotes.png` (só LUME como externo) | O armazenamento não tem contraparte estrutural nos diagramas. | Plan D7 |
| E23 | `classes.png`: `TccController.baixarArquivo(id): File` × `TccService.obterArquivo(id): ArquivoTcc` (só metadados) | Nenhuma classe transfere o conteúdo do arquivo. | Plan D7 (`transferirArquivo`) |
| E24 | `pacotes.png`: `dto` na Apresentação, com repository → dto e service → dto | A camada de dados depende de um pacote da apresentação. | Mantido conforme o diagrama |
| E25 | relatório §3.2.1, "Problemas…" ("RF#1", "RF#2") × tabela ("RF#01", "RF#02") | Os identificadores têm grafia diferente. | Registrado |
| E26 | UC04 FA02 × CT06 "Resultados esperados" ("nenhum arquivo incompleto"; "página continua aberta") | O caso de teste acrescenta requisitos que não estão no caso de uso. | Incorporados ao FR-016 |
| E27 | UC04 "Pré-condição" ("o TCC já possui registro prévio… (status PUBLICADO)") | A pré-condição fala de um TCC específico antes da busca e não cobre base vazia nem id inexistente. | FR-009, FR-011, FR-014; A08 |

## 4. Métricas

| Métrica | Valor |
|---|---|
| Requisitos funcionais (FR) | 18 (FR-001 a FR-016, mais FR-003a e FR-015a) |
| FR com pelo menos um teste | 18 de 18 (100%) |
| SC com teste | 8 de 8 (100%) |
| CTs automatizados (CT03, CT05, CT06) | 3 de 3 |
| Tarefas concluídas | 52 de 52 |
| Achados CRÍTICA / ALTA / MÉDIA / BAIXA | 0 / 1 / 8 / 15 (total 24) |
| Achados por categoria | inconsistência 8; ambiguidade 4; subespecificação 4; violação da constituição 4; lacuna de cobertura 3; duplicação 1 |
| Inconsistências no material da Etapa 1 | 27 (E01–E27): 18 tratadas nesta feature, 7 de UC01–UC03 fora de escopo, 2 apenas registradas |
| Testes automatizados | 53, em 8 arquivos (`node --test`, Node v26.13.0) |
| Testes aprovados | 53 de 53 (100%); 0 falhas, 0 ignorados |
