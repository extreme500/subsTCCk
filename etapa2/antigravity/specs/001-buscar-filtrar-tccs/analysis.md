# Análise de Consistência e Convergência: Buscar e Filtrar TCCs

**Pasta:** `specs/001-buscar-filtrar-tccs` | **Data:** 2026-11-10 | **Fase:** 6 — Analyze / Converge
**Artefatos analisados:** `.specify/memory/constitution.md`, `specs/001-buscar-filtrar-tccs/spec.md`, `specs/001-buscar-filtrar-tccs/plan.md`, `specs/001-buscar-filtrar-tccs/tasks.md`, `src/**/*.js`, `tests/buscar-filtrar-tccs.test.js`, `contexto/relatorio-etapa1.md` e `contexto/diagramas/*`.

---

## 1. Tabela de achados

Categorias consideradas: `duplicação`, `ambiguidade`, `subespecificação`, `inconsistência`, `lacuna de cobertura`, `violação da constituição`.
Severidades consideradas: `CRÍTICA`, `ALTA`, `MÉDIA`, `BAIXA`.

| ID | Categoria | Severidade | Local | Resumo | Recomendação |
|---|---|---|---|---|---|
| **A01** | `inconsistência` | **BAIXA** | `specs/001-buscar-filtrar-tccs/spec.md` (linha 29, Cenário 4 da História 1) vs. `spec.md` (`FR-006`, linha 82) e `plan.md` (linha 237) | O Cenário de Aceitação 4 da História 1 mantém a redação literal de `CT05` (*"apresenta os TCCs publicados A, C e D"*), enquanto o `FR-006` (esclarecido na Fase 2) e o `plan.md` determinam a ordenação decrescente por `ano/semestre` e crescente por `id`, que produz a sequência `[A (2025/1, id 1), D (2025/1, id 4), C (2024/2, id 3)]`. | Adicionar nota explícita no Cenário 4 da História 1 em `spec.md` esclarecendo que o conjunto `{A, C, D}` é apresentado na ordem `[A, D, C]` por força de `FR-006`. |
| **A02** | `lacuna de cobertura` | **BAIXA** | `specs/001-buscar-filtrar-tccs/spec.md` (`FR-009`, linha 85) e `src/model/FormatoArquivo.js` vs. `tests/buscar-filtrar-tccs.test.js` (linhas 184–230) | O `FR-009` prevê o download de artigos nos formatos `PDF`, `DOCX` ou `EPUB`, mas os testes automatizados em `tests/buscar-filtrar-tccs.test.js` exercitam a transferência apenas para o formato `PDF` (TCC A do `CT06`), sem casos de teste específicos para `DOCX` e `EPUB`. | Adicionar um teste complementar em `tests/buscar-filtrar-tccs.test.js` exercitando o download de TCCs publicados com arquivos nos formatos `DOCX` e `EPUB`. |
| **A03** | `lacuna de cobertura` | **BAIXA** | `specs/001-buscar-filtrar-tccs/spec.md` (`Casos-limite`, linha 70; `FR-006`, linha 82) vs. `tests/buscar-filtrar-tccs.test.js` (linhas 118–128) | O `FR-006` define que uma pesquisa sem termos/filtros deve retornar todos os TCCs publicados ou exibir a mensagem de `FA01` caso não haja nenhum TCC publicado no acervo. O teste de `FR-006` valida a busca sem filtros com o acervo padrão populado, mas não testa o caso de acervo sem nenhum TCC publicado. | Adicionar um caso de teste instanciando `criarApp({ tccsIniciais: [] })` e verificando que `controller.buscarTccs()` sem filtros retorna `resultados: []` e a mensagem literal de `FA01`. |
| **A04** | `subespecificação` | **BAIXA** | `specs/001-buscar-filtrar-tccs/spec.md` (`FR-009`, linha 85) vs. `specs/001-buscar-filtrar-tccs/plan.md` (linha 188) e `src/service/TccService.js` (linha 58) | Diferentemente de `FR-007` e `FR-010` (que possuem mensagens literais oriundas do relatório), o `FR-009` em `spec.md` descreve o conteúdo semântico do aviso para TCC publicado sem arquivo anexado, enquanto o texto exato (`"Arquivo para download direto não está disponível. Consulte o trabalho pelo link oficial do LUME: <linkLume>"`) foi fixado apenas em `plan.md`. | Consolidar a string padronizada de `plan.md` diretamente na redação de `FR-009` em `spec.md`. |
| **A05** | `duplicação` | **BAIXA** | `src/repository/TccRepository.js` (linha 105) e `src/service/TccService.js` (linha 44) | Na listagem de trabalhos conexos (`UC06` / `FR-008`), a filtragem por `status === StatusTcc.PUBLICADO` é realizada em `TccRepository.buscarPorTags` e repetida em `TccService.mapearTrabalhosConexos`. | Manter a verificação como garantia defensiva de negócio ou centralizá-la exclusivamente no repositório. |

> **Verificação de violações da Constituição:** Foram auditados os Princípios I a VI de `.specify/memory/constitution.md`. **Nenhuma violação da constituição (`0`)** foi encontrada: todos os requisitos, tarefas e testes possuem rastreabilidade explícita (Princípio I), o ciclo TDD foi cumprido antes da implementação de cada história (Princípio II), nomes de pacotes/classes/métodos e mensagens literais respeitam os diagramas e casos de uso com divergências documentadas (Princípio III), a separação em camadas e a injeção de `ArmazenamentoArquivo` foram respeitadas (Princípio IV), não há dependências externas nem código fora do escopo (Princípio V) e todas as ambiguidades foram esclarecidas na Fase 2 (Princípio VI).

---

## 2. Matriz de cobertura (FR → Tarefas → Testes)

| Requisito Funcional (FR) | Origem no Relatório | Tarefas (`tasks.md`) | Testes Automatizados (`tests/buscar-filtrar-tccs.test.js`) | Status de Cobertura |
|---|---|---|---|---|
| **FR-001**: Acesso público de leitura (busca, filtragem, detalhes e download) sem exigir autenticação | Seção 2.1, UC04, Diagrama de Atividades UC04 | `T001`, `T009`, `T010`, `T012`, `T015`, `T016`, `T019`, `T020`, `T024`, `T025` | `[CT03 / FR-001..FR-005]` (linha 11); `[US#04 / FR-005]` (linha 80); `[CT03 passo 4 / FR-008 / UC05 / UC06]` (linha 133); `[CT06 passos 1..4 / UC04-FA02 / FR-009 / FR-010]` (linha 184) | **Coberto** |
| **FR-002**: Busca por termo livre combinada com filtros por Ano, Autor, Orientador e Assuntos/Tags | RF#02, UC04 (passos 2–3), US#04, Diagrama de Classes, Diagrama de Atividades UC04 | `T003`, `T004`, `T006`, `T010`, `T012`, `T013`, `T014`, `T025` | `[CT03 / FR-001..FR-005]` (linha 11); `[US#04 / FR-005]` (linha 80); `[FR-005]` (linha 102) | **Coberto** |
| **FR-003**: Aplicação simultânea (interseção lógica) de todos os critérios e filtros preenchidos | UC04 (passo 5), CT03, CT05, Diagrama de Atividades UC04 | `T006`, `T010`, `T011`, `T013`, `T014`, `T025` | `[CT03 / FR-001..FR-005]` (linha 11); `[CT03 variação / FR-007]` (linha 31); `[CT05 passos 1..4 / UC04-FA01 / FR-006 / FR-007]` (linha 44) | **Coberto** |
| **FR-004**: Exclusividade de TCCs `PUBLICADO` e ocultação/bloqueio total de `RASCUNHO` na busca, nos detalhes, nos trabalhos conexos e no download | UC04 (pré-condição), CT02, CT03, CT05 e variação, Diagrama de Atividades UC04 | `T002`, `T005`, `T008`, `T010`, `T011`, `T013`, `T014`, `T016`, `T017`, `T018`, `T019`, `T021`, `T023`, `T025` | `[CT03 / FR-001..FR-005]` (linha 11); `[CT05 passos 1..4 / UC04-FA01 / FR-006 / FR-007]` (linha 44); `[CT05 variação / FR-004 / FR-007]` (linha 68); `[CT03 passo 4 / FR-008 / UC05 / UC06]` (linha 133); `[FR-004 / História 2 Cenário 2]` (linha 171); `[FR-004]` (linha 247) | **Coberto** |
| **FR-005**: Correspondência por *substring* *case-insensitive* para termo livre (em título, resumo, autor, orientador/coorientador e tags) e para autor/orientador; conjunção `E` *case-insensitive* para múltiplas tags | US#04, UC04 (passos 3 e 5), CT03, CT05 | `T003`, `T004`, `T006`, `T010`, `T011`, `T012`, `T013`, `T014`, `T025` | `[CT03 / FR-001..FR-005]` (linha 11); `[CT05 passos 1..4 / UC04-FA01 / FR-006 / FR-007]` (linha 44); `[US#04 / FR-005]` (linha 80); `[FR-005]` (linha 102) | **Coberto** |
| **FR-006**: Apresentação em lista/feed ordenada por `(ano DESC, semestre DESC, id ASC)` e retorno de todos os TCCs publicados quando nenhum filtro é informado | UC04 (passos 3 e 5), CT03, CT05 | `T007`, `T011`, `T012`, `T014`, `T015`, `T025` | `[CT05 passos 1..4 / UC04-FA01 / FR-006 / FR-007]` (linha 44); `[FR-006]` (linha 118) | **Coberto** *(com observação de subcaso em A03)* |
| **FR-007**: Exibição da mensagem literal de `FA01` quando nenhum TCC publicado atender aos critérios e permissão de nova pesquisa após ajuste de filtros | UC04 (FA01), CT03 (variação), CT05 | `T010`, `T011`, `T015`, `T025` | `[CT03 variação / FR-007]` (linha 31); `[CT05 passos 1..4 / UC04-FA01 / FR-006 / FR-007]` (linha 44); `[CT05 variação / FR-004 / FR-007]` (linha 68); `[FR-005]` (linha 102) | **Coberto** |
| **FR-008**: Visualização de todos os dados preenchidos pelo autor do TCC selecionado, incremento de `visualizacoes` e sugestão de trabalhos conexos publicados por tags em comum (`UC06`) | US#04, UC04 (passos 6–7), UC05, UC06, CT03 (passo 4), Diagrama de Atividades UC04, Diagrama de Classes | `T003`, `T004`, `T005`, `T007`, `T008`, `T016`, `T017`, `T018`, `T019`, `T025` | `[CT03 passo 4 / FR-008 / UC05 / UC06]` (linha 133) | **Coberto** |
| **FR-009**: Download do arquivo do TCC publicado e impedimento com indicação do `linkLume` quando o TCC publicado não possuir arquivo anexado (`0..1`) | RF#02, RF#01, UC01 (passo 6), UC04 (passos 8–9), CT06, Diagrama de Atividades UC04, Diagrama de Classes | `T002`, `T004`, `T005`, `T008`, `T020`, `T021`, `T022`, `T023`, `T024`, `T025` | `[CT06 passos 1..4 / UC04-FA02 / FR-009 / FR-010]` (linha 184); `[FR-009]` (linha 233) | **Coberto** *(com observação de formatos adicionais em A02)* |
| **FR-010**: Exibição da mensagem literal de `FA02` em caso de falha na transferência, sem salvar arquivo incompleto e mantendo os detalhes/botão disponíveis para nova tentativa | UC04 (FA02), CT06 | `T020`, `T022`, `T023`, `T024`, `T025` | `[CT06 passos 1..4 / UC04-FA02 / FR-009 / FR-010]` (linha 184) | **Coberto** |

- **Requisitos Funcionais (FR) sem teste:** **Nenhum (`0`)**. Todos os 10 requisitos funcionais (`FR-001` a `FR-010`) possuem tarefas implementadas e testes automatizados correspondentes em `tests/buscar-filtrar-tccs.test.js`.

---

## 3. Inconsistências encontradas no próprio material da Etapa 1 (`contexto/`)

Abaixo estão listadas todas as inconsistências e divergências identificadas entre o relatório (`contexto/relatorio-etapa1.md`) e os diagramas UML (`contexto/diagramas/*.png` e `contexto/diagramas/transcricao-diagramas.md`) entregues na Etapa 1:

1. **Filtro por "Coleções" / "Área" presente no texto do relatório, mas ausente nos diagramas (`FiltroBusca` e Diagrama de Atividades do UC04):**
   - **Locais exatos:**
     - `contexto/relatorio-etapa1.md`, linha 61 (`RF#02`: *"permitir buscar e filtrar os TCCs publicados (por ano, autor, orientador, tags e coleção)"*), linha 137 (`UC04`, passo 2: *"botões de filtro com os campos: Data/Ano, Autores, Orientadores, Assuntos/Tags e Coleções"*) e linhas 81 e 84 (`US#04`: *"filtrar TCCs por áreas de interesse... selecionar o filtro respectivo [da área da computação]"*).
     - `contexto/diagramas/classes.png` e `contexto/diagramas/transcricao-diagramas.md`, linha 45: a classe `FiltroBusca` contém apenas `+ termo: String`, `+ ano: int`, `+ autor: String`, `+ orientador: String` e `+ tags: String` (sem atributo `colecao` nem `area`), e no modelo de domínio (linhas 25–26 e 37) existe a classe `Area` agregada a `Tag`, mas não existe entidade ou atributo `Colecao`.
     - `contexto/diagramas/atividades-uc04.png` e `contexto/diagramas/transcricao-diagramas.md`, linha 94: a atividade do usuário especifica *"Inserir termos e/ou selecionar filtros (Ano, Autor, Orientador, Tags)"*, omitindo *Coleções*.

2. **Três versões divergentes para a mensagem de busca sem resultados (`UC04 - FA01` vs. `CT03` vs. `atividades-uc04.png`):**
   - **Locais exatos:**
     - `contexto/relatorio-etapa1.md`, linha 150 (`UC04 - FA01`) e linha 263 (`CT05`): `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."` (com ponto final).
     - `contexto/relatorio-etapa1.md`, linha 231 (`CT03`, Variação): `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros"` (sem ponto final).
     - `contexto/diagramas/atividades-uc04.png` e `contexto/diagramas/transcricao-diagramas.md`, linha 94: `"Nenhum trabalho encontrado para os critérios informados"` (segunda frase omitida).

3. **Duas versões divergentes para a mensagem de falha no download (`UC04 - FA02` vs. `atividades-uc04.png`):**
   - **Locais exatos:**
     - `contexto/relatorio-etapa1.md`, linha 157 (`UC04 - FA02`) e linha 278 (`CT06`): `"Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente."`.
     - `contexto/diagramas/atividades-uc04.png` e `contexto/diagramas/transcricao-diagramas.md`, linha 94: `"Ocorreu um erro durante o download, verifique a sua conexão"` (trecho `"com a internet e tente novamente."` omitido).

4. **Fronteira inconsistente entre os casos de uso `UC04`, `UC05` e `UC06`:**
   - **Locais exatos:**
     - `contexto/diagramas/casos-de-uso.png` e `contexto/diagramas/transcricao-diagramas.md`, linhas 11–12: `UC04: Buscar e Filtrar TCCs` e `UC05: Visualizar Detalhes do TCC` são casos de uso independentes acionados pelo `Usuário Leitor` sem relação `«include»` ou `«extend»` entre si, enquanto `UC06: Mapear Trabalhos Conexos` estende (`«extend»`) `UC05`.
     - `contexto/relatorio-etapa1.md`, linhas 141–142 (`UC04`, passos 6 e 7): a seleção do trabalho e a visualização de suas características e descrição fazem parte do fluxo principal do próprio `UC04`.
     - `contexto/diagramas/atividades-uc04.png` e `contexto/diagramas/transcricao-diagramas.md`, linha 94: o diagrama de atividades do `UC04` incorpora tanto a visualização de detalhes (`UC05`) quanto a listagem de trabalhos conexos (`UC06`) na atividade *"Exibir detalhes do TCC (resumo, imagens, tags e trabalhos conexos)"*.

5. **Incompletude de `TccDTO` no Diagrama de Classes frente aos atributos exigidos nos detalhes do TCC:**
   - **Locais exatos:**
     - `contexto/relatorio-etapa1.md`, linha 102 (`UC01`, passo 2: campos *Título, Resumo, Ano/Semestre, Orientador, Coorientador, Link do LUME, Tags e Mídias*), linha 142 (`UC04`, passo 7: *"mostra as características e a descrição do trabalho, como preenchidas pelo autor"*) e `contexto/diagramas/atividades-uc04.png` (*"resumo, imagens, tags e trabalhos conexos"*).
     - `contexto/diagramas/classes.png` e `contexto/diagramas/transcricao-diagramas.md`, linhas 43 e 49: o método `TccController.visualizarDetalhes(id: int)` retorna `TccDTO`, mas `TccDTO` define apenas `id`, `titulo`, `resumoSimplificado`, `ano`, `semestre`, `autor`, `orientador` e `tags`, omitindo `coorientador`, `linkLume`, `midias`, `arquivo`, `visualizacoes` e `trabalhosConexos`.

6. **Tipagem escalar e omissão de tipo em atributos de `TccDTO` e `FeedDTO` no Diagrama de Classes:**
   - **Locais exatos:**
     - `contexto/diagramas/classes.png` e `contexto/diagramas/transcricao-diagramas.md`, linhas 43–44:
       - Em `TccDTO`: o atributo `+ resumoSimplificado` está sem tipo declarado, e `+ tags: String` está tipado como `String` simples apesar da agregação `TCC ◇— Tag (1..5)` (linha 36).
       - Em `FeedDTO`: `+ tccsRecentes: TccDTO` está tipado como objeto único em vez de coleção (`List<TccDTO>`), e `+ tagsEmAlta: String` como `String` simples em vez de lista.

7. **Grafia divergente entre `ArquivoTcc` e `ArquivoTCC`:**
   - **Locais exatos:**
     - `contexto/diagramas/classes.png` e `contexto/diagramas/transcricao-diagramas.md`, linhas 28, 39 e 50: a classe é grafada como `ArquivoTcc`.
     - `contexto/diagramas/pacotes.png` e `contexto/diagramas/transcricao-diagramas.md`, linha 72: dentro do pacote `model`, a mesma classe é grafada como `ArquivoTCC`.

8. **Setas de dependência (`«Use»`) incompletas no Diagrama de Classes em relação ao Diagrama de Pacotes:**
   - **Locais exatos:**
     - `contexto/diagramas/pacotes.png` e `contexto/diagramas/transcricao-diagramas.md`, linha 74: declara as dependências `controller → dto`, `service → dto` e `repository → model`.
     - `contexto/diagramas/classes.png` e `contexto/diagramas/transcricao-diagramas.md`, linhas 58–62: no diagrama de classes, `TccController` possui seta `«Use»` apenas para `FiltroBusca` (omitindo `TccDTO` e `FeedDTO`), `TccService` não possui seta `«Use»` para os DTOs, e `TccRepository` possui seta `«Use»` apenas para `FiltroBusca` (omitindo `TCC` e `Tag`).

9. **Inconsistências internas nos artefatos do `UC01` (relatório vs. `atividades-uc01.png` vs. `sequencia-uc01.png`):**
   - **Locais exatos:**
     - `contexto/relatorio-etapa1.md`, linha 115 (`UC01 - FA01`) e linha 249 (`CT04`): a mensagem é `"Preencha todos os campos obrigatórios"`, enquanto em `contexto/diagramas/atividades-uc01.png` (`transcricao-diagramas.md`, linha 93) consta `"Preencha todos os campos obrigatórios corretamente"`.
     - `contexto/relatorio-etapa1.md`, linha 122 (`UC01 - FA02`) e linha 204 (`CT02`): a mensagem é `"A URL informada não pertence ao domínio do LUME ou está inacessível. Deseja salvar como rascunho até que a publicação no LUME esteja homologada?"`, enquanto em `contexto/diagramas/atividades-uc01.png` (`transcricao-diagramas.md`, linha 93) consta apenas `"A URL informada não pertence ao domínio do LUME"` seguida de decisão `"Deseja salvar como rascunho?"`.
     - `contexto/diagramas/sequencia-uc01.png` e `contexto/diagramas/transcricao-diagramas.md`, linha 85 (passo 6): existe uma mensagem de retorno tracejada `TccRepository - - > LUME: status` ligando a linha de vida de `TccRepository` ao sistema externo `LUME` durante a checagem de URL, embora `TccRepository` não tenha sido chamado nem participe da validação de link no `LUME`.

---

## 4. Métricas

| Métrica | Valor | Detalhamento |
|---|---|---|
| **Número de Requisitos Funcionais (FR)** | **10** | `FR-001` a `FR-010` em `specs/001-buscar-filtrar-tccs/spec.md` |
| **Porcentagem de FR com teste** | **100%** (10 / 10) | Todos os 10 requisitos funcionais possuem testes automatizados vinculados em `tests/buscar-filtrar-tccs.test.js` (`0` FR sem teste) |
| **Número de achados por severidade** | **CRÍTICA: 0**<br>**ALTA: 0**<br>**MÉDIA: 0**<br>**BAIXA: 5** | Total de 5 achados de severidade baixa (`A01`: 1 `inconsistência`; `A02` e `A03`: 2 `lacunas de cobertura` em subcasos secundários; `A04`: 1 `subespecificação`; `A05`: 1 `duplicação`) e `0` violações da Constituição |
| **Número de testes e quantos passam** | **12 testes / 12 passam (100%)** | `12` testes distribuídos em `3` suítes (`História 1`: 7 testes; `História 2`: 2 testes; `História 3`: 3 testes) — `12` aprovados (`pass: 12`), `0` falhas (`fail: 0`) via `node --test` |

