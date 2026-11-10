# Histórico git da execução no Claude Code

A pasta original `claude-code/` era um repositório git com um commit por fase do SDD. Como ela foi copiada para este repositório sem a pasta `.git`, o histórico fica registrado aqui.

```text
c2c983c 2026-11-08 06:30:24 -0300 Fase 0: pacote de entrada

 .specify/memory/constitution.md             |  27 +++
 .specify/templates/plan-template.md         |  55 ++++++
 .specify/templates/spec-template.md         |  67 +++++++
 .specify/templates/tasks-template.md        |  44 +++++
 LEIA-ME.md                                  |  20 ++
 contexto/diagramas/atividades-uc01.png      | Bin 0 -> 76587 bytes
 contexto/diagramas/atividades-uc04.png      | Bin 0 -> 137288 bytes
 contexto/diagramas/casos-de-uso.png         | Bin 0 -> 48436 bytes
 contexto/diagramas/classes.png              | Bin 0 -> 360744 bytes
 contexto/diagramas/pacotes.png              | Bin 0 -> 190742 bytes
 contexto/diagramas/sequencia-uc01.png       | Bin 0 -> 149319 bytes
 contexto/diagramas/transcricao-diagramas.md |  94 ++++++++++
 contexto/relatorio-etapa1.md                | 280 ++++++++++++++++++++++++++++
 13 files changed, 587 insertions(+)
6a4e4a1 2026-11-08 06:34:00 -0300 Fase 1 (Specify) + perguntas da Fase 2

 specs/001-buscar-filtrar-tccs/clarify-perguntas.md |  87 ++++++++++++
 specs/001-buscar-filtrar-tccs/spec.md              | 158 +++++++++++++++++++++
 2 files changed, 245 insertions(+)
8954e62 2026-11-08 06:49:01 -0300 Fase 2 (Clarify)

 specs/001-buscar-filtrar-tccs/spec.md | 55 ++++++++++++++++++++++++-----------
 1 file changed, 38 insertions(+), 17 deletions(-)
3021940 2026-11-08 06:53:39 -0300 Fase 3 (Plan)

 specs/001-buscar-filtrar-tccs/plan.md | 294 ++++++++++++++++++++++++++++++++++
 1 file changed, 294 insertions(+)
a4b9eb5 2026-11-08 06:56:11 -0300 Fase 4 (Tasks)

 specs/001-buscar-filtrar-tccs/tasks.md | 231 +++++++++++++++++++++++++++++++++
 1 file changed, 231 insertions(+)
806a19b 2026-11-08 07:04:19 -0300 Fase 5 (Implement)

 package.json                                     |  13 +++
 specs/001-buscar-filtrar-tccs/tasks.md           | 118 +++++++++++----------
 src/app.js                                       |  23 +++++
 src/controller/TccController.js                  |  74 ++++++++++++++
 src/controller/mensagens.js                      |   9 ++
 src/dto/FiltroBusca.js                           |  49 +++++++++
 src/dto/RespostaDownloadDTO.js                   |  14 +++
 src/dto/ResultadoBuscaDTO.js                     |  13 +++
 src/dto/TccDTO.js                                |  56 ++++++++++
 src/model/AlunoFormando.js                       |   9 ++
 src/model/ArquivoTcc.js                          |   9 ++
 src/model/FormatoArquivo.js                      |   6 ++
 src/model/Midia.js                               |   8 ++
 src/model/Professor.js                           |   9 ++
 src/model/StatusTcc.js                           |   5 +
 src/model/TCC.js                                 |  41 ++++++++
 src/model/Tag.js                                 |   7 ++
 src/model/Usuario.js                             |  12 +++
 src/repository/ArmazenamentoArquivos.js          |  22 ++++
 src/repository/ArmazenamentoArquivosEmMemoria.js |  24 +++++
 src/repository/TccRepository.js                  |  22 ++++
 src/repository/TccRepositoryEmMemoria.js         |  80 +++++++++++++++
 src/repository/dadosIniciais.js                  | 124 +++++++++++++++++++++++
 src/repository/normalizacao.js                   |  21 ++++
 src/service/TccService.js                        |  89 ++++++++++++++++
 src/service/erros.js                             |  28 +++++
 tests/acesso-leitura.test.js                     |  53 ++++++++++
 tests/apoio/ArmazenamentoComFalhaSimulada.js     |  46 +++++++++
 tests/apoio/fabricas.js                          |  59 +++++++++++
 tests/busca-sem-criterios.test.js                |  52 ++++++++++
 tests/busca-tags-colecao.test.js                 |  98 ++++++++++++++++++
 tests/busca-termo-livre.test.js                  |  73 +++++++++++++
 tests/ct03-buscar-filtros-combinados.test.js     |  61 +++++++++++
 tests/ct05-busca-sem-correspondencia.test.js     |  34 +++++++
 tests/ct06-falha-download.test.js                |  94 +++++++++++++++++
 tests/detalhes.test.js                           | 104 +++++++++++++++++++
 36 files changed, 1507 insertions(+), 52 deletions(-)
a162627 2026-11-08 07:10:26 -0300 Fase 6 (Analyze) - analysis.md transcrito pelo experimentador

 specs/001-buscar-filtrar-tccs/analysis.md | 140 ++++++++++++++++++++++++++++++
 1 file changed, 140 insertions(+)
```
