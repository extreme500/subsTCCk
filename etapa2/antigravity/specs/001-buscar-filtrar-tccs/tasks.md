# Tarefas: Buscar e Filtrar TCCs

**Entrada:** `spec.md` e `plan.md` em `specs/001-buscar-filtrar-tccs/`

## Formato

`- [ ] T001 [P] [H1] Descrição com o caminho do arquivo — origem: FR-xxx / CTxx`

- `[P]`: pode ser feita em paralelo (arquivos diferentes, sem dependência).
- `[H1]`, `[H2]`, `[H3]`: história da especificação que a tarefa atende.
- Testes vêm antes da implementação que verificam.

## Fase 1: Preparação

- [x] T001 Configurar `package.json` na raiz do projeto com `"type": "module"`, script `"test": "node --test"` e requisito `engines.node >= 20`, sem dependências externas — origem: FR-001, CT03, CT05, CT06

## Fase 2: Base (bloqueia as histórias)

- [x] T002 [P] Implementar as enumerações `StatusTcc` (`RASCUNHO`, `PUBLICADO`) em `src/model/StatusTcc.js` e `FormatoArquivo` (`DOCX`, `PDF`, `EPUB`) em `src/model/FormatoArquivo.js` — origem: FR-004, FR-009, CT03, CT05, CT06
- [x] T003 [P] Implementar a classe base `Usuario` em `src/model/Usuario.js` e as subclasses `Professor` em `src/model/Professor.js` e `AlunoFormando` em `src/model/AlunoFormando.js` — origem: FR-002, FR-005, FR-008, CT03
- [x] T004 [P] Implementar as entidades de domínio `Area` em `src/model/Area.js`, `Tag` em `src/model/Tag.js`, `Midia` em `src/model/Midia.js` e `ArquivoTcc` (com exportação também do alias `ArquivoTCC`) em `src/model/ArquivoTcc.js` — origem: FR-002, FR-005, FR-008, FR-009, CT03, CT05, CT06
- [x] T005 Implementar a entidade `TCC` em `src/model/TCC.js` com seus atributos, associações (`autor`, `orientador`, `coorientador`, `tags`, `midias`, `arquivo`) e métodos de domínio (`registrarVisualizacao`, `publicar`, `salvarRascunho`, `validarCamposObrigatorios`) — origem: FR-004, FR-008, FR-009, CT03, CT05, CT06
- [x] T006 [P] Implementar o DTO `FiltroBusca` em `src/dto/FiltroBusca.js` com os campos `termo`, `ano`, `autor`, `orientador` e `tags` e normalização de entrada — origem: FR-002, FR-003, FR-005, CT03, CT05
- [x] T007 [P] Implementar o DTO `TccDTO` em `src/dto/TccDTO.js` contemplando os campos básicos do diagrama de classes e os campos completos de detalhes (`coorientador`, `linkLume`, `midias`, `possuiArquivo`, `arquivo`, `visualizacoes`, `trabalhosConexos`) — origem: FR-006, FR-008, CT03, CT05
- [x] T008 Implementar a semente de dados iniciais em memória (TCCs A, B, C, D e E, com respectivos autores, orientadores, tags, mídias e arquivos PDF) em `src/repository/dadosIniciais.js` — origem: FR-004, FR-008, FR-009, CT03, CT05, CT06
- [x] T009 Criar a estrutura base das camadas em `src/repository/TccRepository.js` (`salvarTcc`, `buscarPorId`), `src/service/ArmazenamentoArquivo.js`, `src/service/TccService.js`, `src/controller/TccController.js` e a fábrica `criarApp` com injeção de dependências em `src/app.js` — origem: FR-001, CT03, CT05, CT06

## Fase 3: História 1 - Buscar e filtrar TCCs publicados por critérios combinados (P1)

**Objetivo:** Permitir que qualquer usuário leitor pesquise TCCs publicados combinando termo livre e filtros (ano, autor, orientador e tags) aplicados simultaneamente, ocultando rascunhos em qualquer circunstância, ordenando resultados do mais recente ao mais antigo e exibindo a mensagem literal de `FA01` quando nenhum trabalho corresponder.
**Teste independente:** Popular o repositório com os TCCs A a E (`dadosIniciais.js`) e verificar `CT03` (filtros combinados e variação sem resultados), `CT05` (busca sem correspondência, mensagem de `FA01`, nova pesquisa retornando A, D e C, e variação buscando pelo título do rascunho E) e buscas por critérios individuais/múltiplas tags/sem filtros.

### Testes da História 1 (escrever primeiro e confirmar que falham)

- [x] T010 [H1] Escrever os testes automatizados de `CT03` (busca combinada com `Ano = 2025`, `Orientador = "Carlos Lima"` e `Tag = "Redes"` retornando apenas o TCC A e ocultando B, C, D e o rascunho E; e variação com `Ano = 2023` e `Tag = "Redes"` retornando lista vazia e a mensagem literal de `FA01`) em `tests/buscar-filtrar-tccs.test.js` — origem: FR-001, FR-002, FR-003, FR-004, FR-005, FR-007, CT03
- [x] T011 [H1] Escrever os testes automatizados de `CT05` (busca com `termo = "blockchain"` e `Tag = "Redes"` exibindo a mensagem literal de `FA01`; remoção do termo mantendo `Tag = "Redes"` retornando os TCCs publicados A, D e C ordenados e mantendo E oculto; e variação buscando pelo título exato do rascunho TCC E) em `tests/buscar-filtrar-tccs.test.js` — origem: FR-003, FR-004, FR-005, FR-006, FR-007, CT05
- [x] T012 [H1] Escrever os testes automatizados complementares da História 1 (busca por termo livre em título, resumo, autor, orientador e tags conforme `US#04`; filtro por múltiplas tags exigindo conjunção lógica `E`; e pesquisa sem filtros retornando todos os TCCs publicados ordenados por `ano DESC, semestre DESC, id ASC`) em `tests/buscar-filtrar-tccs.test.js` — origem: FR-001, FR-002, FR-005, FR-006, US#04

### Implementação da História 1

- [x] T013 [H1] Implementar `buscarPorFiltros(filtros)` em `src/repository/TccRepository.js` restringindo a TCCs com status `PUBLICADO` e aplicando interseção lógica de `termo` livre (em título, resumo, autor, orientador/coorientador e tags), `ano`, `autor`, `orientador` (por *substring* *case-insensitive*) e `tags` (conjunção `E` *case-insensitive*) — origem: FR-002, FR-003, FR-004, FR-005, CT03, CT05
- [x] T014 [H1] Implementar `buscarPorFiltros(filtro)` em `src/service/TccService.js` delegando ao repositório e ordenando os TCCs retornados do mais recente para o mais antigo (`ano DESC, semestre DESC, id ASC`) — origem: FR-002, FR-003, FR-004, FR-005, FR-006, CT03, CT05
- [x] T015 [H1] Implementar `buscarTccs(filtro)` em `src/controller/TccController.js` convertendo os TCCs encontrados para `TccDTO` e retornando `{ resultados, mensagem }` com a mensagem literal `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."` quando `resultados` for vazio — origem: FR-001, FR-006, FR-007, CT03, CT05

## Fase 4: História 2 - Visualizar detalhes completos de um TCC selecionado e trabalhos conexos (P2)

**Objetivo:** Permitir que o usuário leitor abra um TCC publicado a partir dos resultados para visualizar todas as informações preenchidas pelo autor, incrementar o contador de visualizações do trabalho e consultar os trabalhos conexos publicados que compartilham tags em comum, impedindo o acesso a rascunhos.
**Teste independente:** Selecionar o TCC A (`id = 1`) e verificar o retorno de todos os atributos cadastrados pelo autor, o incremento de `visualizacoes` a cada consulta, a listagem dos TCCs publicados C e D como trabalhos conexos (sem incluir o próprio TCC A nem o rascunho E) e o bloqueio ao tentar visualizar o rascunho TCC E (`id = 5`).

### Testes da História 2 (escrever primeiro e confirmar que falham)

- [x] T016 [H2] Escrever os testes automatizados de visualização de detalhes (`CT03` passo 4 e `FR-008`: retorno de todos os campos preenchidos pelo autor do TCC A, incremento do contador de visualizações, mapeamento de trabalhos conexos publicados por tags em comum excluindo o próprio TCC e o rascunho E, e bloqueio de visualização direta do rascunho E) em `tests/buscar-filtrar-tccs.test.js` — origem: FR-001, FR-004, FR-008, CT03, UC05, UC06

### Implementação da História 2

- [x] T017 [H2] Implementar `buscarPorTags(tags)` em `src/repository/TccRepository.js` retornando todos os TCCs com status `PUBLICADO` que compartilhem ao menos uma tag (*case-insensitive*) com a lista informada — origem: FR-004, FR-008, UC06
- [x] T018 [H2] Implementar `buscarPorId(id)` (validando que o TCC existe e está `PUBLICADO` e invocando `tcc.registrarVisualizacao()`) e `mapearTrabalhosConexos(id)` (filtrando o próprio TCC e ordenando por `ano DESC, semestre DESC, id ASC`) em `src/service/TccService.js` — origem: FR-004, FR-008, CT03, UC05, UC06
- [x] T019 [H2] Implementar `visualizarDetalhes(id)` e `listarTrabalhosConexos(id)` em `src/controller/TccController.js` montando o `TccDTO` completo com `trabalhosConexos` e registrando o estado da página de detalhes aberta (`detalheAtual`) — origem: FR-001, FR-004, FR-008, CT03, UC05, UC06

## Fase 5: História 3 - Baixar o arquivo do TCC (P3)

**Objetivo:** Permitir que o usuário leitor baixe o arquivo (PDF, DOCX ou EPUB) de um TCC publicado a partir de seus detalhes, tratando falhas de transferência com a mensagem literal de `FA02`, sem salvar arquivos incompletos e mantendo a página disponível para nova tentativa, além de indicar o link oficial do LUME quando o TCC publicado não possuir arquivo próprio anexado.
**Teste independente:** Abrir os detalhes do TCC A (`id = 1`), simular queda de conexão em `ArmazenamentoArquivo`, verificar a mensagem literal de `FA02`, a ausência de arquivo incompleto salvo e a manutenção da página aberta com botão disponível, restabelecer a conexão e confirmar o download completo do PDF; adicionalmente, verificar a tentativa de download no TCC D (`id = 4`, publicado sem arquivo anexado) e o bloqueio no TCC E (`id = 5`, rascunho).

### Testes da História 3 (escrever primeiro e confirmar que falham)

- [x] T020 [H3] Escrever os testes automatizados de `CT06` (passos 1 a 4: abertura do TCC A, interrupção da conexão durante o download retornando literalmente `"Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente."`, verificação de que nenhum arquivo incompleto é salvo no dispositivo, manutenção da página de detalhes aberta com botão `"Baixar Artigo"` disponível, restabelecimento da conexão e conclusão do download do PDF) em `tests/buscar-filtrar-tccs.test.js` — origem: FR-001, FR-009, FR-010, CT06
- [x] T021 [H3] Escrever os testes automatizados para tentativa de download de TCC publicado sem arquivo anexado (TCC D, verificando impedimento da transferência e indicação do `linkLume`) e tentativa de download de TCC em rascunho (TCC E, verificando bloqueio) em `tests/buscar-filtrar-tccs.test.js` — origem: FR-004, FR-009

### Implementação da História 3

- [x] T022 [H3] Implementar `definirConexaoAtiva(ativa)` e `transferirArquivo(arquivo)` em `src/service/ArmazenamentoArquivo.js` simulando a transferência do arquivo e descartando atomicamente dados parciais caso a conexão esteja inativa ou seja interrompida — origem: FR-009, FR-010, CT06
- [x] T023 [H3] Implementar `obterArquivo(id)` em `src/service/TccService.js` verificando se o TCC está `PUBLICADO`, tratando a ausência de arquivo anexado (`FR-009` com referência a `linkLume`) e propagando falhas de transferência de `ArmazenamentoArquivo` com a mensagem literal de `FA02` (`FR-010`) — origem: FR-004, FR-009, FR-010, CT06
- [x] T024 [H3] Implementar `baixarArquivo(id)` em `src/controller/TccController.js` persistindo no dispositivo simulado (`arquivosSalvosNoDispositivo`) apenas arquivos transferidos integralmente, preservando a visualização aberta e o botão disponível em falhas de conexão e retornando o contrato de resposta com as mensagens de `FA02` ou `FR-009` — origem: FR-001, FR-009, FR-010, CT06

## Fase 6: Acabamento

- [x] T025 Executar a suíte completa de testes automatizados com `node --test` sobre `tests/buscar-filtrar-tccs.test.js` e verificar conformidade de todos os cenários (`CT03`, `CT05`, `CT06` e `FR-001` a `FR-010`) e princípios da Constituição — origem: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, CT03, CT05, CT06

## Dependências e ordem de execução

### 1. Ordem entre fases

1. **Fase 1 (Preparação — `T001`)**: Deve ser executada primeiro para habilitar ES Modules e `node --test`.
2. **Fase 2 (Base — `T002` a `T009`)**: Depende de `T001` e bloqueia todas as histórias de usuário (`H1`, `H2`, `H3`), pois constrói o modelo de domínio, os DTOs, a semente de dados iniciais e o ponto de entrada `src/app.js`.
   - Dentro da Fase 2: `T002`, `T003`, `T004`, `T006` e `T007` atuam em arquivos independentes e podem ser executadas em paralelo (`[P]`).
   - `T005` (`src/model/TCC.js`) depende de `T002`, `T003` e `T004`.
   - `T008` (`src/repository/dadosIniciais.js`) depende de `T002` a `T005`.
   - `T009` (`src/app.js` e esqueletos das camadas) depende de `T005` a `T008`.
3. **Fase 3 (História 1 — `T010` a `T015`)**: Depende da conclusão da Fase 2 (`T009`).
   - Ordem interna (TDD): escrever os testes `T010`, `T011` e `T012` primeiro e confirmar que falham → implementar `T013` (`TccRepository`) → `T014` (`TccService`) → `T015` (`TccController`).
4. **Fase 4 (História 2 — `T016` a `T019`)**: Depende da Fase 2 (`T009`) e integra-se ao fluxo de busca da Fase 3 (`T015` para o passo 4 do `CT03`).
   - Ordem interna (TDD): escrever os testes `T016` primeiro e confirmar que falham → implementar `T017` (`TccRepository`) → `T018` (`TccService`) → `T019` (`TccController`).
5. **Fase 5 (História 3 — `T020` a `T024`)**: Depende da Fase 2 (`T009`) e da visualização de detalhes da Fase 4 (`T019`, pois o passo 1 do `CT06` abre os detalhes do TCC A antes de acionar `"Baixar Artigo"`).
   - Ordem interna (TDD): escrever os testes `T020` e `T021` primeiro e confirmar que falham → implementar `T022` (`ArmazenamentoArquivo`) → `T023` (`TccService`) → `T024` (`TccController`).
6. **Fase 6 (Acabamento — `T025`)**: Depende da conclusão de todas as fases anteriores (`T001` a `T024`).

### 2. Resumo de paralelismo (`[P]`)

- **Grupo paralelo na Fase 2:** `T002` (`StatusTcc.js`, `FormatoArquivo.js`), `T003` (`Usuario.js`, `Professor.js`, `AlunoFormando.js`), `T004` (`Area.js`, `Tag.js`, `Midia.js`, `ArquivoTcc.js`), `T006` (`FiltroBusca.js`) e `T007` (`TccDTO.js`) manipulam arquivos distintos sem dependências mútuas e podem ser desenvolvidas simultaneamente.

## Desvios durante a implementação

<!-- Preenchido na fase Implement: o que mudou em relação ao plano e por quê. -->

- Nenhum desvio em relação a `plan.md` foi necessário. Todos os módulos, contratos, nomes de classes/métodos e regras de negócio foram implementados conforme planejado.

