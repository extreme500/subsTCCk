# Especificação da funcionalidade: Buscar e Filtrar TCCs

**Pasta:** `specs/001-buscar-filtrar-tccs` | **Data:** 2026-11-08 | **Status:** Rascunho (esclarecida na fase Clarify)
**Origem no relatório:** RF#02 (parte de busca, filtro e download), UC04, US#04, CT03, CT05, CT06; diagrama de atividades do UC04; diagrama de casos de uso (UC04 e UC05)

<!-- A especificação diz O QUE o sistema faz e POR QUÊ. Não cite linguagem, framework, banco, classes ou arquivos. -->

## Contexto e motivação

Hoje a busca por trabalhos anteriores é burocrática e baseada apenas em palavras-chave, o que gera baixo engajamento (relatório, problema do RF#2). Os repositórios usados como referência ou não permitem combinar filtros (Biblioteca Digital de TCC da UFSM) ou mostram listagens só em texto (LUME). Esta funcionalidade permite que qualquer usuário leitor (aluno pesquisador, professor ou visitante, autenticado ou não) encontre TCCs publicados combinando um termo livre com filtros, veja os detalhes do trabalho escolhido e baixe o arquivo dele, para encontrar referências bibliográficas e identificar potenciais orientadores (US#04).

## Cenários do usuário e testes

### História 1 - Encontrar TCCs combinando termo e filtros (Prioridade: P1)

Um usuário leitor abre a busca, digita um termo e/ou escolhe filtros (ano, autor, orientador, tags, coleção) e pesquisa. O sistema mostra, em forma de feed, somente os TCCs publicados que atendem a todos os critérios ao mesmo tempo. Se nenhum trabalho atende, o sistema avisa e o usuário ajusta os critérios e pesquisa de novo.

**Por que esta prioridade:** é o núcleo do RF#02/UC04 e o problema que motiva o requisito (busca burocrática). Sem ela, detalhes e download não têm ponto de entrada.

**Teste independente:** com a base de CT03 (TCCs A a E), aplicar as combinações de CT03 e CT05 e conferir quais TCCs aparecem e qual mensagem é exibida.

**Cenários de aceitação:**

1. **Dado** a base de CT03 (A, B, C, D publicados; E em rascunho), **Quando** o usuário seleciona Ano = 2025, Orientador = "Carlos Lima" e Tag = "Redes" e pesquisa, **Então** o feed mostra apenas o TCC A (B, C e D não atendem a todas as condições e E é rascunho). *(CT03)*
2. **Dado** a mesma base, **Quando** o usuário seleciona Ano = 2023 e Tag = "Redes" e pesquisa, **Então** o feed fica vazio e o sistema exibe "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros." *(CT03 variação; UC04 FA01)*
3. **Dado** a mesma base, **Quando** o usuário digita o termo "blockchain", seleciona Tag = "Redes" e pesquisa, **Então** o feed fica vazio e o sistema exibe a mensagem do FA01. *(CT05 passo 3)*
4. **Dado** o cenário anterior, **Quando** o usuário remove o termo "blockchain", mantém Tag = "Redes" e pesquisa novamente, **Então** o feed mostra os TCCs A, C e D, e o TCC E continua oculto. *(CT05 passo 4; UC04 FA01 retorno ao passo 5)*
5. **Dado** a mesma base, **Quando** o usuário pesquisa pelo título do TCC E (rascunho), **Então** o sistema exibe a mensagem do FA01, pois rascunhos não aparecem na busca. *(CT05 variação; CT02)*
6. **Dado** TCCs publicados de vários orientadores, **Quando** o usuário digita o nome de um orientador na barra de pesquisa, **Então** somente os trabalhos desse orientador aparecem. *(US#04 cenário 3)*
7. **Dado** TCCs publicados de vários cursos de origem, **Quando** o usuário seleciona a coleção "Ciência da Computação", **Então** os trabalhos que não são desse curso não ficam visíveis. *(US#04 cenário 2; Esclarecimentos P1)*
8. **Dado** a base de CT03, **Quando** o usuário pesquisa sem termo e sem filtros, **Então** o feed mostra todos os TCCs publicados (A, B, C e D) e não mostra o E. *(Esclarecimentos P5; CT03)*
9. **Dado** TCCs publicados com tags {Redes, IA} e {Redes}, **Quando** o usuário seleciona as tags "Redes" e "IA", **Então** aparece somente o TCC que tem as duas tags. *(UC04 passo 5; Esclarecimentos P3)*
10. **Dado** um TCC publicado cujo resumo contém "Segurança", **Quando** o usuário digita "seguranca" na barra de pesquisa, **Então** o TCC é encontrado. *(Esclarecimentos P2)*

### História 2 - Ver os detalhes de um TCC encontrado (Prioridade: P2)

A partir do feed de resultados, o usuário seleciona um trabalho e o sistema apresenta suas características e descrição, como preenchidas pelo autor.

**Por que esta prioridade:** é o passo que transforma um resultado em informação útil (decidir se o trabalho é referência ou se o orientador é de interesse), mas depende da História 1 para ser alcançado no fluxo normal.

**Teste independente:** abrir diretamente um TCC publicado conhecido (ex.: TCC A de CT03) e conferir que todas as informações preenchidas pelo autor são apresentadas.

**Cenários de aceitação:**

1. **Dado** que o feed mostra o TCC A, **Quando** o usuário o seleciona, **Então** o sistema exibe as informações preenchidas pelo autor. *(CT03; UC04 passos 6-7)*
2. **Dado** um TCC publicado, **Quando** o usuário clica nele, **Então** seu conteúdo é aberto e apresentado pelo sistema. *(US#04 cenário 1)*
3. **Dado** um TCC em rascunho, **Quando** alguém tenta abrir seus detalhes por qualquer caminho, **Então** o sistema não o apresenta. *(UC04 pré-condição; CT02)*
4. **Dado** um TCC publicado sem arquivo anexado, **Quando** o usuário abre seus detalhes, **Então** o botão "Baixar Artigo" não é oferecido e o link do documento oficial no LUME é exibido. *(Esclarecimentos P4; UC01 passo 6)*

### História 3 - Baixar o arquivo do TCC, com nova tentativa em caso de falha (Prioridade: P3)

Na página de detalhes, o usuário aperta "Baixar Artigo" e o sistema transfere o arquivo do trabalho para o dispositivo. Se a transferência falhar, o usuário é avisado, nada incompleto fica salvo e ele pode tentar de novo.

**Por que esta prioridade:** completa a pós-condição do UC04 (documento disponibilizado para download), mas só tem valor depois que o trabalho foi encontrado e aberto.

**Teste independente:** com o TCC A publicado com arquivo PDF, simular falha na transferência e depois sucesso, conforme CT06.

**Cenários de aceitação:**

1. **Dado** o TCC A publicado com arquivo PDF e a página de detalhes aberta, **Quando** o usuário clica em "Baixar Artigo" e a transferência é concluída, **Então** o arquivo PDF do TCC A é salvo no dispositivo. *(UC04 passos 8-9; CT06 passo 4)*
2. **Dado** a mesma situação, **Quando** a transferência é interrompida, **Então** o sistema exibe "Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente.", nenhum arquivo incompleto é salvo, a página do TCC continua aberta e o botão "Baixar Artigo" continua disponível. *(UC04 FA02; CT06 passo 3)*
3. **Dado** que um download falhou, **Quando** a conexão volta e o usuário clica novamente em "Baixar Artigo", **Então** o download é concluído e o arquivo é salvo. *(UC04 FA02 retorno ao passo 9; CT06 passo 4)*

### Casos-limite

- Um rascunho que atende a todos os critérios (como o TCC E em CT03) nunca aparece nos resultados, nem nos detalhes, nem no download. *(CT03, CT05, CT02)*
- O valor do filtro de orientador é digitado sem o título acadêmico ("Carlos Lima") e o cadastro tem título ("Profº Carlos Lima"): o TCC deve ser encontrado. *(CT03)*
- O filtro de ano (ex.: 2025) recebe só o ano; TCCs de qualquer semestre desse ano (2025/1 e 2025/2) atendem. *(CT03)*
- Termo livre combinado com filtro, sem nenhum TCC que atenda aos dois: feed vazio com a mensagem do FA01, mesmo que cada critério isolado tenha resultados. *(CT05)*
- O usuário pesquisa sem termo e sem filtros: o feed lista todos os TCCs publicados (FR-011; Esclarecimentos P5).
- O TCC selecionado não tem arquivo anexado (o arquivo é opcional no cadastro): o botão "Baixar Artigo" não é oferecido e os detalhes mostram o link do LUME (FR-015; Esclarecimentos P4).
- O termo é digitado sem acentos ou com maiúsculas/minúsculas diferentes do cadastro, ou é só parte de uma palavra: o TCC é encontrado (FR-004; Esclarecimentos P2).
- Várias tags selecionadas e nenhum TCC tem todas elas: feed vazio com a mensagem do FA01, mesmo que haja TCCs com parte das tags (FR-008; Esclarecimentos P3).
- A transferência do arquivo falha no meio: nenhum arquivo parcial pode ficar no dispositivo. *(CT06)*
- Falhas repetidas de download: o usuário pode tentar quantas vezes quiser, sempre com a mesma mensagem. *(UC04 FA02, que retorna ao passo 9 sem limite)*
- O usuário é visitante (não autenticado): busca, detalhes e download funcionam da mesma forma. *(UC04 ator principal; relatório §2.1)*

## Requisitos

### Requisitos funcionais

**Acesso**

- **FR-001**: O sistema DEVE permitir que qualquer usuário leitor (aluno pesquisador, professor ou visitante), autenticado ou não, use a busca, veja os detalhes e baixe o arquivo de TCCs publicados. *(origem: UC04 ator principal; diagrama de casos de uso; relatório §2.1, visitantes em modo leitura)*
- **FR-002**: A busca, a visualização de detalhes e o download NÃO DEVEM alterar nenhum dado dos TCCs; nenhuma ação desta funcionalidade exige permissão de escrita. *(origem: relatório §2.1, restrição de acesso de visitantes)*

**Critérios de busca**

- **FR-003**: O sistema DEVE oferecer, na tela "Buscar TCC", uma barra de pesquisa para termo livre e filtros por Data/Ano, Autores, Orientadores, Assuntos/Tags e Coleções. *(origem: RF#02; UC04 passo 2)*
- **FR-003a**: O filtro de coleção DEVE selecionar os TCCs cujo curso de origem (agrupamento institucional, como no LUME; ex.: "Ciência da Computação") seja o curso escolhido. Coleção não representa tema: o tema é coberto pelo filtro de tags. *(origem: RF#02; UC04 passo 2; US#04 cenário 2; benchmark LUME; Esclarecimentos P1)*
- **FR-004**: O sistema DEVE procurar o termo livre no título, no resumo simplificado, nos nomes do autor e do orientador e nos nomes das tags dos TCCs publicados. Um TCC atende ao termo se ele aparecer em pelo menos um desses dados, com correspondência parcial (o termo pode ser parte do texto) e sem diferenciar maiúsculas de minúsculas nem letras acentuadas de não acentuadas. Assim, ao digitar o nome de um orientador aparecem os trabalhos dele (US#04 cenário 3), e ao digitar o título de um trabalho ele é encontrado (CT05 variação). *(origem: UC04 passo 3; US#04; CT05; problema do RF#2; Esclarecimentos P2)*
- **FR-005**: O sistema DEVE aceitar qualquer combinação de termo e filtros e aplicar todos os critérios informados simultaneamente: um TCC só aparece se atender a todos eles. *(origem: UC04 passo 5; diagrama de atividades UC04; CT03; benchmark UFSM, cuja crítica é não permitir mais de um filtro)*
- **FR-006**: O filtro de ano DEVE selecionar TCCs de qualquer semestre do ano informado. *(origem: CT03, Ano = 2025 retorna TCC de 2025/1)*
- **FR-007**: Os filtros de autor e de orientador DEVEM encontrar o TCC quando o valor informado for parte do nome cadastrado, sem diferenciar maiúsculas de minúsculas (ex.: "Carlos Lima" encontra "Profº Carlos Lima"). *(origem: CT03)*
- **FR-008**: O sistema DEVE permitir selecionar mais de uma tag no filtro de tags; nesse caso, o TCC só atende ao filtro se tiver todas as tags selecionadas (E). *(origem: UC04 passo 2, "Assuntos/Tags", e passo 5, "todas as condições, simultaneamente"; RF#02; diagrama de atividades UC04; Esclarecimentos P3)*

**Resultados**

- **FR-009**: O sistema DEVE retornar somente TCCs com status PUBLICADO; TCCs em RASCUNHO nunca aparecem nos resultados, mesmo que atendam a todos os critérios. *(origem: UC04 pré-condição; diagrama de atividades UC04, "somente TCCs PUBLICADOS"; CT03; CT05 variação; CT02)*
- **FR-010**: O sistema DEVE apresentar os resultados em forma de feed, exibindo para cada TCC ao menos título, autor, orientador, ano/semestre, tags e resumo simplificado, de modo que o usuário possa escolher qual abrir. *(origem: UC04 passo 5; diagrama de atividades UC04; dados resumidos de TCC no diagrama de classes)*
- **FR-011**: Quando o usuário pesquisar sem termo e sem nenhum filtro, o sistema DEVE listar todos os TCCs publicados no feed, na mesma ordem usada para os demais resultados; rascunhos continuam excluídos (FR-009). Se não houver nenhum TCC publicado, vale FR-012. *(origem: UC04 objetivo, "explorar os trabalhos de interesse", e passo 3, "e/ou"; Esclarecimentos P5)*
- **FR-012**: Quando nenhum TCC publicado atender aos critérios, o sistema DEVE apresentar o feed vazio e exibir literalmente "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros.", mantendo o termo e os filtros informados para que o usuário possa ajustá-los e pesquisar novamente. *(origem: UC04 FA01; CT03 variação; CT05)*

**Detalhes**

- **FR-013**: Ao selecionar um TCC do feed, o sistema DEVE exibir suas características e descrição como preenchidas pelo autor: título, resumo simplificado, autor, orientador, coorientador (se houver), ano/semestre, curso de origem (coleção), tags, imagens de demonstração (se houver) e link do documento oficial no LUME. O link do LUME é sempre exibido, inclusive quando o TCC não tem arquivo para download. *(origem: UC04 passos 6-7; US#04 cenário 1; diagrama de atividades UC04, "resumo, imagens, tags"; RF#01 para a lista de dados preenchidos pelo autor; CT03; Esclarecimentos P1 e P4)*
- **FR-014**: O sistema NÃO DEVE exibir detalhes nem permitir download de um TCC em RASCUNHO, ainda que ele seja solicitado diretamente (sem passar pela busca); para o leitor, o trabalho se comporta como inexistente. *(origem: UC04 pré-condição; CT02, "não aparece no feed nem nos resultados de busca")*

**Download**

- **FR-015**: Na página de detalhes de um TCC que tem arquivo anexado, o sistema DEVE oferecer o botão "Baixar Artigo"; ao acioná-lo, o sistema DEVE transferir para o dispositivo do usuário o arquivo do trabalho, no formato em que foi anexado (DOCX, PDF ou EPUB), íntegro. *(origem: RF#02; UC04 passos 8-9; diagrama de atividades UC04; CT06)*
- **FR-015a**: Quando o TCC publicado não tiver arquivo anexado (o arquivo é opcional no cadastro, UC01 passo 6), o sistema NÃO DEVE oferecer o botão "Baixar Artigo" e nenhuma mensagem é exibida por isso; o acesso ao documento fica pelo link do LUME mostrado nos detalhes (FR-013). *(origem: UC01 passo 6; diagrama de classes, 0..1 arquivo por TCC; Esclarecimentos P4)*
- **FR-016**: Se a transferência falhar, o sistema DEVE exibir literalmente "Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente.", NÃO DEVE deixar arquivo incompleto no dispositivo, DEVE manter a página do TCC aberta com o botão "Baixar Artigo" disponível e DEVE permitir novas tentativas, sem limite. *(origem: UC04 FA02; CT06; diagrama de atividades UC04)*

### Entidades-chave

- **TCC**: trabalho de conclusão cadastrado por um aluno formando. Atributos relevantes para esta funcionalidade: título, resumo simplificado, ano, semestre, curso de origem (coleção), link do LUME, status (RASCUNHO ou PUBLICADO), autor, orientador, coorientador opcional, de 1 a 5 tags, até 3 imagens de demonstração e até 1 arquivo do trabalho. *(diagrama de classes; RF#01; UC01; Esclarecimentos P1 para o curso de origem, que é dado novo)*
- **Status do TCC**: RASCUNHO ou PUBLICADO; somente PUBLICADO é visível ao leitor. *(diagrama de classes; UC04 pré-condição)*
- **Autor (aluno formando)** e **Orientador/Coorientador (professor)**: pessoas associadas ao TCC, identificadas pelo nome na busca. *(diagrama de classes)*
- **Tag**: assunto temático do TCC; pode pertencer a uma Área. *(diagrama de classes; US#04)*
- **Área**: agrupamento de tags. Existe no diagrama de classes, mas não é critério de busca nesta funcionalidade (o tema é coberto pelo filtro de tags). *(diagrama de classes; Esclarecimentos P1)*
- **Coleção (curso de origem)**: agrupamento institucional ao qual o TCC pertence, como no LUME (ex.: "Ciência da Computação"). Cada TCC pertence a uma coleção. É um dado novo: não consta do diagrama de classes nem dos campos do cadastro (RF#01/UC01). *(RF#02; UC04 passo 2; benchmark LUME; Esclarecimentos P1)*
- **Arquivo do TCC**: documento do trabalho, com nome original e formato (DOCX, PDF ou EPUB). *(diagrama de classes; RF#01; diagrama de atividades UC04)*
- **Imagem de demonstração**: até 3 por TCC, com descrição. *(diagrama de classes; RF#01)*
- **Critérios de busca**: termo livre, ano, autor, orientador, tags e coleção, todos opcionais e combináveis; sem nenhum critério, a busca lista todos os publicados. *(UC04; diagrama de classes, que não traz coleção; Esclarecimentos P1 e P5)*

## Critérios de sucesso

- **SC-001**: Com a base de CT03, a pesquisa Ano = 2025 + Orientador = "Carlos Lima" + Tag = "Redes" retorna exatamente 1 TCC (o A). *(CT03)*
- **SC-002**: Em 100% das pesquisas, dos acessos a detalhes e dos downloads, nenhum TCC em rascunho é exposto ao leitor. *(CT03, CT05, CT02)*
- **SC-003**: Em 100% das pesquisas sem resultado, a mensagem do FA01 é exibida literalmente e o usuário consegue refazer a pesquisa ajustando os critérios sem precisar reinformar os que manteve. *(UC04 FA01; CT05)*
- **SC-004**: Em 100% das falhas de transferência, a mensagem do FA02 é exibida, 0 arquivos incompletos ficam no dispositivo e a tentativa seguinte, com a conexão restabelecida, salva um arquivo idêntico ao anexado pelo autor. *(UC04 FA02; CT06)*
- **SC-005**: O usuário consegue combinar o termo livre e todos os filtros disponíveis em uma única pesquisa (uma ação de "Pesquisar"). *(UC04 passo 5; benchmark UFSM)*
- **SC-006**: Um visitante não autenticado consegue completar o fluxo buscar → ver detalhes → baixar sem precisar fazer login. *(UC04 ator principal; relatório §2.1)*
- **SC-007**: Em 100% dos TCCs publicados sem arquivo, a página de detalhes não oferece "Baixar Artigo" e exibe o link do LUME. *(Esclarecimentos P4)*
- **SC-008**: Uma pesquisa sem termo e sem filtros retorna exatamente o conjunto de TCCs publicados (na base de CT03: A, B, C e D). *(Esclarecimentos P5)*

## Premissas

- **Valores dos filtros de ano, autor, orientador e coleção:** cada um recebe um único valor por pesquisa, como no conjunto de critérios do diagrama de classes (ano, autor e orientador como valores únicos; coleção segue a mesma regra). Apenas o filtro de tags admite vários valores (FR-008).
- **Curso de origem disponível nos TCCs:** esta funcionalidade só consulta o curso de origem; quem o registra é o cadastro (UC01/RF#01), que hoje não tem esse campo. Assume-se que todo TCC publicado tem curso de origem; um TCC sem esse dado não atende a nenhum filtro de coleção, mas continua aparecendo nas pesquisas sem esse filtro.
- **Filtro de orientador e coorientador:** o filtro de orientador considera o orientador do TCC; o coorientador não é considerado, porque CT03 e US#04 falam só de "orientador" e o resumo de TCC do diagrama de classes traz apenas o orientador. Pode ser revisto na fase Clarify.
- **Ordem dos resultados:** o feed é ordenado do trabalho mais recente para o mais antigo (ano/semestre decrescente), por coerência com o RF#02, que valoriza os "defendidos mais recentemente". O relatório não define ordem; nenhum caso de teste depende dela.
- **Mensagens:** as mensagens ao usuário seguem literalmente o texto dos casos de uso (constituição, princípio III).
- **Requisitos não funcionais:** o relatório não define metas de desempenho, disponibilidade ou acessibilidade para a busca; esta especificação não cria metas que o material não sustenta.
- **Autenticação:** não é exigida nem verificada nesta funcionalidade; o login institucional é tratado em outra funcionalidade (UC01).

### Divergências registradas entre as fontes (constituição, princípio III)

- **Filtros disponíveis:** UC04 e RF#02 citam 5 filtros (incluindo Coleções); o diagrama de atividades do UC04 e o conjunto de critérios do diagrama de classes têm só Ano, Autor, Orientador e Tags. Resolvido em Esclarecimentos P1: vale o UC04, com coleção = curso de origem (FR-003a). O diagrama de classes (TCC e critérios de busca) e o cadastro (RF#01/UC01) não têm esse dado; a divergência continua registrada e deve ser tratada no Plan.
- **Coleção no benchmark:** o benchmark do LUME critica que "o curso vem do cadastro do autor, não do tema". Aqui a coleção é justamente o curso e o tema fica nas tags (Esclarecimentos P1), então a crítica não se aplica a esta funcionalidade.
- **Texto da mensagem de "nenhum resultado":** UC04 FA01 e CT05 trazem "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."; CT03 omite o ponto final; o diagrama de atividades abrevia para "Nenhum trabalho encontrado para os critérios informados". Adota-se o texto do UC04.
- **Texto da mensagem de falha no download:** UC04 FA02 traz "Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente."; o diagrama de atividades abrevia para "Ocorreu um erro durante o download, verifique a sua conexão". Adota-se o texto do UC04.
- **Conteúdo dos detalhes:** UC04 passo 7 fala em "características e descrição como preenchidas pelo autor"; o diagrama de atividades lista "resumo, imagens, tags e trabalhos conexos"; o resumo de TCC do diagrama de classes não tem imagens, coorientador nem link do LUME. Adota-se o UC04 completado pelos dados do RF#01 (FR-013); trabalhos conexos ficam fora de escopo (ver abaixo).
- **Retorno após "nenhum resultado":** o UC04 FA01 diz que o fluxo "retorna ao passo 5"; o diagrama de atividades volta à inserção de termos/filtros. São compatíveis: o usuário ajusta os critérios e pesquisa de novo (FR-012).
- **Grafia do orientador nos casos de teste:** CT01 usa "Prof. Carlos Lima" e CT03 usa "Profº Carlos Lima"; isso reforça a correspondência parcial de FR-007.

## Fora de escopo

- Feed inicial de destaques (TCCs defendidos mais recentemente e tópicos mais explorados), que é a outra parte do RF#02.
- Mapear e exibir trabalhos conexos (UC06, que estende UC05 e corresponde a outra feature, "Mapeamento e Sugestão de Trabalhos Conexos"), embora o diagrama de atividades do UC04 os cite na tela de detalhes.
- Busca semântica (a feature "Busca Multifacetada e Semântica" vai além do UC04).
- Contagem de visualizações dos TCCs (existe no diagrama de classes, mas nenhum passo do UC04 nem caso de teste a exige).
- Cadastro, edição, publicação e validação do link do LUME (UC01, UC02, UC03), inclusive o registro do curso de origem de cada TCC (dependência criada por Esclarecimentos P1).
- Filtro por Área temática (Esclarecimentos P1).
- Autenticação e perfis de usuário.
- Interface gráfica (constituição, princípio V); a interação é descrita em termos de ações do usuário.

## Esclarecimentos

<!-- Preenchido na fase Clarify. -->

### Sessão 2026-11-08

- P1: O que é o filtro "Coleção" (citado em RF#02 e UC04, sem definição no relatório e ausente dos diagramas)? → R: B. Coleção é um agrupamento institucional, o curso de origem do TCC (ex.: "Ciência da Computação"), como no LUME; isso exige um dado novo no TCC. A opção recomendada (A, Área temática) foi rejeitada porque o tema já é coberto pelo filtro de tags. *(afeta: FR-003, FR-003a, FR-013, História 1 cenário 7, Entidades-chave, Premissas, Divergências, Fora de escopo)*
- P2: Em quais dados o termo livre é procurado e como é comparado? → R: A. No título, no resumo, nos nomes de autor e orientador e nas tags, com correspondência parcial, sem diferenciar maiúsculas/minúsculas e acentos. *(afeta: FR-004, História 1 cenário 10, Casos-limite)*
- P3: Com várias tags selecionadas, o TCC precisa ter todas ou basta uma? → R: A. E: o TCC precisa ter todas as tags selecionadas. *(afeta: FR-008, História 1 cenário 9, Casos-limite)*
- P4: O que o leitor vê quando o TCC publicado não tem arquivo? → R: A. O botão "Baixar Artigo" não aparece e os detalhes mostram o link do LUME. *(afeta: FR-013, FR-015, FR-015a, História 2 cenário 4, Casos-limite, SC-007)*
- P5: O que acontece na pesquisa sem termo e sem filtros? → R: A. Lista todos os TCCs publicados. *(afeta: FR-011, História 1 cenário 8, Casos-limite, Entidades-chave, SC-008)*
