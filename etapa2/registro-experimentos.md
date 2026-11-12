# Registro dos experimentos com GenAI (Etapa 2)

Um bloco por ferramenta. Os campos seguem a seção 9 do enunciado.

## Experimento SDD: RF#02 / UC04 (Buscar e Filtrar TCCs)

**Artefato/contexto fornecido (igual para as duas ferramentas):**

- a pasta `pacote-entrada/` (relatório da Etapa 1 sem as seções de protótipo e GenAI, os 6 diagramas em PNG mais a transcrição textual, a constituição e os templates);
- os 6 prompts de `prompts-sdd.md`.

**Estratégia de interação:** uma conversa por ferramenta, um prompt por fase, com parada obrigatória ao fim de cada fase. Na fase Clarify, as perguntas de cada ferramenta foram respondidas pelo grupo.

### Ferramenta A: Claude Code

- **Modelo:** Claude Opus 5.5 (Anthropic)
- **Modo:** agente com contexto limpo, sem acesso ao protótipo nem ao histórico do projeto
- **Adaptação:** na fase Clarify, as perguntas foram entregues todas de uma vez (o agente não conversa durante a execução) e respondidas pelo grupo.

Execução em 08/11/2026. Cada fase tem um snapshot no histórico git de `claude-code/` (`git log`).

| Fase | Duração | Intervenções humanas | Observações |
|---|---|---|---|
| 1 Specify (+ perguntas do Clarify) | ~3 min | 0 | 3 histórias, FR-001 a FR-016 (mais FR-003a e FR-015a), 5 marcadores [NEEDS CLARIFICATION] |
| 2 Clarify | ~2 min | 5 respostas do grupo (4 iguais à recomendação, 1 rejeitada: Coleção) | Decidiu sozinho que os filtros de autor e orientador não ignoram acentos (registrou, mas não perguntou) |
| 3 Plan | ~6,5 min | 0 | 12 divergências com os diagramas registradas (D1 a D12) |
| 4 Tasks | ~9 min | 0 | 52 tarefas, com o passo "confirmar que falham" por história |
| 5 Implement | ~17 min | 0 | 53 testes, 53 aprovados; antes da implementação falharam 20, 9 e 9; 10 desvios registrados |
| 6 Analyze | ~22 min | 1 (o ambiente bloqueou a gravação de analysis.md; o experimentador transcreveu a resposta sem alterações) | 24 achados (0 críticos, 1 alto, 8 médios, 15 baixos) e 27 inconsistências no material da Etapa 1 |

### Ferramenta B: Antigravity

- **Modelo (como aparece no seletor):** Gemini 4 Argon (High), conforme o histórico local da conversa no Antigravity
- **Modo do agente (Planning/Fast):** configuração padrão, não alterada; raciocínio High
- **Política de execução no terminal:** controle total: o agente executava comandos sem pedir confirmação (rodou `node --test` cinco vezes na fase Implement)
- **Critério de resposta no Clarify:** o grupo respondeu só com as opções oferecidas pelo modelo, para medir o que ele propunha (no Claude, o grupo respondeu com as próprias decisões)

Execução em 09/11/2026 (Specify) e 10/11/2026 (demais fases). Não há snapshot git por fase; os horários vêm do histórico local da conversa.

| Fase | Início | Fim | Duração | Intervenções humanas | Observações |
|---|---|---|---|---|---|
| 1 Specify | 09/11 01:35 | 01:39 | ~4 min | 0 | 3 histórias, FR-001 a FR-010, 5 marcadores [NEEDS CLARIFICATION] |
| 2 Clarify | 10/11 03:36 | 03:51 | ~14,5 min (inclui o tempo das respostas) | 5 respostas (3 iguais à recomendação, 2 diferentes) | Perguntou uma por vez, com opções e recomendação, como pedido; registrou 5 divergências da Etapa 1 na spec |
| 3 Plan | 04:24 | 04:28 | ~3,5 min | 0 | 6 divergências com os diagramas registradas |
| 4 Tasks | 04:29 | 04:31 | ~2 min | 0 | 25 tarefas |
| 5 Implement | 04:31 | 04:40 | ~8,5 min | 0 | 12 testes, 12 aprovados; antes da implementação falharam 7, 2 e 3; "nenhum desvio" registrado |
| 6 Analyze | 05:01 | 05:03 | ~2 min | 0 | 5 achados (todos BAIXA), 0 violações da constituição, 9 inconsistências no material da Etapa 1 |

Perguntas que o Antigravity fez no Clarify e a resposta dada:

1. **Coleção/Área × diagramas (FR-002).**
   - Recomendação: opção A, manter só os 5 critérios dos diagramas e tratar coleção/área como tags.
   - **Resposta: A (a recomendação).** É diferente da decisão 1 do grupo, usada no Claude (Coleção = curso).
   - Motivo: nenhuma opção dizia "curso" (a C falava em "atributo próprio do TCC", sem dizer qual), e o grupo decidiu responder só com as opções do modelo. A resposta correta para o projeto continua Coleção = curso.
2. **Correspondência do termo livre, autor, orientador e tags (FR-005).**
   - Recomendação: opção A, termo por trecho, sem diferenciar maiúsculas, em título, resumo, autor, orientador/coorientador e tags; tags com E.
   - **Resposta: A (a recomendação).**
   - Nenhuma opção tratava acentos, então a regra "ignorar acentos" da decisão 2 do grupo ficou de fora.
3. **Ordenação e pesquisa sem critérios (FR-006).**
   - Recomendação: opção A, manter a ordem de cadastro (A, C, D, como no CT05).
   - **Resposta: B (rejeitou a recomendação):** do mais recente para o mais antigo, como no protótipo.
   - Sem critérios, lista todos os publicados (igual à decisão 5).
4. **Escopo dos detalhes do TCC (FR-008).**
   - Recomendação: opção A, só os campos do TccDTO mais o contador de visualizações, sem trabalhos conexos.
   - **Resposta: C (rejeitou a recomendação):** todos os dados do autor, contador de visualizações e trabalhos conexos (UC06).
5. **TCC publicado sem arquivo (FR-009).**
   - Recomendação: opção A, impedir a transferência e indicar o link do LUME, reservando a mensagem do FA02 para falhas de transferência.
   - **Resposta: A (a recomendação).** Equivale à decisão 4 do grupo.

### Testes cruzados (oráculo do experimentador)

Depois das seis fases, o experimentador escreveu 17 testes de caixa-preta (`oraculo/oraculo.test.js`) a partir dos CTs e das decisões do grupo. Os testes rodam nas duas implementações por meio de adaptadores (`oraculo/adaptadores.js`). Comandos, a partir da pasta `etapa2/`:

- `IMPL=claude node --test oraculo/`
- `IMPL=antigravity node --test oraculo/`

| Grupo de testes | Claude Code | Antigravity |
|---|---|---|
| 1. CTs da Etapa 1 (CT03, CT03 variação, CT05, CT05 variação, CT06) | 5/5 | 5/5 |
| 2. Decisões do grupo no Clarify (8 testes) | 8/8 | 6/8 (Coleção e acentos: refletem as respostas dadas no Clarify dele) |
| 3. Robustez, não decidida pelo grupo (4 testes) | 3/4 (termo "IA" casa "anomalias") | 2/4 (termo "IA"; ano inválido "abc" é ignorado em silêncio e a busca traz tudo) |
| **Total** | **16/17** | **13/17** |

**Limite do oráculo:** no Antigravity, a falha do CT06 só pode ser simulada com a conexão já caída antes da transferência (`definirConexaoAtiva(false)`). A interrupção no meio da transferência, que o CT06 descreve, não é representável nessa implementação.

### Análise

| Campo | Claude Code | Antigravity |
|---|---|---|
| Resultado produzido | spec com 18 FR; plan com 12 divergências (D1 a D12); 52 tarefas; ~1.430 linhas de JS (src + tests); 53 testes aprovados; analysis com 24 achados e 27 inconsistências da Etapa 1 | spec com 10 FR; plan com 6 divergências; 25 tarefas; ~1.040 linhas de JS; 12 testes aprovados; analysis com 5 achados e 9 inconsistências da Etapa 1 |
| O que foi aceito | Estrutura em camadas e nomes dos diagramas; mensagens literais do FA01/FA02; simulação de falha no meio da transferência; 4 das 5 recomendações do Clarify | Estrutura em camadas; mensagens literais; 3 das 5 recomendações do Clarify; registro das divergências de mensagens entre texto e diagrama |
| O que foi alterado | Nada no código gerado (o experimento mede a saída como veio); as correções viram recomendações para o material da Etapa 1 | Idem |
| O que foi investigado | Achados A04 (arquivo ausente vira "verifique sua conexão"), A06 (termo "IA") e A07 (acentos), confirmados pelo oráculo e pela leitura do código | Afirmações "0 violações da constituição" e "nenhum desvio". Verificação: a simulação de falha é só um booleano, e o buffer parcial é descartado antes de ser usado, então a "transferência em blocos" é decorativa |
| O que foi rejeitado | Recomendação do Clarify "Coleção = área temática (via Tag)"; o grupo decidiu Coleção = curso, como no LUME e no protótipo | Recomendações do Clarify sobre ordenação (ordem de cadastro) e escopo dos detalhes (sem trabalhos conexos) |
| Justificativa das decisões | Ver `decisoes-clarify.md` | Ver `decisoes-clarify.md` e as perguntas acima |
| Omissões | Não perguntou sobre acentos nos filtros de autor/orientador nem sobre o coorientador (registrou como premissa) | Não ofereceu opção sobre acentos; não detectou 4 dos 6 problemas do gabarito da Etapa 1; sem testes de DOCX/EPUB (ele mesmo apontou) |
| Contradições | Decidiu sozinho a assimetria de acentos, contra o princípio VI da constituição (achado A07, apontado pelo próprio agente) | Declarou "0 violações" e "nenhum desvio", mas o controller guarda estado de tela (`detalheAtual`, `arquivosSalvosNoDispositivo`) e o armazenamento de arquivos fica no pacote `service`, fora dos diagramas |
| Alucinações | Nenhuma identificada nos artefatos | Nenhuma identificada nos artefatos |
| Erros | A04 (mensagem de conexão para arquivo ausente); A06 (termo curto casa trechos de palavras) | Termo curto casa trechos de palavras; ano inválido ignorado em silêncio; sem tratar acentos, "deteccao" não encontra "Detecção" |
| Boas sugestões | Coleção como dado novo a coletar no UC01 (A01); diferenciar "arquivo ausente" de "falha de conexão" (A04); limitar o termo a palavras inteiras (A06) | Separar a mensagem de "TCC sem arquivo" da mensagem de falha (FR-009); unificar o texto das mensagens entre o diagrama de atividades e o UC04; oferecer a ordenação por recência como opção |

## Experimento de testes funcionais: classes de equivalência e valor limite (UC01 e UC04)

**Artefato/contexto fornecido (igual para as duas ferramentas):** a pasta `testes-funcionais/pacote-entrada/` (relatório da Etapa 1 com UC01, UC04 e CT01 a CT06, diagramas e transcrição).

**Estratégia de interação:** uma conversa por ferramenta, com dois prompts (`testes-funcionais/prompts-testes.md`): o prompt 1 é simples; o prompt 2 é refinado (estrutura, critério de cobertura e proibição de inventar regras). O objetivo é responder também se refinar o prompt melhora o resultado.

### Ferramenta A: Claude Code

- **Modelo:** Claude Opus 5.5, agente com contexto limpo, restrito à pasta `testes-funcionais/claude-code/`
- **Execução:** 12/11/2026

| Prompt | Duração | Intervenções | Resultado |
|---|---|---|---|
| 1 (simples) | ~7 min | 0 | `testes-funcionais-v1.md`: 26 casos novos (CT07 a CT32), 74 classes (40 válidas, 17 inválidas, 17 indefinidas), 22 lacunas |
| 2 (refinado) | ~6 min | 0 | `testes-funcionais-v2.md`: 24 casos novos (CT07 a CT30), 59 classes (38 válidas, 21 inválidas), limites, matriz de cobertura, 25 lacunas com perguntas e comparação com a v1 |

O que o refinamento mudou: inferências viraram lacunas; cada caso inválido passou a cobrir uma só classe inválida; buscas sem resultado passaram a ser classes inválidas, como no CT05. Por excesso de rigor, a v2 descartou alguns casos úteis da v1, como o domínio parecido com o do LUME.

### Ferramenta B: Antigravity

[PENDENTE: executar os dois prompts e anotar aqui o horário de início e de fim de cada um.]

### Consolidação

A seção 7 do relatório usa a v2 do Claude como base. As lacunas foram decididas pelo grupo, quase todas pelo comportamento do protótipo ou pelas decisões do Clarify, e as classes e os casos derivados dessas decisões foram acrescentados (CT31 a CT40). Os casos de lógica foram automatizados em `tests/testes-funcionais.test.js`, na raiz do repositório: 28 testes, 26 aprovados e 2 registrados como divergência do protótipo (lista de semestres sem 2026/2; termo "IA" encontrando "anomalias").
