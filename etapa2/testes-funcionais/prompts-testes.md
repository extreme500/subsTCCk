# Prompts do experimento de testes funcionais (idênticos para as duas ferramentas)

Objetivo: ampliar os casos de teste da Etapa 1 (CT01 a CT06) com classes de equivalência e análise de valor limite, para as duas funcionalidades: RF#01 / UC01 (Cadastrar TCC) e RF#02 / UC04 (Buscar e Filtrar TCCs).

O experimento também mede o efeito de refinar o prompt: o prompt 1 é simples; o prompt 2 é o refinado, com técnica, formato e critérios explícitos. Cole os dois na mesma conversa, um de cada vez, esperando a ferramenta terminar e parar.

---

## Prompt 1 - Versão simples

```text
Leia LEIA-ME.md e todo o conteúdo de contexto/. Use somente os arquivos desta pasta.

Amplie os casos de teste do relatório (CT01 a CT06) aplicando os critérios de teste funcional de classes de equivalência e análise de valor limite, para as duas funcionalidades: Cadastrar TCC (RF#01 / UC01) e Buscar e Filtrar TCCs (RF#02 / UC04).

Escreva o resultado em testes-funcionais-v1.md e PARE.
```

## Prompt 2 - Versão refinada

```text
Agora refaça o trabalho com mais rigor e escreva o resultado em um arquivo NOVO, testes-funcionais-v2.md (não altere testes-funcionais-v1.md). Siga exatamente esta estrutura, separadamente para cada funcionalidade (UC01 Cadastrar TCC e UC04 Buscar e Filtrar TCCs):

1. Condições de entrada: liste cada entrada ou condição que o relatório define (campos, limites, formatos, status, filtros), com a origem exata (RF, UC e passo, FA, US ou CT).

2. Tabela de classes de equivalência com as colunas: condição de entrada | classes válidas (IDs CV01, CV02...) | classes inválidas (IDs CI01, CI02...) | origem. Use só regras que o relatório define. Quando o relatório não define a regra de uma entrada, NÃO invente: registre a entrada na seção 6.

3. Tabela de análise de valor limite com as colunas: condição | limite | valores a testar (limite - 1, limite, limite + 1, ou mínimo/máximo) | resultado esperado | origem. Inclua pelo menos as quantidades de tags e de imagens e o ano.

4. Casos de teste novos, numerados a partir de CT07, no MESMO formato dos casos CT01 a CT06 do relatório (Objetivo; Relacionamento e Tipo; Pré-condições; Entrada; Passos; Resultado esperado, com as mensagens literais do relatório). Critério de cobertura:
   - os casos válidos combinam o maior número possível de classes válidas;
   - cada caso inválido cobre uma única classe inválida;
   - cada valor da seção 3 aparece em pelo menos um caso.
   Reaproveite os CTs existentes quando já cobrirem uma classe ou limite e diga qual.

5. Matriz de cobertura: cada classe (CV/CI) e cada valor limite → caso(s) de teste que o cobrem. Nenhuma classe pode ficar sem caso.

6. Lacunas: entradas cujo comportamento o relatório não define (por exemplo, tamanho máximo de título ou resumo, formato do ano, faixa de anos aceita), cada uma com uma pergunta objetiva para o grupo decidir.

7. Ao final, compare em poucas linhas este arquivo com testes-funcionais-v1.md: o que mudou e o que a versão 1 tinha de errado ou de faltante.

PARE ao final.
```
