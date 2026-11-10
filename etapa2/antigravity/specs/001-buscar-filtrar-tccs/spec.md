# Especificação da funcionalidade: Buscar e Filtrar TCCs

**Pasta:** `specs/001-buscar-filtrar-tccs` | **Data:** 2026-11-10 | **Status:** Esclarecido
**Origem no relatório:** RF#02 (recorte de busca, filtragem e download), UC04 (incluindo FA01 e FA02), UC05, UC06, US#04, CT03, CT05 e CT06

<!-- A especificação diz O QUE o sistema faz e POR QUÊ. Não cite linguagem, framework, banco, classes ou arquivos. -->

## Contexto e objetivo

No Instituto de Informática da UFRGS, a divulgação de Trabalhos de Conclusão de Curso (TCCs) por e-mail estático e a busca restrita a palavras-chave em repositórios tradicionais dificultam a descoberta do conteúdo real das pesquisas e a correlação entre temas (Seção 2 e Seção 3.2.1 do relatório). Esta funcionalidade permite que qualquer usuário leitor (aluno pesquisador, professor ou visitante externo, autenticado ou não) encontre TCCs publicados combinando termos livres e múltiplos filtros simultâneos, consulte os detalhes do trabalho escolhido e baixe o seu documento, facilitando o acesso a referências bibliográficas relevantes e a identificação de potenciais orientadores.

## Cenários do usuário e testes

<!-- Histórias em ordem de prioridade (P1 = mais importante). Cada uma deve poder ser testada de forma independente. -->

### História 1 - Buscar e filtrar TCCs publicados por critérios combinados (Prioridade: P1)

Um usuário leitor (aluno pesquisador, professor ou visitante) deseja pesquisar TCCs publicados combinando um termo livre na barra de pesquisa com filtros específicos (ano, autor, orientador e tags/assuntos), para localizar rapidamente referências bibliográficas relevantes e identificar potenciais orientadores sem que trabalhos em rascunho apareçam nos resultados. Caso nenhum trabalho corresponda aos critérios, o usuário deve ser avisado e poder ajustar os filtros para pesquisar novamente. *(origem: RF#02, US#04, UC04 passos 1–5 e FA01, CT03, CT05)*

**Por que esta prioridade:** Representa o núcleo de valor da funcionalidade de descoberta (RF#02 / UC04 / US#04). Sem a busca e filtragem multifacetada restrita a trabalhos publicados, o leitor não consegue localizar os trabalhos de seu interesse.

**Teste independente:** Pode ser testada isoladamente populando o acervo com TCCs publicados e em rascunho (como os TCCs A a E de CT03/CT05), executando buscas com filtros individuais e combinados, verificando que apenas os TCCs publicados que atendem simultaneamente a todos os critérios retornam e que buscas sem correspondência exibem a mensagem de aviso padronizada permitindo nova pesquisa.

**Cenários de aceitação:**

1. **Dado** um acervo com os TCCs A (2025/1, Profº Carlos Lima, tag "Redes", Publicado), B (2025/1, Profº Carlos Lima, tag "IA", Publicado), C (2024/2, Profº Carlos Lima, tag "Redes", Publicado), D (2025/1, Profª Ana Reis, tag "Redes", Publicado) e E (2025/1, Profº Carlos Lima, tag "Redes", Rascunho), **Quando** o usuário seleciona simultaneamente os filtros Ano = 2025, Orientador = "Carlos Lima" e Tag = "Redes" e aciona "Pesquisar", **Então** o sistema retorna apenas o TCC A no feed de resultados, excluindo B, C e D por não atenderem a todas as condições e excluindo E por estar em rascunho. *(origem: CT03)*
2. **Dado** que o usuário deseja consultar trabalhos de uma categoria/tag específica ou associados a um orientador específico, **Quando** ele seleciona o filtro correspondente ou pesquisa pelo orientador, **Então** somente os TCCs publicados que pertencem àquela classificação ou orientador são exibidos nos resultados. *(origem: US#04, CT03)*
3. **Dado** o acervo com os TCCs A a E onde nenhum trabalho publicado contém o termo "blockchain" com a tag "Redes", **Quando** o usuário digita o termo "blockchain", seleciona a Tag = "Redes" e aciona "Pesquisar", **Então** o sistema retorna um feed vazio e exibe literalmente a mensagem `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."`. *(origem: UC04 - FA01, CT05)*
4. **Dado** que a busca anterior não retornou resultados, **Quando** o usuário remove o termo "blockchain", mantém o filtro Tag = "Redes" e aciona novamente "Pesquisar", **Então** o sistema executa nova busca e apresenta os TCCs publicados A, C e D, mantendo o TCC E oculto por ser rascunho. *(origem: UC04 - FA01, CT05)*
5. **Dado** um TCC com status "RASCUNHO" (como o TCC E), **Quando** o usuário pesquisa diretamente pelo título ou pelos metadados exatos desse trabalho, **Então** o trabalho em rascunho não aparece nos resultados e, se nenhum outro TCC publicado corresponder, o sistema exibe `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."`. *(origem: CT02, CT05 variação)*

---

### História 2 - Visualizar detalhes completos de um TCC selecionado e trabalhos conexos (Prioridade: P2)

Após realizar uma busca, o usuário leitor seleciona um TCC listado no feed de resultados para visualizar todas as características e a descrição preenchidas pelo autor (título, resumo simplificado, ano, semestre, autor, orientador, coorientador, link do LUME, tags e mídias ilustrativas), além da sugestão de trabalhos conexos (outros TCCs publicados que compartilhem tags em comum), contabilizando a visualização do trabalho. *(origem: US#04, UC04 passos 6 e 7, UC05, UC06, CT03 passo 4, Diagrama de Atividades UC04)*

**Por que esta prioridade:** Conecta a listagem resumida de resultados à compreensão real do trabalho acadêmico (resumo simplificado, informações de autoria, orientação, mídias e correlação com pesquisas semelhantes), cumprindo o objetivo de tornar a leitura mais acessível, visual e conectada.

**Teste independente:** Pode ser testada selecionando qualquer TCC publicado a partir do resultado de uma busca (ex.: TCC A em CT03) e verificando que todas as informações cadastradas pelo autor são apresentadas ao leitor, que o contador de visualizações do TCC é incrementado e que TCCs publicados com tags em comum (exceto o próprio trabalho e rascunhos) são sugeridos como trabalhos conexos.

**Cenários de aceitação:**

1. **Dado** que o TCC A (Publicado) foi retornado nos resultados da pesquisa, **Quando** o usuário seleciona o TCC A, **Então** o sistema abre e apresenta todas as características preenchidas pelo autor (título, resumo simplificado, ano, semestre, autor, orientador, coorientador, link do LUME, tags e mídias), incrementa o contador de visualizações do TCC A e lista os trabalhos conexos publicados que compartilham tags com o TCC A. *(origem: US#04, UC04 passos 6 e 7, UC05, UC06, CT03 passo 4, Diagrama de Atividades UC04)*
2. **Dado** um TCC com status "RASCUNHO", **Quando** um usuário leitor tenta acessar seus detalhes pela consulta pública ou quando são mapeados trabalhos conexos de outro TCC, **Então** o sistema impede a visualização do rascunho e jamais o inclui como trabalho conexo. *(origem: UC04 pré-condição, CT02)*

---

### História 3 - Baixar o arquivo do TCC (Prioridade: P3)

A partir da página de detalhes de um TCC publicado, o usuário leitor aciona a opção "Baixar Artigo" para salvar o documento completo do trabalho (PDF, DOCX ou EPUB) em seu dispositivo. Caso ocorra uma falha durante a transferência, o usuário é avisado com uma mensagem clara, nenhum arquivo incompleto é salvo e a opção de download permanece disponível para nova tentativa. *(origem: RF#02, UC04 passos 8 e 9 e FA02, CT06)*

**Por que esta prioridade:** Conclui a jornada do usuário leitor no UC04 ao entregar o texto completo da pesquisa para leitura aprofundada e citação bibliográfica.

**Teste independente:** Pode ser testada abrindo os detalhes de um TCC publicado com arquivo associado, acionando o download tanto em condição normal de transferência quanto simulando falha de conexão, e verificando a entrega do arquivo íntegro ou a exibição da mensagem de erro seguida de nova tentativa bem-sucedida.

**Cenários de aceitação:**

1. **Dado** que o usuário está visualizando os detalhes do TCC A (Publicado) com arquivo PDF anexado e a conexão está funcional, **Quando** o usuário aciona "Baixar Artigo", **Então** o sistema realiza a transferência e disponibiliza o arquivo completo do TCC A para o dispositivo do usuário. *(origem: UC04 passos 8 e 9, CT06 passo 4)*
2. **Dado** que o usuário acionou "Baixar Artigo" nos detalhes do TCC A, **Quando** a transferência do arquivo falha (por exemplo, por interrupção de conexão), **Então** o sistema exibe literalmente a mensagem `"Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente."`, não salva nenhum arquivo incompleto no dispositivo e mantém a visualização do TCC aberta com a opção "Baixar Artigo" disponível. *(origem: UC04 - FA02, CT06 passo 3)*
3. **Dado** que o download anterior falhou e o usuário permaneceu nos detalhes do TCC A, **Quando** a condição de transferência é restabelecida e o usuário aciona novamente "Baixar Artigo", **Então** o download é concluído com sucesso e o arquivo é salvo integralmente. *(origem: UC04 - FA02, CT06 passo 4)*

---

### Casos-limite

- **Apenas rascunhos correspondem à busca:** Se existirem trabalhos no acervo que atendam exatamente ao termo e aos filtros informados, mas todos estiverem com status "RASCUNHO", o sistema deve tratá-los como inexistentes na busca pública e retornar o aviso de nenhum trabalho encontrado (CT03, CT05 variação).
- **Redefinição sucessiva de filtros após busca vazia:** Quando uma combinação restritiva não retorna resultados (FA01), o usuário pode remover ou alterar parte dos critérios e pesquisar novamente quantas vezes desejar, obtendo imediatamente os resultados atualizados (CT05 passos 3 e 4).
- **Interrupção no meio da transferência do arquivo:** Caso a falha ocorra durante o download do artigo (FA02), nenhum dado parcial ou corrompido pode ser persistido como arquivo final no dispositivo do usuário, e o estado de visualização do trabalho deve ser preservado para permitir nova tentativa imediata (CT06).
- **Busca sem termos ou filtros selecionados:** Caso o usuário acione "Pesquisar" com o termo em branco e sem nenhum filtro selecionado, o sistema deve retornar todos os TCCs com status "PUBLICADO" ordenados do mais recente para o mais antigo (ano/semestre decrescente e, em caso de empate, por identificador/ordem de cadastro), ou exibir a mensagem de nenhum trabalho encontrado (FA01) caso não exista nenhum TCC publicado no acervo.
- **TCC publicado sem arquivo anexado:** Caso o usuário tente baixar o documento de um TCC publicado que possua apenas o link do LUME e nenhum arquivo próprio anexado (multiplicidade `0..1`), o sistema impede a transferência e informa que o arquivo para download direto não está disponível, indicando a consulta pelo link oficial do LUME cadastrado no TCC (reservando a mensagem do FA02 exclusivamente para falhas durante a transferência de arquivos existentes).

## Requisitos

### Requisitos funcionais

- **FR-001**: O sistema DEVE permitir que qualquer usuário leitor (aluno pesquisador, professor ou visitante externo, autenticado ou não) acesse e utilize a busca, a filtragem, a visualização de detalhes e o download de TCCs publicados sem exigir autenticação. *(origem: Seção 2.1 - Stakeholders, UC04, Diagrama de Atividades UC04)*
- **FR-002**: O sistema DEVE disponibilizar uma busca por termo livre combinada com filtros por Ano, Autor, Orientador e Assuntos/Tags, mantendo os cinco critérios definidos nos diagramas de classes e de atividades do UC04 (tratando área/coleção como agrupamento conceitual representado pelas próprias tags). *(origem: RF#02, UC04 passos 2 e 3, US#04, Diagrama de Atividades UC04, Diagrama de Classes)*
- **FR-003**: O sistema DEVE aplicar simultaneamente todos os critérios de busca e filtros informados pelo usuário (interseção lógica entre os critérios preenchidos), retornando apenas os trabalhos que atendam a todas as condições ao mesmo tempo. *(origem: UC04 passo 5, CT03, CT05, Diagrama de Atividades UC04)*
- **FR-004**: O sistema DEVE considerar na busca e na visualização pública exclusivamente TCCs com status "PUBLICADO", garantindo que TCCs com status "RASCUNHO" nunca apareçam nos resultados nem possam ser acessados pelo leitor. *(origem: UC04 pré-condição, CT02, CT03, CT05 e variação, Diagrama de Atividades UC04)*
- **FR-005**: O sistema DEVE verificar a correspondência dos critérios textuais sobre os TCCs publicados da seguinte forma: (a) o termo livre deve ser pesquisado por correspondência parcial (substring) insensível a maiúsculas/minúsculas em título, resumo simplificado, nome do autor, nome do orientador/coorientador e nomes das tags; (b) os filtros de autor e orientador devem operar por correspondência parcial (substring) insensível a maiúsculas/minúsculas (permitindo que `"Carlos Lima"` encontre `"Profº Carlos Lima"`, conforme CT03); e (c) o filtro de tags deve exigir que o TCC possua todas as tags informadas no filtro (conjunção lógica E), com comparação insensível a maiúsculas/minúsculas. *(origem: US#04, UC04 passos 3 e 5, CT03, CT05)*
- **FR-006**: O sistema DEVE apresentar os TCCs publicados compatíveis com a pesquisa em formato de lista/feed de resultados, ordenados do mais recente para o mais antigo (por ano e semestre de forma decrescente e, em caso de empate, por identificador/ordem de cadastro). Quando nenhum termo ou filtro for preenchido na pesquisa, o sistema DEVE retornar todos os TCCs com status "PUBLICADO" seguindo essa mesma ordenação (ou exibir a mensagem de FA01 se não houver nenhum TCC publicado). *(origem: UC04 passos 3 e 5, CT03, CT05)*
- **FR-007**: Quando nenhum TCC publicado atender simultaneamente aos critérios informados, o sistema DEVE retornar uma lista vazia de resultados, exibir literalmente a mensagem `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."` e permitir que o usuário ajuste ou remova critérios para realizar uma nova pesquisa. *(origem: UC04 - FA01, CT03 variação, CT05)*
- **FR-008**: O sistema DEVE permitir que o usuário leitor selecione um TCC publicado listado nos resultados da busca para visualizar todas as características e a descrição preenchidas pelo autor (identificador, título, resumo simplificado, ano, semestre, autor, orientador, coorientador, link do LUME, tags e mídias ilustrativas), ocasião em que DEVE incrementar o contador de visualizações do TCC e listar como trabalhos conexos os demais TCCs com status "PUBLICADO" que compartilhem ao menos uma tag com o trabalho visualizado. *(origem: US#04, UC04 passos 6 e 7, UC05, UC06, CT03 passo 4, Diagrama de Atividades UC04, Diagrama de Classes)*
- **FR-009**: A partir da visualização de um TCC publicado, o sistema DEVE permitir que o usuário acione a opção "Baixar Artigo" para obter o arquivo do trabalho (nos formatos PDF, DOCX ou EPUB). Caso o TCC publicado não possua arquivo próprio anexado (multiplicidade `0..1` no domínio), o sistema DEVE impedir a transferência e informar que o arquivo para download direto não está disponível, indicando a consulta pelo link oficial do LUME do TCC. *(origem: RF#02, RF#01, UC01 passo 6, UC04 passos 8 e 9, CT06, Diagrama de Atividades UC04, Diagrama de Classes)*
- **FR-010**: Caso ocorra falha durante a transferência do arquivo no download, o sistema DEVE exibir literalmente a mensagem `"Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente."`, impedir o salvamento de arquivo incompleto no dispositivo e manter os detalhes do TCC disponíveis para que o usuário tente baixar o artigo novamente. *(origem: UC04 - FA02, CT06)*

### Divergências registradas no material da Etapa 1 (Princípio III da Constituição)

Em conformidade com o Princípio III da Constituição (*"Quando o diagrama e o texto divergirem, a divergência é registrada, não escolhida em silêncio"*), ficam registradas as seguintes divergências identificadas entre o relatório e os diagramas:

1. **Texto da mensagem de busca sem resultados (`UC04 - FA01` vs. `CT03` vs. `atividades-uc04.png`):** No texto do UC04 (FA01) e no CT05, a mensagem é `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."` (na variação de CT03 aparece sem o ponto final), enquanto no diagrama de atividades do UC04 consta apenas `"Nenhum trabalho encontrado para os critérios informados"`. Conforme o Princípio III da Constituição, esta especificação adota literalmente a redação completa do caso de uso UC04 (FR-007).
2. **Texto da mensagem de erro de download (`UC04 - FA02` vs. `atividades-uc04.png`):** No texto do UC04 (FA02) e no CT06, a mensagem é `"Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente."`, enquanto no diagrama de atividades do UC04 consta a forma abreviada `"Ocorreu um erro durante o download, verifique a sua conexão"`. Conforme o Princípio III da Constituição, esta especificação adota literalmente a redação completa do caso de uso UC04 (FR-010).
3. **Filtros de busca (`RF#02` / `UC04` / `US#04` vs. `classes.png` / `atividades-uc04.png`):** O texto de RF#02 e UC04 (passo 2) inclui "Coleções" entre os filtros e a US#04 cita filtro por área, ao passo que o diagrama de atividades do UC04 e a estrutura de filtro no diagrama de classes contemplam apenas termo, ano, autor, orientador e tags. Conforme decisão na fase Clarify, prevalecem os cinco critérios dos diagramas (termo, ano, autor, orientador e tags), tratando área/coleção como agrupamento representado pelas próprias tags (FR-002).
4. **Fronteira entre `UC04`, `UC05` e `UC06` (`casos-de-uso.png` vs. `UC04` e `atividades-uc04.png`):** No diagrama de casos de uso, "Visualizar Detalhes do TCC" (`UC05`) é um caso de uso distinto de "Buscar e Filtrar TCCs" (`UC04`) e recebe uma extensão de "Mapear Trabalhos Conexos" (`UC06`). Já na descrição textual do `UC04` (passos 6 e 7) e no diagrama de atividades (`atividades-uc04.png`), a exibição de detalhes do TCC (incluindo menção a trabalhos conexos no diagrama de atividades) ocorre dentro do próprio fluxo de `UC04`. Conforme decisão na fase Clarify, a visualização de detalhes inclui o incremento de visualizações e a sugestão de trabalhos conexos publicados por tags em comum (FR-008).
5. **Representação de dados nos detalhes (`UC04` passo 7 vs. `classes.png`):** O passo 7 do UC04 determina exibir as características e a descrição do trabalho como preenchidas pelo autor (que no UC01 incluem coorientador opcional, link do LUME e até 3 mídias), mas a estrutura resumida de transferência no diagrama de classes lista apenas identificador, título, resumo simplificado, ano, semestre, autor, orientador e tags. Conforme decisão na fase Clarify, a visualização de detalhes deve apresentar todos os dados preenchidos pelo autor (FR-008).

### Entidades-chave

- **TCC (Trabalho de Conclusão de Curso)**: Trabalho acadêmico cadastrado na plataforma, contendo identificador, título, resumo simplificado, ano e semestre de defesa, link permanente no repositório LUME, status de publicação (`RASCUNHO` ou `PUBLICADO`), contador de visualizações, aluno formando autor (1), orientador e opcionalmente coorientador (1 a 2 professores), tags temáticas (1 a 5), mídias ilustrativas (0 a 3) e arquivo do trabalho para download (0 a 1).
- **Usuário (Aluno Formando e Professor)**: Pessoas vinculadas à autoria e orientação dos TCCs. Possuem identificador, nome, e-mail e login institucional; o Aluno Formando possui matrícula e atua como autor do TCC, enquanto o Professor possui departamento e atua como orientador ou coorientador.
- **Tag e Área**: A Tag identifica um assunto ou tema associado ao TCC (ex.: "Redes", "IA", "Segurança") utilizado na busca e filtragem, podendo estar agregada a uma Área de conhecimento (0..1).
- **Mídia**: Imagem, figura ou gráfico de demonstração associado a um TCC (contendo identificador, caminho/URL e descrição) para enriquecer a visualização dos detalhes do trabalho.
- **Arquivo do TCC**: Documento completo do trabalho anexado ao TCC para download pelo leitor, caracterizado pelo nome original do arquivo, caminho de armazenamento e formato (`DOCX`, `PDF` ou `EPUB`).

## Critérios de sucesso

<!-- Mensuráveis e independentes de tecnologia. -->

- **SC-001**: 100% das pesquisas com combinação de filtros e/ou termos retornam exclusivamente TCCs com status "PUBLICADO" que satisfazem simultaneamente todos os critérios informados (verificado por CT03 e CT05).
- **SC-002**: 0% dos TCCs com status "RASCUNHO" são listados em resultados de busca ou exibidos na consulta de detalhes para usuários leitores, mesmo quando buscados pelo título exato ou pelos mesmos filtros de um trabalho publicado (verificado por CT02, CT03 e variação de CT05).
- **SC-003**: 100% das buscas que não encontram TCCs publicados compatíveis exibem literalmente a mensagem `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."` e permitem que o usuário redefina os filtros e obtenha resultados válidos na tentativa seguinte sem reiniciar o fluxo (verificado por CT03 variação e CT05).
- **SC-004**: 100% das falhas de transferência durante o download de um artigo exibem literalmente a mensagem `"Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente."`, não produzem arquivos incompletos e permitem concluir o download ao repetir a ação após a normalização (verificado por CT06).
- **SC-005**: Um usuário leitor consegue completar todo o fluxo principal do UC04 — pesquisar com filtros combinados, abrir os detalhes do TCC encontrado e baixar o arquivo íntegro do trabalho — em uma única sessão sem necessidade de autenticação.

## Premissas

- **Consulta pública sem exigência de login:** Conforme a Seção 2.1 do relatório ("Visitantes usam o aplicativo em modo visitante/leitura... publicação e edição de TCCs são restritas a usuários autenticados") e o diagrama de atividades do UC04, assume-se que toda a funcionalidade de buscar, filtrar, visualizar detalhes e baixar arquivos está disponível tanto para usuários autenticados quanto para visitantes anônimos.
- **Correspondência do filtro de Ano:** Embora os TCCs registrem Ano e Semestre de defesa (ex.: `2025/1`, `2024/2`), o filtro de busca por ano recebe o ano civil (ex.: `Ano = 2025` em CT03) e contempla todos os TCCs publicados daquele ano independentemente do semestre.
- **Prevalência literal das mensagens dos Casos de Uso:** Sempre que houver diferença de redação entre os textos de aviso/erro nos diagramas de atividades e os fluxos alternativos descritos nos casos de uso e casos de teste do relatório, prevalecem literalmente os textos de `UC04` (`FA01` e `FA02`), conforme o Princípio III da Constituição.

## Fora de escopo

- **Feed inicial de destaques e tópicos em alta:** A exibição automática dos TCCs defendidos mais recentemente e das tags mais exploradas no período ao abrir a plataforma (a outra parte do RF#02) está fora do escopo desta funcionalidade.
- **Cadastro e edição de TCCs:** A criação de novos trabalhos, salvamento de rascunhos, edição de metadados e validação de limites de tags/imagens no formulário de submissão (RF#01, UC01, UC02, CT01, CT02, CT04) estão fora do escopo.
- **Validação de links junto ao repositório LUME:** A verificação externa de integridade e domínio de URLs do LUME durante a publicação (UC03) está fora do escopo.
- **Autenticação e controle de sessão institucional:** O fluxo de login com credenciais institucionais da UFRGS está fora do escopo, visto que a leitura e a busca são abertas.

## Esclarecimentos

<!-- Preenchido na fase Clarify. -->

### Sessão 2026-11-10

- P: Como a especificação deve tratar o filtro por Coleção/Área citado no texto de RF#02/UC04/US#04 em face dos 5 critérios (termo, ano, autor, orientador e tags) definidos nos diagramas de classes e de atividades? → R: Opção A — Manter apenas os 5 critérios dos diagramas (termo, ano, autor, orientador e tags), tratando área/coleção como agrupamento representado pelas próprias tags.
- P: Em quais atributos o termo livre deve ser pesquisado e qual a regra de correspondência para termo livre, autor, orientador e múltiplas tags? → R: Opção A — Termo livre busca por substring case-insensitive em título, resumo, autor, orientador/coorientador e tags; filtros de autor/orientador usam substring case-insensitive; filtro de tags exige todas as tags informadas (E) com comparação case-insensitive.
- P: Como o sistema deve ordenar os resultados da busca e tratar pesquisas sem critérios preenchidos? → R: Opção B — Sem filtros/termo preenchidos, retornar todos os TCCs publicados; ordenar os resultados do mais recente para o mais antigo (ano/semestre decrescente) e, em caso de empate, por identificador/ordem de cadastro.
- P: Qual deve ser o escopo da visualização de detalhes do TCC (atributos exibidos, contagem de visualizações e trabalhos conexos)? → R: Opção C — Apresentar todos os dados preenchidos pelo autor, incrementar o contador de visualizações e incluir também a sugestão de "trabalhos conexos" (UC06, por tags em comum).
- P: Como o sistema deve se comportar quando o usuário tenta baixar o artigo de um TCC publicado sem arquivo anexado? → R: Opção A — Se o TCC publicado não tiver arquivo anexado (0..1), impedir a transferência e informar que o arquivo direto não está disponível, indicando a consulta pelo link oficial do LUME do TCC (reservando a mensagem do FA02 para falhas na transferência do arquivo).

