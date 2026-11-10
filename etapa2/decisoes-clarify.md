# Decisões do grupo na fase Clarify

Respostas dadas às perguntas das IAs. Use estas mesmas decisões ao responder o Antigravity. Se ele perguntar algo que não está aqui, decidam, respondam e acrescentem uma linha nova, marcada com a ferramenta que fez a pergunta.

| # | Pergunta (origem) | Decisão do grupo | A IA recomendava | Igual à recomendação? |
|---|---|---|---|---|
| 1 | O que é o filtro "Coleção"? (Claude) | **Curso ou agrupamento institucional** (ex.: Ciência da Computação), como no LUME; exige um atributo novo no TCC | Área temática (via Tag → Área) | Não, rejeitada |
| 2 | Onde o termo livre é procurado e como é comparado? (Claude) | Título, resumo, autor, orientador e tags; correspondência parcial, sem diferenciar maiúsculas, minúsculas e acentos | Igual | Sim |
| 3 | Com várias tags, o TCC precisa ter todas ou basta uma? (Claude) | Todas (E) | Igual | Sim |
| 4 | O que o leitor vê quando o TCC publicado não tem arquivo? (Claude) | "Baixar Artigo" não aparece; os detalhes mostram o link do LUME | Igual | Sim |
| 5 | Pesquisa sem termo e sem filtros? (Claude) | Lista todos os TCCs publicados | Igual | Sim |

**Justificativa da decisão 1 (registrar no relatório):**

- **Motivo 1:** o RF#02 e o UC04 tratam "Coleção" como no LUME e no benchmark da UCS ("Subcomunidades e Coleções"), ou seja, como agrupamento institucional, e não como tema.
- **Motivo 2:** o tema já é coberto pelo filtro de Tags.
- **Consequência:** o diagrama de classes da Etapa 1 precisa ganhar o atributo coleção (curso) no TCC e no FiltroBusca. É uma lacuna real do material, que a IA ajudou a revelar.

## Respostas dadas ao Antigravity

O Antigravity fez outras perguntas, com outras opções. As respostas registradas na conversa dele foram:

| # | Pergunta (Antigravity) | Resposta dada | A IA recomendava | Igual à recomendação? | Bate com a decisão do grupo? |
|---|---|---|---|---|---|
| 1 | Coleção/Área × diagramas | Só os 5 critérios dos diagramas; coleção/área tratada como tags | Igual | Sim | **Não** (decisão 1: Coleção = curso). Nenhuma opção dizia "curso", e com o Gemini o grupo respondeu só com as opções dele. A decisão válida para o projeto continua a 1 |
| 2 | Correspondência do termo e dos filtros | Termo por trecho, sem diferenciar maiúsculas, em título, resumo, autor, orientador/coorientador e tags; tags com E | Igual | Sim | Em parte: a opção não tratava acentos (decisão 2) |
| 3 | Ordenação e pesquisa sem critérios | Mais recente primeiro; sem critérios, todos os publicados | Ordem de cadastro | Não, rejeitada | Sim (decisão 5; ordenação igual à do protótipo) |
| 4 | Escopo dos detalhes do TCC | Todos os dados do autor, contador de visualizações e trabalhos conexos (UC06) | Só o TccDTO, sem trabalhos conexos | Não, rejeitada | Pergunta nova, não feita ao Claude. Justificativa: o UC06 (Mapear Trabalhos Conexos) estende a visualização de detalhes, e o diagrama de atividades do UC04 mostra os trabalhos conexos |
| 5 | TCC publicado sem arquivo | Impedir o download e indicar o link do LUME | Igual | Sim | Sim (decisão 4) |
