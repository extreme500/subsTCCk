# Constituição do projeto (princípios definidos pelo grupo)

Estes princípios valem para todas as fases (Specify, Clarify, Plan, Tasks, Implement, Analyze). Um artefato que viole um princípio deve dizer qual princípio viola e por quê.

## I. Rastreabilidade

Todo requisito da especificação indica sua origem no relatório da Etapa 1 (RF, UC, US ou CT). Toda tarefa indica os requisitos que atende. Todo teste automatizado indica o caso de teste (CT) ou requisito que verifica.

## II. Testes derivados dos casos de teste, escritos antes do código

Os casos de teste do relatório (CT03, CT05 e CT06, para a busca) são a fonte dos testes automatizados. Os testes são escritos antes da implementação e devem falhar antes dela existir.

## III. Fidelidade ao domínio

Nomes de classes, métodos e atributos seguem os diagramas de classes e de pacotes. As mensagens exibidas ao usuário são reproduzidas literalmente como estão nos casos de uso. Quando o diagrama e o texto divergirem, a divergência é registrada, não escolhida em silêncio.

## IV. Arquitetura em camadas

A solução segue as camadas do diagrama de pacotes: controller (apresentação) → service (negócio) → repository (dados) → model (domínio), com dto para dados de entrada/saída. Dependências externas (armazenamento de arquivos, LUME) ficam atrás de interfaces que podem ser substituídas nos testes.

## V. Simplicidade

Sem dependências externas e sem interface gráfica: a interface com o usuário fica fora deste experimento e é representada pela API do controller. Persistência em memória. Nada além do necessário para cumprir a especificação.

## VI. Ambiguidade é explicitada, não suposta

Pontos que o material não decide são marcados como `[NEEDS CLARIFICATION: ...]` na especificação e resolvidos com o usuário na fase Clarify. Nenhuma fase posterior pode supor uma resposta em silêncio.
