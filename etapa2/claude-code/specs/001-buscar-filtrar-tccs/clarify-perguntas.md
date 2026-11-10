# Fase Clarify: perguntas pendentes

**Especificação:** `specs/001-buscar-filtrar-tccs/spec.md` | **Data:** 2026-11-08

Adaptação do experimento: como não há conversa durante a execução, as perguntas estão todas aqui, em ordem de impacto. A spec.md só será alterada depois das respostas. As cinco perguntas cobrem os cinco marcadores `[NEEDS CLARIFICATION]` da spec. Como o limite é de cinco, não sobrou pergunta para outras lacunas; elas estão listadas no final e ficam como premissas explícitas.

---

## P1. O que é o filtro "Coleção"? (FR-003)

RF#02 e UC04 citam "Coleções", mas o relatório não define o termo; o diagrama de classes não tem esse dado no TCC nem no conjunto de critérios de busca; o diagrama de atividades lista só Ano, Autor, Orientador e Tags. Já US#04 fala em filtrar por "áreas de interesse" e em selecionar o filtro da "área da computação", e o diagrama de classes tem a entidade Área, que agrupa tags.

| Opção | Resposta |
|---|---|
| A | Coleção = Área temática: o filtro seleciona uma Área, e o TCC atende se tiver ao menos uma tag dessa Área. |
| B | Coleção = outro agrupamento institucional (ex.: curso ou subcomunidade, como no LUME/UCS), exigindo um dado novo no TCC. |
| C | O filtro de coleção sai do escopo; ficam Ano, Autor, Orientador e Tags, como no diagrama de atividades e no diagrama de classes, e a divergência com UC04/RF#02 é registrada. |

**Recomendação: A.** Atende US#04 (cenário 2, filtro por área) e usa uma entidade que já existe no modelo de domínio (Tag → Área), sem criar dado que o cadastro (RF#01/UC01) não coleta. A opção B exigiria mudar o cadastro, que está fora desta funcionalidade; a opção C contraria o texto do UC04 e do RF#02.

---

## P2. Onde o termo livre é procurado e como é comparado? (FR-004)

US#04 exige que digitar o nome de um orientador traga só os trabalhos dele; CT05 exige que o título seja pesquisável. Nada mais é definido.

| Opção | Resposta |
|---|---|
| A | Título, resumo simplificado, nomes de autor e orientador e nomes das tags; correspondência parcial (o termo pode ser parte do texto), sem diferenciar maiúsculas/minúsculas nem acentos. |
| B | Apenas título e resumo simplificado, com correspondência parcial e sem diferenciar maiúsculas/minúsculas/acentos; nomes de pessoas e tags só pelos filtros. |
| C | Como A, mas exigindo palavra inteira e diferenciando acentos. |

**Recomendação: A.** É a única opção que cumpre ao mesmo tempo US#04 (nome do orientador na barra) e CT05 (título), e responde ao problema do RF#2 (busca "burocrática e baseada apenas em palavras-chave"): o usuário não precisa saber em que campo está o que procura nem digitar com a grafia exata (CT01 e CT03 já grafam o mesmo orientador de formas diferentes). A opção B quebra o cenário 3 da US#04.

---

## P3. Com várias tags selecionadas, o TCC precisa ter todas ou basta uma? (FR-008)

UC04 passo 5 diz que aparecem os trabalhos que se encaixam "em todas as condições, simultaneamente"; não diz se cada tag é uma condição separada.

| Opção | Resposta |
|---|---|
| A | E: o TCC precisa ter todas as tags selecionadas. |
| B | OU dentro do filtro de tags (pelo menos uma das tags selecionadas) e E entre filtros diferentes. |
| C | Só uma tag por pesquisa. |

**Recomendação: A.** É a leitura literal do UC04 passo 5 e do diagrama de atividades ("aplicar todos os filtros simultaneamente"), e torna a regra única e previsível: todo critério escolhido restringe o resultado. A opção B ajuda a explorar, mas cria uma exceção que o material não menciona; a opção C contraria o plural "Assuntos/Tags" do UC04 e a crítica ao benchmark da UFSM.

---

## P4. O que o leitor vê quando o TCC publicado não tem arquivo? (FR-015)

O arquivo é opcional no cadastro (UC01 passo 6, "caso existente"; diagrama de classes, 0..1 arquivo por TCC), mas o UC04 sempre termina com o download. O link do LUME, por sua vez, é obrigatório para publicar.

| Opção | Resposta |
|---|---|
| A | O botão "Baixar Artigo" não é oferecido para esse TCC; a página de detalhes mostra o link do LUME como acesso ao documento oficial. |
| B | O botão aparece e, ao ser acionado, o sistema avisa que o trabalho não tem arquivo para download (mensagem nova, a definir). |
| C | O botão aparece e leva ao link do LUME no lugar do arquivo. |

**Recomendação: A.** Não exige mensagem que não existe nos casos de uso (constituição, princípio III), não oferece uma ação que vai falhar sempre, e todo TCC publicado tem link do LUME validado (UC01), então o leitor sempre tem como chegar ao documento. A opção C mistura "baixar" com "navegar para outro sistema", o que o UC04 não prevê.

---

## P5. O que acontece quando o usuário pesquisa sem termo e sem filtros? (FR-011)

UC04 passo 3 diz "insere termos e/ou seleciona os filtros", o que sugere ao menos um critério, mas não há fluxo alternativo nem mensagem para a pesquisa vazia.

| Opção | Resposta |
|---|---|
| A | Lista todos os TCCs publicados, em feed (na ordem definida para os resultados). |
| B | A pesquisa é impedida e o sistema pede ao menos um critério (mensagem nova, a definir). |
| C | Trata como "nenhum resultado" e exibe a mensagem do FA01. |

**Recomendação: A.** Serve ao visitante que quer só explorar o acervo (objetivo do UC04: "explorar os trabalhos de interesse"), é coerente com a regra de que cada critério restringe o resultado (sem critério, nada é restringido) e não cria mensagem fora dos casos de uso. A opção C seria enganosa, porque há trabalhos publicados.

---

## Outros pontos encontrados, não perguntados (limite de 5)

Ficam como premissas explícitas na spec.md e podem ser revistos se o usuário quiser:

- O filtro de orientador não considera o coorientador (CT03 e US#04 falam só de "orientador").
- Os resultados são ordenados do mais recente para o mais antigo (o relatório não define ordem).
- Ano, autor e orientador aceitam um único valor por pesquisa.
- Trabalhos conexos, embora citados no diagrama de atividades na tela de detalhes, ficam fora de escopo (UC06).
- Mensagens: adota-se o texto completo do UC04 onde o diagrama de atividades e o CT03 o abreviam (divergência registrada).
