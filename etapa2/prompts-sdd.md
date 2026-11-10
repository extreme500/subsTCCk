# Prompts do experimento de SDD (idênticos para as duas ferramentas)

Funcionalidade: **RF#02 / UC04 - Buscar e Filtrar TCCs e baixar o artigo** (US#04; CT03, CT05 e CT06).

Abordagem: as seis fases do GitHub Spec Kit (Specify, Clarify, Plan, Tasks, Implement, Analyze). Os prompts foram escritos pelo grupo em português, sem a CLI do Spec Kit, com templates simplificados em `.specify/templates/`.

Cole um prompt por vez, na mesma conversa. Só envie o próximo depois que a ferramenta terminar e parar. Anote no registro (`registro-experimentos.md`):

- o horário de início e de fim de cada fase;
- quantas vezes você precisou intervir;
- qualquer erro ou desvio.

---

## Prompt 1 - SPECIFY

```text
Você vai aplicar Spec-Driven Development, em seis fases (Specify, Clarify, Plan, Tasks, Implement, Analyze), a UMA funcionalidade de um trabalho de Engenharia de Software. Antes de tudo, leia LEIA-ME.md, .specify/memory/constitution.md e todo o conteúdo de contexto/ (relatório da Etapa 1, diagramas e a transcrição deles). Use somente os arquivos desta pasta.

FASE 1 - SPECIFY.

Funcionalidade: RF#02 / UC04 - Buscar e Filtrar TCCs. Um usuário leitor (aluno pesquisador, professor ou visitante, autenticado ou não) quer encontrar TCCs publicados combinando um termo livre com filtros (ano, autor, orientador, tags e coleção), ver os detalhes do trabalho escolhido e baixar o arquivo dele. O objetivo é tornar a descoberta de trabalhos anteriores menos burocrática do que a busca por palavra-chave dos repositórios institucionais, ajudando a encontrar referências e potenciais orientadores. Rascunhos nunca podem aparecer. Quando nada for encontrado, ou quando o download falhar, o usuário precisa ser avisado e poder tentar de novo. O feed inicial de destaques (a outra parte do RF#02) está fora do escopo.

Crie specs/001-buscar-filtrar-tccs/spec.md seguindo .specify/templates/spec-template.md. A especificação diz O QUE e POR QUÊ, sem decisões de tecnologia. Use os casos de uso, user stories e casos de teste do relatório como fonte e indique a origem de cada requisito. Onde o material não decide algo, marque [NEEDS CLARIFICATION: pergunta] (no máximo 5 marcações, as de maior impacto).

Ao terminar, liste os pontos marcados e PARE. Não avance para a próxima fase.
```

## Prompt 2 - CLARIFY

```text
FASE 2 - CLARIFY.

Releia specs/001-buscar-filtrar-tccs/spec.md e procure ambiguidades, lacunas e contradições, tanto dentro da especificação quanto entre ela e o relatório e os diagramas em contexto/ (escopo, dados e entidades, comportamento dos filtros, casos-limite, mensagens, tratamento de erros, requisitos não funcionais). Inclua os pontos [NEEDS CLARIFICATION] já marcados.

Faça no máximo 5 perguntas, UMA POR VEZ, escolhendo as de maior impacto. Cada pergunta deve ter de 2 a 4 opções, com a sua recomendação e o motivo. Não pergunte sobre tecnologia.

Depois de cada resposta, registre-a na seção "Esclarecimentos" (P → R) e atualize as seções afetadas da especificação, removendo o marcador correspondente.

Ao terminar, resuma o que mudou na especificação e PARE.
```

## Prompt 3 - PLAN

```text
FASE 3 - PLAN.

Restrições técnicas definidas pelo grupo:
- JavaScript (ES modules) em Node.js 20 ou superior, sem nenhuma dependência externa (não deve ser preciso rodar npm install);
- testes com o executor nativo: node --test;
- camadas e nomes conforme os diagramas de pacotes e de classes (controller, service, repository, model, dto; TccController, TccService, TccRepository, TccDTO, FiltroBusca, TCC, ArquivoTcc, StatusTcc etc.);
- persistência em memória, com dados iniciais que contenham os TCCs A a E do CT03 e o que mais for necessário para executar CT05 e CT06;
- sem interface gráfica: a interface com o usuário é a API pública do TccController;
- ponto de entrada src/app.js, exportando uma função que monta a aplicação e permite injetar dependências (por exemplo, para simular a falha de download nos testes);
- código em src/ e testes em tests/, na raiz desta pasta.

Crie specs/001-buscar-filtrar-tccs/plan.md seguindo .specify/templates/plan-template.md. Ele deve conter:
- a verificação da constituição;
- a estrutura de pastas;
- o modelo de dados;
- os contratos públicos (classes e métodos com parâmetros, retorno e erros);
- as decisões técnicas, com as alternativas descartadas;
- como a falha de download será simulada;
- a rastreabilidade FR → componente → teste;
- o quickstart.

Se a especificação e os diagramas divergirem, registre a divergência e a decisão tomada. Não escreva código ainda. PARE ao final.
```

## Prompt 4 - TASKS

```text
FASE 4 - TASKS.

A partir de spec.md e plan.md, crie specs/001-buscar-filtrar-tccs/tasks.md seguindo .specify/templates/tasks-template.md:
- tarefas numeradas (T001, T002...), agrupadas por fase e por história da especificação;
- cada tarefa com o caminho do arquivo e a origem (FR e/ou CT);
- as tarefas de teste vêm antes das de implementação que elas verificam;
- marque com [P] o que pode ser feito em paralelo;
- inclua a seção de dependências.

Não escreva código ainda. PARE ao final.
```

## Prompt 5 - IMPLEMENT

```text
FASE 5 - IMPLEMENT.

Execute as tarefas de tasks.md na ordem, marcando [x] em cada uma ao concluir:
- escreva os testes primeiro e rode node --test para confirmar que falham;
- depois implemente até que todos passem;
- não altere spec.md nem plan.md; se precisar se desviar do plano, registre o desvio e o motivo na seção "Desvios durante a implementação" de tasks.md.

Ao final, rode node --test e mostre o resumo da saída (testes, aprovados, falhas).
```

## Prompt 6 - ANALYZE / CONVERGE

```text
FASE 6 - ANALYZE / CONVERGE.

Sem alterar nenhum arquivo existente, verifique a coerência entre constituição, spec.md, plan.md, tasks.md, código e testes, e também entre esses artefatos e o relatório e os diagramas em contexto/. Escreva o resultado em specs/001-buscar-filtrar-tccs/analysis.md, com:

1. Tabela de achados com as colunas ID, categoria, severidade, local, resumo e recomendação.
   - Categorias: duplicação, ambiguidade, subespecificação, inconsistência, lacuna de cobertura, violação da constituição.
   - Severidades: CRÍTICA, ALTA, MÉDIA, BAIXA.
2. Matriz de cobertura: cada FR → tarefas → testes, apontando os FR sem teste.
3. Inconsistências encontradas no próprio material da Etapa 1 (relatório e diagramas), com o local exato de cada uma.
4. Métricas:
   - número de FR;
   - porcentagem com teste;
   - número de achados por severidade;
   - número de testes e quantos passam.

PARE ao final.
```
