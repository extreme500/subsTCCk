# Relatório de Testes Funcionais (v1) — Classes de Equivalência e Análise de Valor Limite

Este documento apresenta a ampliação dos casos de teste funcionais (**CT01 a CT06**) do sistema de divulgação e descoberta de Trabalhos de Conclusão de Curso (TCCs) do Instituto de Informática da UFRGS, aplicando os critérios de **Particionamento em Classes de Equivalência (CE)** e **Análise de Valor Limite (AVL)** para as funcionalidades:

- **Cadastrar TCC** (`RF#01` / `UC01` / `US#01`)
- **Buscar e Filtrar TCCs** (`RF#02` / `UC04` / `US#04`)

Toda a análise baseia-se exclusivamente nos artefatos presentes em `contexto/relatorio-etapa1.md` e `contexto/diagramas/` (`casos-de-uso.png`, `classes.png`, `pacotes.png`, `sequencia-uc01.png`, `atividades-uc01.png`, `atividades-uc04.png` e `transcricao-diagramas.md`). Onde a especificação não define uma regra de validação, formato ou limite, a omissão é explicitamente documentada na seção de **Lacunas da Especificação**, sem inventar regras não previstas no relatório.

---

## 1. Diagnóstico dos Casos de Teste Originais (CT01 a CT06)

A tabela a seguir resume a cobertura original dos casos **CT01 a CT06** da Etapa 1 e o que motivou a ampliação:

| Caso Original | Funcionalidade | O que já exercita (CE / AVL) | O que faltava cobrir |
|---|---|---|---|
| **CT01** | Cadastrar TCC (`RF#01` / `UC01`) | Classe válida geral: Título e Resumo preenchidos, Ano/Semestre `2025/2`, 1 Orientador e 0 Coorientador (limite inferior `1` de `Professor 1..2`), Link do LUME válido, 3 Tags (valor intermediário em `1..5`), 2 Imagens PNG (valor intermediário em `0..3`), 0 Arquivo de TCC (limite inferior `0` em `0..1`). | Limite inferior de Tags (`1`), valores adjacentes de Tags (`2` e `4`), origem da tag (nova digitada vs. sugerida), limite inferior de Mídias (`0` e `1`), presença de Coorientador (limite superior `2` de `Professor 1..2`), anexação de `ArquivoTcc` (`1` arquivo nos formatos `PDF`, `DOCX` e `EPUB`). |
| **CT02** | Cadastrar TCC (`RF#01` / `UC01` - `FA02`) | Classe inválida de Link do LUME com domínio externo (`http://exemplo.com/tcc-123`) + decisão de salvar como `RASCUNHO` (e menção de variação para recusa do rascunho). | Link pertencente ao domínio do LUME porém quebrado/inexistente (404), servidor do LUME indisponível, link em branco ou malformado, e teste passo a passo da recusa do rascunho. |
| **CT03** | Buscar e Filtrar TCCs (`RF#02` / `UC04`) | Combinação simultânea de 3 filtros (`Ano = 2025`, `Orientador = Carlos Lima`, `Tag = Redes`) retornando `1` TCC publicado (limite mínimo positivo de resultados) e ocultando `RASCUNHO`; variação com `Ano = 2023` retornando `0` resultados (`FA01`). | Uso de cada filtro isoladamente (`1` filtro ativo), uso do filtro `Autor` e `Coleção`, combinação máxima de todos os filtros + barra de busca, busca sem nenhum filtro ativo (`0` filtros), filtro com múltiplas tags. |
| **CT04** | Cadastrar TCC (`RF#01` / `UC01` - `FA01`) | Limite superior válido e inválido de Tags (`5` e tentativa da `6ª` tag), limite superior válido e inválido de Mídias (`3` e tentativa da `4ª` imagem), e classe inválida de `Resumo` obrigatório em branco (`FA01`). | Limite inferior inválido de Tags (`0` tags), demais campos obrigatórios em branco (`Título`, `Orientador`, `Ano/Semestre`), formatos inválidos de arquivo/mídia e excesso de `ArquivoTcc` (`> 1`). |
| **CT05** | Buscar e Filtrar TCCs (`RF#02` / `UC04` - `FA01`) | Combinação de `Termo = "blockchain"` + `Tag = Redes` resultando em `0` itens (`FA01`), seguida de remoção do termo retornando `3` itens (`A, C, D`) e mantendo `RASCUNHO` (`E`) oculto; variação buscando pelo título do rascunho `E`. | Busca textual positiva por termo presente no título/resumo ou nome de orientador (`US#04`), busca por autor/orientador cujo único TCC é `RASCUNHO`. |
| **CT06** | Buscar e Filtrar TCCs (`RF#02` / `UC04` - `FA02`) | Falha de conexão durante o download do arquivo `PDF` (`FA02`) seguida de nova tentativa com sucesso. | Download bem-sucedido nos demais formatos válidos da enumeração `FormatoArquivo` (`DOCX` e `EPUB`) e comportamento ao tentar baixar arquivo de TCC publicado sem arquivo anexado (`0` em `ArquivoTcc 0..1`). |

---

## 2. Particionamento em Classes de Equivalência e Análise de Valor Limite

### 2.1 Funcionalidade 1: Cadastrar TCC (`RF#01` / `UC01` / `US#01`)

As condições de entrada e restrições foram extraídas da seção 2.1, `RF#01`, `US#01`, `UC01` (fluxo principal, `FA01` e `FA02`) e dos diagramas `classes.png`, `sequencia-uc01.png` e `atividades-uc01.png`.

| # | Variável / Condição de Entrada | Fonte na Especificação | Classes de Equivalência Válidas (CEV) | Classes de Equivalência Inválidas (CEI) | Valores Limite (AVL) | Casos de Teste Associados |
|---|---|---|---|---|---|---|
| **E01** | **Autenticação e Perfil do Usuário** | Seção 2.1, `UC01` (Pré-condições), `atividades-uc01.png` | **CEV01:** Usuário autenticado com credenciais institucionais válidas da UFRGS e perfil `AlunoFormando`. | **CEI01:** Visitante não autenticado (modo leitura, sem permissão de escrita).<br>**CEI02:** Usuário com credenciais inválidas ou sem perfil de `AlunoFormando`. | N/A (condição lógica/booleana de acesso). | CT01, CT02, CT04, CT07–CT15 (`CEV01`);<br>**CT16** (`CEI01`, `CEI02`). |
| **E02** | **Título** (`titulo: String`) | `RF#01`, `UC01` (Passos 2, 3, 8 e `FA01`), `classes.png` | **CEV02:** String preenchida (não vazia). | **CEI03:** String vazia / não preenchida (aciona `FA01`). | *Limites de tamanho (mín/máx de caracteres) não definidos no relatório (ver Lacuna L01).* | CT01 (`CEV02`);<br>**CT11** (`CEI03`). |
| **E03** | **Resumo Simplificado** (`resumoSimplificado: String`) | `RF#01`, `UC01` (Passos 2, 3, 8 e `FA01`), `classes.png` | **CEV03:** Texto preenchido (não vazio). | **CEI04:** Texto vazio / em branco (aciona `FA01`). | *Limites de tamanho (mín/máx de caracteres) não definidos no relatório (ver Lacuna L01).* | CT01 (`CEV03`);<br>CT04 (`CEI04`). |
| **E04** | **Ano e Semestre** (`ano: int`, `semestre: int`) | `RF#01`, `UC01` (Passos 2, 3, 8 e `FA01`), `classes.png`, exemplos `2024/2`, `2025/1`, `2025/2` | **CEV04:** Ano letivo preenchido (inteiro válido, ex.: `2024`, `2025`).<br>**CEV05:** Semestre letivo válido (`1` ou `2`). | **CEI05:** Ano/Semestre não preenchido (em branco, aciona `FA01`).<br>**CEI06:** Semestre `< 1` (ex.: `0`).<br>**CEI07:** Semestre `> 2` (ex.: `3`).<br>*(Faixa de anos válidos não definida — ver Lacuna L02).* | **Semestre (`[1, 2]`):**<br>- `0` (inválido, abaixo do mínimo)<br>- `1` (limite inferior válido)<br>- `2` (limite superior válido)<br>- `3` (inválido, acima do máximo) | CT01 (`2025/2` - `CEV04`, `CEV05`, limite `2`);<br>**CT07** (`2025/1` - limite `1`);<br>**CT11** (`CEI05`);<br>**CT12** (`0`, `1`, `2`, `3`). |
| **E05** | **Orientador e Coorientador** (Associação `TCC — Professor 1..2`) | `RF#01`, `UC01` (Passo 2: Orientador obrigatório, Coorientador opcional), `classes.png` (`Professor 1..2`) | **CEV06:** Apenas Orientador informado (`1` professor associado; Coorientador em branco).<br>**CEV07:** Orientador e Coorientador informados (`2` professores associados). | **CEI08:** Orientador em branco (`0` professores associados — aciona `FA01`).<br>**CEI09:** Mais de 2 professores associados (`> 2`, ex.: `3` professores, violando `1..2`). | **Quantidade de Professores (`[1, 2]`):**<br>- `0` (abaixo do limite inferior — inválido, sem orientador)<br>- `1` (limite inferior válido — só orientador)<br>- `2` (limite superior válido — orientador + coorientador)<br>- `3` (acima do limite superior — inválido) | CT01 (`1` professor - `CEV06`);<br>**CT07** (`2` professores - `CEV07`);<br>**CT11** (`0` professores - `CEI08`);<br>**CT12** (`3` professores - `CEI09`). |
| **E06** | **Quantidade de Tags Temáticas** (`TCC ◇— Tag 1..5`) | `UC01` (Passo 4: "até 5 tags", `FA01`: Tags é obrigatório), `classes.png` (`Tag 1..5`) | **CEV08:** Entre `1` e `5` tags associadas ao TCC ($1 \le N_{\text{tags}} \le 5$). | **CEI10:** Nenhuma tag selecionada ($N_{\text{tags}} = 0$ — aciona `FA01`).<br>**CEI11:** Mais de 5 tags ($N_{\text{tags}} > 5$ — sistema impede adição da 6ª tag e avisa que o limite foi atingido). | **Quantidade de Tags (`[1, 5]`):**<br>- `0` tags (imediatamente abaixo do mínimo — inválido, `FA01`)<br>- `1` tag (limite inferior válido)<br>- `2` tags (logo acima do limite inferior válido)<br>- `3` tags (valor intermediário válido)<br>- `4` tags (logo abaixo do limite superior válido)<br>- `5` tags (limite superior válido)<br>- `6` tags (imediatamente acima do máximo — inválido) | **CT08** (`0` tags - `CEI10`);<br>**CT07** (`1` tag);<br>**CT09** (`2` tags);<br>CT01 (`3` tags);<br>**CT10** (`4` tags);<br>CT04 (`5` tags e tentativa da `6ª` tag - `CEI11`). |
| **E07** | **Origem da Tag Temática** | `UC01` (Passo 4: "da lista sugerida ou digita novas tags") | **CEV09:** Tag selecionada a partir da lista sugerida.<br>**CEV10:** Nova tag digitada pelo aluno formando. | *Regras de formato/tamanho de nova tag não definidas (ver Lacuna L04).* | N/A | CT01 (`CEV09`);<br>**CT07** (`CEV10` - nova tag digitada). |
| **E08** | **Quantidade de Mídias / Imagens de Demonstração** (`TCC ◆— Midia 0..3`) | `RF#01` ("até 3 imagens/figuras"), `UC01` (Passo 5), `classes.png` (`Midia 0..3`) | **CEV11:** Nenhuma imagem anexada ($N_{\text{midias}} = 0$).<br>**CEV12:** Entre `1` e `3` imagens anexadas ($1 \le N_{\text{midias}} \le 3$). | **CEI12:** Mais de 3 imagens ($N_{\text{midias}} > 3$ — sistema impede anexar a 4ª imagem e avisa que o limite foi atingido). | **Quantidade de Imagens (`[0, 3]`):**<br>- `0` imagens (limite inferior válido)<br>- `1` imagem (logo acima do limite inferior válido)<br>- `2` imagens (valor intermediário válido)<br>- `3` imagens (limite superior válido)<br>- `4` imagens (imediatamente acima do máximo — inválido) | **CT07** (`0` imagens - `CEV11`);<br>**CT09** (`1` imagem);<br>CT01 (`2` imagens);<br>CT04 (`3` imagens e tentativa da `4ª` imagem - `CEI12`). |
| **E09** | **Quantidade de Arquivos do TCC** (`TCC ◆— ArquivoTcc 0..1`) | `RF#01`, `UC01` (Passo 6: "caso existente"), `classes.png` (`ArquivoTcc 0..1`) | **CEV13:** Nenhum arquivo de TCC anexado ($N_{\text{arq}} = 0$).<br>**CEV14:** Exatamente `1` arquivo de TCC anexado ($N_{\text{arq}} = 1$). | **CEI13:** Mais de 1 arquivo de TCC anexado ($N_{\text{arq}} > 1$). | **Quantidade de Arquivos (`[0, 1]`):**<br>- `0` arquivos (limite inferior válido)<br>- `1` arquivo (limite superior válido)<br>- `2` arquivos (imediatamente acima do máximo — inválido) | CT01 (`0` arquivos - `CEV13`);<br>**CT07**, **CT09**, **CT10** (`1` arquivo - `CEV14`);<br>**CT13** (`2` arquivos - `CEI13`). |
| **E10** | **Formato do Arquivo do TCC** (`FormatoArquivo`) | `RF#01` ("arquivo docx, pdf ou epub"), `classes.png` (`FormatoArquivo`: `DOCX`, `PDF`, `EPUB`) | **CEV15:** Formato `PDF`.<br>**CEV16:** Formato `DOCX`.<br>**CEV17:** Formato `EPUB`. | **CEI14:** Arquivo em formato diferente de `DOCX`, `PDF` ou `EPUB` (ex.: `.txt`, `.zip`, `.exe`). | N/A (enumeração discreta de 3 valores). | **CT07** (`PDF` - `CEV15`);<br>**CT09** (`DOCX` - `CEV16`);<br>**CT10** (`EPUB` - `CEV17`);<br>**CT13** (`.zip`/`.txt` - `CEI14`). |
| **E11** | **Link do LUME** (`linkLume: String` / `ValidadorLumeService`) | Seção 2.2 (`lume.ufrgs.br/handle/10183/NNNNNN`), `UC01` (Pré-condições, Passos 6, 8 e `FA02`), `sequencia-uc01.png`, `atividades-uc01.png` | **CEV18:** URL pertencente ao domínio do LUME (`lume.ufrgs.br/handle/10183/NNNNNN`), existente e acessível na validação de integridade. | **CEI15:** URL com domínio incorreto / fora do LUME (ex.: `http://exemplo.com/tcc-123` — aciona `FA02`).<br>**CEI16:** URL no domínio do LUME, porém quebrada / inexistente (404 no LUME — aciona `FA02`).<br>**CEI17:** Servidor do LUME indisponível / inacessível durante a checagem (aciona `FA02`).<br>**CEI18:** URL do LUME em branco ao clicar em "Publicar TCC" (ver Lacuna L07). | N/A | CT01 (`CEV18`);<br>CT02 (`CEI15`);<br>**CT14** (`CEI16`);<br>**CT15** (`CEI17`, `CEI18`). |
| **E12** | **Decisão de Rascunho no `FA02`** ("Deseja salvar como rascunho?") | `UC01` (`FA02`), `CT02` (variação), `atividades-uc01.png` | **CEV19:** Confirmar ("Salvar como rascunho" / Sim) → salva TCC com `status = RASCUNHO`, oculto do feed e da busca.<br>**CEV20:** Recusar (Não) → retorna ao formulário de cadastro mantendo todos os dados preenchidos. | N/A | N/A (decisão binária Sim/Não). | CT02 (`CEV19`);<br>**CT14** (`CEV20`). |

---

### 2.2 Funcionalidade 2: Buscar e Filtrar TCCs (`RF#02` / `UC04` / `US#04`)

As condições de entrada, filtros e saídas foram extraídas de `RF#02`, `US#04`, `UC04` (fluxo principal, `FA01` e `FA02`) e dos diagramas `classes.png` (`FiltroBusca`, `TccController`, `TccService`, `TccRepository`) e `atividades-uc04.png`.

| # | Variável / Condição de Entrada ou Saída | Fonte na Especificação | Classes de Equivalência Válidas (CEV) | Classes de Equivalência Inválidas / Comportamento de Exceção (CEI) | Valores Limite (AVL) | Casos de Teste Associados |
|---|---|---|---|---|---|---|
| **B01** | **Status do TCC no Catálogo** (`StatusTcc`) | `UC04` (Pré-condição: status `PUBLICADO`), `classes.png` (`StatusTcc`), `atividades-uc04.png` | **CEV21:** TCC com `status = PUBLICADO` (elegível para aparecer nos resultados da busca). | **CEI19:** TCC com `status = RASCUNHO` (nunca deve aparecer nos resultados de busca, mesmo quando todos os filtros/termos coincidem). | N/A (enumeração de 2 estados: `PUBLICADO` vs. `RASCUNHO`). | CT03, CT05, **CT20** (`CEV21`, `CEI19`). |
| **B02** | **Quantidade de Critérios de Busca/Filtro Ativos Simultaneamente** | `UC04` (Passos 2, 3 e 5: barra de busca e/ou filtros Data/Ano, Autores, Orientadores, Assuntos/Tags e Coleções, aplicados simultaneamente em conjunção `AND`) | **CEV22:** Apenas `1` critério ativo (somente barra de pesquisa OU somente 1 filtro selecionado).<br>**CEV23:** Múltiplos critérios ativos simultaneamente ($2 \le N_{\text{filtros}} \le 6$, aplicados com lógica `AND`).<br>**CEV24:** Nenhum critério informado ($N_{\text{filtros}} = 0$: barra vazia e nenhum filtro selecionado — ver Lacuna L09). | N/A | **Quantidade de critérios ativos (`[0, 6]`):**<br>- `0` critérios (limite inferior absoluto: busca sem restrições)<br>- `1` critério (limite inferior de busca filtrada)<br>- `2` e `3` critérios (valores intermediários)<br>- `6` critérios (limite superior: Termo + Ano + Autor + Orientador + Tag + Coleção ativos ao mesmo tempo) | **CT19** (`0` critérios - `CEV24`);<br>**CT17** (`1` critério - `CEV22`);<br>CT05 (`2` critérios), CT03 (`3` critérios);<br>**CT18** (`6` critérios - limite superior `CEV23`). |
| **B03** | **Termo na Barra de Pesquisa** (`termo: String`) | `US#04`, `UC04` (Passos 2, 3, 5 e `FA01`), `classes.png` (`FiltroBusca.termo`) | **CEV25:** Termo que possui correspondência em TCC(s) `PUBLICADO`(s) (título/resumo ou nome de orientador conforme `US#04`).<br>**CEV26:** Barra de pesquisa em branco (combinada com filtros). | **CEI20:** Termo sem correspondência em nenhum TCC `PUBLICADO` (aciona `FA01`).<br>**CEI21:** Termo que coincide exclusivamente com TCC(s) em status `RASCUNHO` (aciona `FA01`). | *Limites de comprimento de string do termo não especificados (ver Lacuna L10).* | **CT17**, **CT18** (`CEV25`);<br>CT03 (`CEV26`);<br>CT05 (`CEI20`, `CEI21`). |
| **B04** | **Filtro Data/Ano** (`ano: int`) | `RF#02`, `UC04` (Passo 2), `classes.png` (`FiltroBusca.ano`) | **CEV27:** Ano em que há TCC(s) `PUBLICADO`(s) (retorna TCCs daquele ano independentemente de serem do semestre `1` ou `2`). | **CEI22:** Ano em que não há TCC(s) `PUBLICADO`(s) (aciona `FA01`). | **Fronteira de Ano/Semestre:**<br>- TCC em `2024/2` (ano imediatamente anterior `2024`) vs. TCCs em `2025/1` e `2025/2` (ano `2025`). | CT03 (`2025` e variação `2023` - `CEV27`, `CEI22`);<br>**CT17**, **CT20** (fronteira `2024/2` vs. `2025/1` e `2025/2`). |
| **B05** | **Filtro Autores** (`autor: String`) | `RF#02`, `UC04` (Passo 2), `classes.png` (`FiltroBusca.autor`) | **CEV28:** Autor que possui TCC `PUBLICADO`. | **CEI23:** Autor sem TCC `PUBLICADO` (incluindo autor cujo único TCC está em `RASCUNHO` — aciona `FA01`). | N/A | **CT17**, **CT18** (`CEV28`);<br>**CT20** (`CEI23`). |
| **B06** | **Filtro Orientadores** (`orientador: String`) | `RF#02`, `US#04`, `UC04` (Passo 2), `classes.png` (`FiltroBusca.orientador`) | **CEV29:** Orientador que possui TCC(s) `PUBLICADO`(s). | **CEI24:** Orientador sem TCC(s) `PUBLICADO`(s) (ou apenas com TCC em `RASCUNHO` — aciona `FA01`). | N/A | CT03, **CT17** (`CEV29`);<br>**CT20** (`CEI24`). |
| **B07** | **Filtro Assuntos/Tags** (`tags: String` / `List<Tag>`) | `RF#02`, `US#04`, `UC04` (Passo 2), `classes.png` (`FiltroBusca.tags`, `TccRepository.buscarPorTags(tags: List<Tag>)`) | **CEV30:** Tag associada a TCC(s) `PUBLICADO`(s). | **CEI25:** Tag não associada a nenhum TCC `PUBLICADO` (aciona `FA01`). | **Quantidade de tags no filtro:**<br>- `1` tag selecionada<br>- Múltiplas tags selecionadas (`List<Tag>`, ver Lacuna L11). | CT03, CT05, **CT17** (`CEV30`);<br>**CT20** (`CEI25` e múltiplas tags). |
| **B08** | **Filtro Coleções** | `RF#02`, `UC04` (Passo 2) | **CEV31:** Coleção com TCC(s) `PUBLICADO`(s). | **CEI26:** Coleção sem TCC(s) `PUBLICADO`(s) (aciona `FA01`). | *Atributo ausente em `FiltroBusca` no diagrama de classes (ver Lacuna L08).* | **CT17**, **CT18** (`CEV31`);<br>**CT20** (`CEI26`). |
| **B09** | **Quantidade de Trabalhos Retornados no Feed** (Saída do Passo 5) | `UC04` (Passo 5 e `FA01`), `atividades-uc04.png` | **CEV32:** Exatamente `1` trabalho compatível ($N_{\text{res}} = 1$).<br>**CEV33:** Múltiplos trabalhos compatíveis ($N_{\text{res}} > 1$). | **CEI27:** Nenhum trabalho compatível ($N_{\text{res}} = 0$ — feed vazio, exibe mensagem do `FA01`: *"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."*). | **Quantidade de Resultados (`[0, N]`):**<br>- `0` resultados (limite inferior — dispara `FA01`)<br>- `1` resultado (limite mínimo positivo)<br>- `> 1` resultados (ex.: `3` ou `4` resultados) | CT05 (`0` resultados - `CEI27` e `3` resultados - `CEV33`);<br>CT03 (`1` resultado - `CEV32`). |
| **B10** | **Download do Arquivo do TCC** (`UC04` Passos 8–9 e `FA02`) | `RF#02`, `UC04` (Passos 8, 9 e `FA02`), `classes.png` (`ArquivoTcc 0..1`, `FormatoArquivo`), `atividades-uc04.png` | **CEV34:** Transferência concluída com sucesso de arquivo `PDF`.<br>**CEV35:** Transferência concluída com sucesso de arquivo `DOCX`.<br>**CEV36:** Transferência concluída com sucesso de arquivo `EPUB`. | **CEI28:** Falha de rede / interrupção de conexão durante a transferência (aciona `FA02`: *"Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente."*).<br>**CEI29:** TCC `PUBLICADO` sem arquivo anexado ($N_{\text{arq}} = 0$, permitido por `ArquivoTcc 0..1` e `UC01` Passo 6 — ver Lacuna L13). | **Presença de arquivo no TCC selecionado (`[0, 1]`):**<br>- `0` arquivos anexados<br>- `1` arquivo anexado (`PDF`, `DOCX` ou `EPUB`) | CT06 (`CEV34` e `CEI28`);<br>**CT21** (`CEV35`, `CEV36` e `CEI29`). |

---

## 3. Registro de Lacunas e Inconsistências da Especificação

Em cumprimento à regra *"Não invente regras que o relatório não define: quando faltar uma regra, registre a lacuna"*, listam-se abaixo todas as omissões e divergências identificadas entre o relatório (`relatorio-etapa1.md`) e os diagramas UML (`contexto/diagramas/`):

1. **L01 — Limites de comprimento de campos textuais (`titulo`, `resumoSimplificado`, `descricao` de `Midia`):** A especificação define que `Título` e `Resumo` são obrigatórios, mas não define o número mínimo nem máximo de caracteres ou palavras aceitos, nem se strings compostas apenas por espaços em branco (`"   "`) são rejeitadas como vazias.
2. **L02 — Domínio válido e formato de `Ano/Semestre`:** No texto do `UC01` (Passo 2), o formulário apresenta um campo `"Ano/Semestre"` (preenchido como `2025/2` no `CT01`), enquanto no Diagrama de Classes (`classes.png`) a classe `TCC` e o `TccDTO` modelam dois atributos inteiros separados (`ano: int` e `semestre: int`). Não há especificação do ano mínimo aceito, se anos futuros são bloqueados, nem se há semestres além de `1` e `2`.
3. **L03 — Representação de Orientador e Coorientador e verificação de unicidade:** No Diagrama de Classes, `TCC` associa-se a `Professor` com multiplicidade `1..2` (Orientador obrigatório e Coorientador opcional), mas `TccDTO` possui apenas `+ orientador: String` (sem campo para coorientador). Além disso, não é especificado se o aluno seleciona professores de um cadastro prévio ou digita texto livre, nem se o sistema impede que o mesmo professor seja informado simultaneamente como orientador e coorientador.
4. **L04 — Regras para criação de novas Tags e duplicidade:** O `UC01` (Passo 4) permite selecionar até 5 tags da lista sugerida ou digitar novas tags, mas não define tamanho mínimo/máximo do nome da tag, tratamento de maiúsculas/minúsculas (ex.: `"IA"` vs. `"ia"`) ou bloqueio de tags duplicadas no mesmo TCC. Tampouco define o texto exato da mensagem de erro quando o aluno tenta inserir a 6ª tag (`CT04` diz apenas que *"o sistema avisa que o limite foi atingido"*).
5. **L05 — Formatos aceitos, tamanho máximo e descrição das Mídias (`Midia 0..3`):** `RF#01` e `UC01` especificam o limite de até 3 imagens/figuras de demonstração (`CT01` e `CT04` usam arquivos `PNG`), mas não definem quais extensões de imagem são válidas (ex.: `JPG`, `WEBP`, `GIF`, `SVG`), o tamanho máximo em bytes/MB por imagem, nem se o atributo `- descricao: String` da classe `Midia` é obrigatório ou opcional.
6. **L06 — Tamanho máximo e validação do `ArquivoTcc` (`DOCX`, `PDF`, `EPUB`):** O Diagrama de Classes restringe os formatos a `DOCX`, `PDF` e `EPUB` e a quantidade a `0..1`, mas não especifica o tamanho máximo de upload (em MB), o tratamento de arquivos vazios (`0 bytes`) ou corrompidos, nem a mensagem exata exibida ao tentar enviar um formato não suportado. Além disso, `TccDTO` não contém atributos para `Midia` nem para `ArquivoTcc`.
7. **L07 — Comportamento quando o Link do LUME é deixado em branco e botão direto de Rascunho:** As pré-condições do `UC01` afirmam: *"A URL do LUME é exigida apenas para publicar; sem ela, o trabalho pode ser salvo como rascunho"*. Contudo, o fluxo principal do `UC01` não exibe um botão `"Salvar como rascunho"` na tela inicial (apenas `"Publicar TCC"`), e não fica claro se deixar o campo Link do LUME vazio ao clicar em `"Publicar TCC"` dispara o `FA01` (*"Preencha todos os campos obrigatórios"*) ou o `FA02` (diálogo oferecendo salvar como rascunho). Adicionalmente, há pequena divergência textual na mensagem do `FA01` entre o texto do `UC01` (*"Preencha todos os campos obrigatórios"*) e o diagrama `atividades-uc01.png` (*"Preencha todos os campos obrigatórios corretamente"*), bem como na mensagem do `FA02` em `atividades-uc01.png`.
8. **L08 — Ausência de `Coleções` e `Area` no DTO `FiltroBusca` e no Diagrama de Atividades:** `RF#02` e `UC04` (Passo 2) listam `Coleções` entre os filtros de busca, e `US#04` menciona filtrar por *"áreas de interesse"* (existindo a classe `Area` agregada a `Tag` em `classes.png`). Entretanto, a classe `FiltroBusca` (`classes.png`) e o diagrama `atividades-uc04.png` contemplam apenas `termo`, `ano`, `autor`, `orientador` e `tags`, omitindo `Coleções` e `Area`.
9. **L09 — Busca sem nenhum filtro ou termo preenchido (`0` critérios ativos):** O `UC04` não especifica explicitamente se clicar em `"Pesquisar"` com a barra de pesquisa vazia e nenhum filtro selecionado retorna todos os TCCs com status `PUBLICADO` ou se exige ao menos um critério.
10. **L10 — Abrangência e regras de correspondência da barra de pesquisa (`termo: String`):** `US#04` indica que digitar o nome de um orientador na barra de pesquisa retorna seus trabalhos, e `CT05` busca termos no conteúdo/título (`"blockchain"`). Não está especificado exatamente quais atributos do TCC são indexados pela barra textual (Título, Resumo, Autor, Orientador, Tags), nem se a busca diferencia maiúsculas/minúsculas (case-sensitivity), acentuação ou substrings parciais.
11. **L11 — Seleção de múltiplas tags no filtro de busca e busca por coorientador:** Em `TccRepository` existe `+ buscarPorTags(tags: List<Tag>): List<TCC>`, indicando suporte a uma lista de tags, mas o relatório não esclarece se, ao selecionar mais de uma tag no filtro, o sistema aplica conjunção (`AND`, como sugere o Passo 5 do `UC04`: *"todas as condições, simultaneamente"*) ou disjunção (`OR`). Também não especifica se o filtro `Orientador` encontra trabalhos nos quais o professor atua como *coorientador*.
12. **L12 — Ordenação e paginação dos resultados de busca e parâmetros do Feed de Destaques:** Em `TccService` (`classes.png`), os métodos do feed inicial possuem parâmetros numéricos (`listarMaisRecentes(limite: int)` e `listarTagsMaisExploradas(dias: int)`), mas o relatório não define os valores padrão/limites de `limite` e `dias`, nem a ordem de exibição dos resultados em `buscarPorFiltros`.
13. **L13 — Download de artigo quando o TCC publicado não possui arquivo anexado (`ArquivoTcc 0..1`):** Tanto o `UC01` (Passo 6: *"caso existente"*) quanto o Diagrama de Classes (`TCC ◆— ArquivoTcc 0..1`) determinam que o arquivo do TCC é opcional para publicar (basta o Link do LUME). Contudo, o `UC04` (Passos 8 e 9) pressupõe que o usuário sempre clica em `"Baixar Artigo"`, sem especificar se o botão fica oculto/desabilitado quando o TCC não possui arquivo anexado ou se redireciona ao link do LUME.

---

## 4. Casos de Teste Funcionais (Originais e Ampliados)

### 4.1 Casos de Teste Originais da Etapa 1 (CT01 a CT06)

Os seis casos de teste originais do relatório são mantidos integralmente abaixo, acrescidos da identificação explícita das Classes de Equivalência (CE) e Valores Limite (AVL) que cobrem.

#### CT01 - Cadastrar TCC com dados válidos
- **Relacionamento:** RF#01, UC01, US#01. **Tipo:** positivo.
- **Critério Funcional (CE / AVL):** `CEV01`, `CEV02`, `CEV03`, `CEV04`, `CEV05` (limite superior de semestre `2`), `CEV06` (limite inferior `1` de `Professor 1..2`), `CEV08` (valor intermediário `3` em `Tag 1..5`), `CEV09`, `CEV12` (valor intermediário `2` em `Midia 0..3`), `CEV13` (limite inferior `0` em `ArquivoTcc 0..1`), `CEV18`.
- **Pré-condições:** aluno autenticado com credenciais institucionais; base com o link do TCC ativo no LUME.
- **Entrada:**
  - Título: `"Detecção de anomalias em redes veiculares"`
  - Resumo: texto simplificado preenchido
  - Ano/Semestre: `2025/2`
  - Orientador: `Prof. Carlos Lima` (coorientador em branco)
  - Link do LUME: URL válida do repositório
  - Tags: `Redes`, `IA`, `Segurança` (3 tags)
  - Mídias: 2 imagens PNG
- **Passos:**
  1. Acessar o menu do perfil e selecionar "Cadastrar Novo TCC".
  2. Preencher os campos com os dados acima.
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O sistema valida os campos e o link e exibe `"TCC publicado com sucesso!"`.
  - O TCC fica com status `PUBLICADO` e aparece no feed.
  - Uma busca pela tag `"Redes"` retorna o TCC.

#### CT02 - Cadastrar TCC com link fora do LUME (FA02)
- **Relacionamento:** RF#01, UC01 (FA02). **Tipo:** negativo.
- **Critério Funcional (CE / AVL):** `CEI15` (URL fora do domínio do LUME), `CEV19` (confirmar salvamento como rascunho) e variação `CEV20` (recusar rascunho).
- **Pré-condições:** aluno autenticado com credenciais institucionais.
- **Entrada:** mesmos dados de CT01, exceto o link do LUME: `http://exemplo.com/tcc-123`.
- **Passos:**
  1. Abrir o formulário "Cadastrar Novo TCC" e preencher os dados.
  2. Clicar em "Publicar TCC".
  3. Na mensagem exibida, selecionar "Salvar como rascunho".
- **Resultados esperados:**
  - O sistema não publica e exibe o aviso: `"A URL informada não pertence ao domínio do LUME ou está inacessível. Deseja salvar como rascunho até que a publicação no LUME esteja homologada?"`.
  - Após a confirmação, aparece `"Rascunho salvo com sucesso"`.
  - O TCC fica com status `RASCUNHO`, com todos os dados preservados, e não aparece no feed nem nos resultados de busca.
  - Variação: se o aluno recusar o rascunho, o formulário volta com os dados mantidos.

#### CT03 - Buscar TCCs com filtros combinados
- **Relacionamento:** RF#02, UC04, US#04. **Tipo:** positivo.
- **Critério Funcional (CE / AVL):** `CEV21`, `CEI19`, `CEV23` (3 filtros combinados), `CEV26`, `CEV27`, `CEI22` (variação com `Ano = 2023`), `CEV29`, `CEV30`, `CEV32` (limite mínimo positivo de retorno = `1` trabalho no feed).
- **Pré-condições:** base com os seguintes TCCs:

  | TCC | Ano/Semestre | Orientador | Tag | Status |
  |---|---|---|---|---|
  | A | 2025/1 | Profº Carlos Lima | Redes | Publicado |
  | B | 2025/1 | Profº Carlos Lima | IA | Publicado |
  | C | 2024/2 | Profº Carlos Lima | Redes | Publicado |
  | D | 2025/1 | Profª Ana Reis | Redes | Publicado |
  | E | 2025/1 | Profº Carlos Lima | Redes | Rascunho |

- **Entrada:** Ano: `2025`; Orientador: `Profº Carlos Lima`; Tag: `Redes`.
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Selecionar os filtros Ano = `2025`, Orientador = `"Carlos Lima"` e Tag = `"Redes"`.
  3. Clicar em "Pesquisar".
  4. Selecionar o trabalho listado.
- **Resultados esperados:**
  - O feed mostra apenas o TCC A, porque os filtros são aplicados simultaneamente. B, C e D não atendem a todas as condições, e E está em rascunho.
  - Ao abrir o TCC A, o sistema exibe as informações preenchidas pelo autor.
  - Variação: com Ano = `2023` e Tag = `"Redes"`, o sistema exibe `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros"`.

#### CT04 - Cadastrar TCC no limite de tags e imagens (FA01)
- **Relacionamento:** RF#01, UC01 (FA01), US#01. **Tipo:** limite/exceção.
- **Critério Funcional (CE / AVL):** AVL limite superior válido (`5`) e inválido (`6`) de Tags (`CEV08`, `CEI11`); AVL limite superior válido (`3`) e inválido (`4`) de Mídias (`CEV12`, `CEI12`); `CEI04` (Resumo em branco - `FA01`).
- **Pré-condições:** aluno autenticado.
- **Entrada:** mesmos dados de CT01, exceto:
  - Tags: `Redes`, `IA`, `Segurança`, `Sistemas Distribuídos` e `Engenharia de Software` (5 tags), mais uma 6ª tag `"Robótica"`
  - Mídias: 3 imagens PNG, mais uma 4ª imagem
  - Resumo: em branco
- **Passos:**
  1. Abrir o formulário e preencher os dados.
  2. Selecionar as 5 tags e tentar adicionar a 6ª tag.
  3. Anexar as 3 imagens e tentar anexar a 4ª.
  4. Deixar o Resumo em branco e clicar em "Publicar TCC".
  5. Preencher o Resumo e publicar novamente.
- **Resultados esperados:**
  - A 6ª tag e a 4ª imagem não são adicionadas e o sistema avisa que o limite foi atingido.
  - Ao publicar sem Resumo, o sistema não publica, destaca o campo em vermelho e exibe `"Preencha todos os campos obrigatórios"`, mantendo os demais dados.
  - Após preencher o Resumo, o TCC é publicado com exatamente 5 tags e 3 imagens e o sistema exibe `"TCC publicado com sucesso!"`.

#### CT05 - Buscar TCCs sem correspondência (FA01)
- **Relacionamento:** RF#02, UC04 (FA01), US#04. **Tipo:** negativo.
- **Critério Funcional (CE / AVL):** `CEI20` (termo inexistente nos publicados), `CEI21` (busca pelo título de rascunho), `CEI27` (limite inferior de resultados = `0` trabalhos no feed), `CEV33` (múltiplos resultados = `3` trabalhos no feed).
- **Pré-condições:** base com os mesmos TCCs de CT03 (A a E); nenhum TCC publicado contém o termo `"blockchain"` e possui a tag `"Redes"`.
- **Entrada:** Termo: `"blockchain"`; Tag: `Redes`.
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Digitar `"blockchain"` e selecionar o filtro Tag = `"Redes"`.
  3. Clicar em "Pesquisar".
  4. Remover o termo `"blockchain"`, manter Tag = `"Redes"` e clicar novamente em "Pesquisar".
- **Resultados esperados:**
  - No passo 3, o feed fica vazio e o sistema exibe `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."`
  - No passo 4, o fluxo retorna ao passo 5 do UC04 e o feed mostra os TCCs A, C e D; o TCC E continua oculto por estar em rascunho.
  - Variação: buscar pelo título do TCC E retorna a mesma mensagem, pois rascunhos não aparecem na busca.

#### CT06 - Falha durante o download do artigo (FA02)
- **Relacionamento:** RF#02, UC04 (FA02), US#04. **Tipo:** exceção.
- **Critério Funcional (CE / AVL):** `CEI28` (interrupção na transferência do arquivo - `FA02`) e `CEV34` (download concluído de arquivo `PDF` no limite superior `1` de `ArquivoTcc 0..1`).
- **Pré-condições:** TCC A publicado com arquivo PDF anexado; conexão com a internet interrompida durante a transferência.
- **Entrada:** TCC A - 2025/1 - Profº Carlos Lima - Redes.
- **Passos:**
  1. Buscar e abrir o TCC A.
  2. Clicar em "Baixar Artigo".
  3. Interromper a conexão durante a transferência.
  4. Restabelecer a conexão e clicar novamente em "Baixar Artigo".
- **Resultados esperados:**
  - No passo 3, o sistema exibe `"Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente."` e nenhum arquivo incompleto é salvo no dispositivo.
  - A página do TCC continua aberta, com o botão "Baixar Artigo" disponível.
  - No passo 4, o download é concluído e o arquivo PDF do TCC A é salvo no dispositivo.

---

### 4.2 Novos Casos de Teste — Funcionalidade 1: Cadastrar TCC (`RF#01` / `UC01`)

#### CT07 - Cadastrar TCC nos limites inferiores de tags (1 tag nova) e mídias (0 imagens) e nos limites superiores de orientação (2 professores) e arquivo (1 PDF)
- **Relacionamento:** RF#01, UC01, US#01. **Tipo:** positivo / limite.
- **Critério Funcional (CE / AVL):**
  - AVL limite inferior válido de `Tag 1..5`: `1` tag (`CEV08`), exercitando a classe de tag nova digitada pelo aluno (`CEV10`).
  - AVL limite inferior válido de `Midia 0..3`: `0` imagens anexadas (`CEV11`).
  - AVL limite superior válido de `Professor 1..2`: `2` professores (Orientador + Coorientador preenchido, `CEV07`).
  - AVL limite inferior válido de `semestre: int`: semestre `1` (`2025/1`, `CEV05`).
  - AVL limite superior válido de `ArquivoTcc 0..1`: `1` arquivo anexado (`CEV14`), no formato `PDF` (`CEV15`).
- **Pré-condições:** aluno autenticado com credenciais institucionais válidas (`CEV01`); link do TCC (`https://lume.ufrgs.br/handle/10183/100001`) ativo no LUME.
- **Entrada:**
  - Título: `"Otimização de consultas em bancos de dados distribuídos"`
  - Resumo: `"Estudo sobre técnicas de particionamento e indexação distribuída."`
  - Ano/Semestre: `2025/1`
  - Orientador: `Prof. Carlos Lima`
  - Coorientador: `Profª Ana Reis`
  - Link do LUME: `https://lume.ufrgs.br/handle/10183/100001`
  - Tags: `Bancos de Dados Distribuídos` (1 tag nova digitada pelo aluno)
  - Mídias: nenhuma (`0` imagens)
  - Arquivo do TCC: `monografia_final.pdf` (1 arquivo no formato `PDF`)
- **Passos:**
  1. Acessar o menu do perfil e selecionar "Cadastrar Novo TCC".
  2. Preencher Título, Resumo, Ano/Semestre (`2025/1`), Orientador (`Prof. Carlos Lima`) e Coorientador (`Profª Ana Reis`).
  3. Digitar `1` nova tag temática (`"Bancos de Dados Distribuídos"`).
  4. Não anexar nenhuma imagem de demonstração (`0` mídias).
  5. Inserir a URL válida do LUME e anexar `1` arquivo em formato `PDF` (`monografia_final.pdf`).
  6. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O sistema aceita o cadastro sem imagens (`0..3`), com Coorientador preenchido (`2` professores em `1..2`), com exatamente `1` tag nova digitada (`1..5`) e `1` arquivo `PDF` (`0..1`).
  - O sistema valida a integridade do link no LUME, salva o TCC com status `PUBLICADO`, indexa o trabalho e exibe `"TCC publicado com sucesso!"`.

#### CT08 - Impedir publicação de TCC no limite inferior inválido de tags (0 tags) (FA01)
- **Relacionamento:** RF#01, UC01 (FA01), US#01. **Tipo:** negativo / limite.
- **Critério Funcional (CE / AVL):** AVL imediatamente abaixo do limite inferior de `Tag 1..5`: `0` tags selecionadas (`CEI10`).
- **Pré-condições:** aluno autenticado com credenciais institucionais válidas; link do TCC ativo no LUME.
- **Entrada:** mesmos dados válidos de CT01, exceto:
  - Tags: nenhuma (`0` tags selecionadas e nenhuma tag digitada).
- **Passos:**
  1. Acessar "Cadastrar Novo TCC" e preencher Título, Resumo, Ano/Semestre, Orientador, Mídias e Link do LUME com dados válidos.
  2. Manter o campo Tags vazio (`0` tags).
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - No passo 8 do UC01 (`validarCamposObrigatorios()`), o sistema identifica que o campo obrigatório Tags não possui ao menos 1 item (`1..5`).
  - O sistema impede a publicação, mantém todos os demais dados preenchidos, destaca o campo Tags em vermelho e exibe a mensagem `"Preencha todos os campos obrigatórios"`.

#### CT09 - Cadastrar TCC com valores adjacentes aos limites inferiores de tags (2 tags) e mídias (1 imagem) e arquivo em formato DOCX
- **Relacionamento:** RF#01, UC01, US#01. **Tipo:** positivo / limite.
- **Critério Funcional (CE / AVL):**
  - AVL valor adjacente ao limite inferior de `Tag 1..5`: `2` tags (`CEV08`).
  - AVL valor adjacente ao limite inferior de `Midia 0..3`: `1` imagem (`CEV12`).
  - CE válida de formato de arquivo: `DOCX` (`CEV16`, com `1` arquivo anexado - `CEV14`).
- **Pré-condições:** aluno autenticado com credenciais institucionais válidas; link ativo no LUME.
- **Entrada:**
  - Título: `"Análise estática de código em projetos ágeis"`
  - Resumo: `"Avaliação de ferramentas de análise estática."`
  - Ano/Semestre: `2025/2`
  - Orientador: `Profª Ana Reis` (coorientador em branco)
  - Link do LUME: `https://lume.ufrgs.br/handle/10183/100002`
  - Tags: `Engenharia de Software`, `Qualidade` (`2` tags)
  - Mídias: `1` imagem PNG (`arquitetura.png`)
  - Arquivo do TCC: `tcc_analise.docx` (formato `DOCX`)
- **Passos:**
  1. Abrir o formulário "Cadastrar Novo TCC" e preencher os campos textuais obrigatórios e Link do LUME.
  2. Selecionar `2` tags temáticas.
  3. Anexar `1` imagem de demonstração e `1` arquivo do trabalho em formato `DOCX`.
  4. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O sistema aceita as `2` tags, `1` imagem e o arquivo `DOCX`, valida o link do LUME, publica o TCC com status `PUBLICADO` e exibe `"TCC publicado com sucesso!"`.

#### CT10 - Cadastrar TCC com valor adjacente ao limite superior de tags (4 tags) e arquivo em formato EPUB
- **Relacionamento:** RF#01, UC01, US#01. **Tipo:** positivo / limite.
- **Critério Funcional (CE / AVL):**
  - AVL valor adjacente ao limite superior de `Tag 1..5`: `4` tags (`CEV08`).
  - CE válida de formato de arquivo: `EPUB` (`CEV17`, com `1` arquivo anexado - `CEV14`).
- **Pré-condições:** aluno autenticado com credenciais institucionais válidas; link ativo no LUME.
- **Entrada:**
  - Título: `"Renderização em tempo real para dispositivos móveis"`
  - Resumo: `"Pipeline gráfico otimizado para GPUs móveis."`
  - Ano/Semestre: `2024/2`
  - Orientador: `Prof. Carlos Lima`
  - Link do LUME: `https://lume.ufrgs.br/handle/10183/100003`
  - Tags: `Computação Gráfica`, `Dispositivos Móveis`, `Desempenho`, ` Jogos` (`4` tags)
  - Mídias: `2` imagens PNG
  - Arquivo do TCC: `tcc_renderizacao.epub` (formato `EPUB`)
- **Passos:**
  1. Abrir o formulário "Cadastrar Novo TCC" e preencher os campos obrigatórios e Link do LUME.
  2. Selecionar `4` tags temáticas.
  3. Anexar as mídias e `1` arquivo do trabalho no formato `EPUB`.
  4. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O sistema aceita as `4` tags e o arquivo no formato `EPUB`, valida o link do LUME, publica o TCC com status `PUBLICADO` e exibe `"TCC publicado com sucesso!"`.

#### CT11 - Impedir publicação com campos obrigatórios ausentes: Título, Ano/Semestre ou Orientador em branco (0 professores) (FA01)
- **Relacionamento:** RF#01, UC01 (FA01). **Tipo:** negativo / limite.
- **Critério Funcional (CE / AVL):**
  - `CEI03` (Título em branco), `CEI05` (Ano/Semestre em branco) e `CEI08` / AVL abaixo do limite inferior de `Professor 1..2` (`0` professores associados — Orientador e Coorientador em branco).
- **Pré-condições:** aluno autenticado com credenciais institucionais válidas.
- **Entrada:** dados base de CT01, avaliados em três submissões sucessivas no formulário:
  - Submissão 1: `Título` em branco (demais campos preenchidos).
  - Submissão 2: `Título` preenchido, `Ano/Semestre` em branco (demais campos preenchidos).
  - Submissão 3: `Ano/Semestre` preenchido, `Orientador` e `Coorientador` em branco (`0` professores).
- **Passos:**
  1. Abrir "Cadastrar Novo TCC", preencher todos os campos exceto `Título` e clicar em "Publicar TCC".
  2. Preencher `Título`, limpar `Ano/Semestre` e clicar em "Publicar TCC".
  3. Preencher `Ano/Semestre`, deixar `Orientador` (e `Coorientador`) em branco (`0` professores) e clicar em "Publicar TCC".
- **Resultados esperados:**
  - Em cada uma das três tentativas, o sistema impede a publicação antes mesmo de acionar o LUME (`validarCamposObrigatorios()` retorna `false`), preserva os dados já digitados, destaca em vermelho o respectivo campo obrigatório pendente (`Título`, `Ano/Semestre` ou `Orientador`) e exibe `"Preencha todos os campos obrigatórios"`.

#### CT12 - Validar limites inválidos de Semestre (0 e 3) e de quantidade de Professores orientadores (> 2)
- **Relacionamento:** RF#01, UC01 (FA01). **Tipo:** limite / negativo.
- **Critério Funcional (CE / AVL):**
  - AVL fora dos limites de `semestre: int` (`[1, 2]`): `semestre = 0` (`CEI06`) e `semestre = 3` (`CEI07`).
  - AVL acima do limite superior de `Professor 1..2`: tentativa de associar `3` professores (`1` orientador + `2` coorientadores, `CEI09`).
- **Pré-condições:** aluno autenticado com credenciais institucionais válidas.
- **Entrada:** mesmos dados de CT07, variando:
  - Tentativa A: Ano/Semestre = `2025/0`
  - Tentativa B: Ano/Semestre = `2025/3`
  - Tentativa C: Orientador = `Prof. Carlos Lima`, Coorientador 1 = `Profª Ana Reis` e tentativa de adicionar um 3º professor (`Prof. João Souza`).
- **Passos:**
  1. Abrir o formulário "Cadastrar Novo TCC" e tentar informar Semestre `0` e depois Semestre `3`.
  2. Corrigir Ano/Semestre para `2025/1`, informar Orientador e Coorientador e tentar associar um 3º professor.
- **Resultados esperados:**
  - O sistema rejeita os valores de semestre `0` e `3` (restringindo às opções válidas `1` e `2` ou apontando preenchimento incorreto no passo 8).
  - O sistema restringe a associação a no máximo `2` professores (1 Orientador e 1 Coorientador), não permitindo adicionar um 3º professor.
  - *Nota de lacuna (L02 / L03):* o relatório não especifica a mensagem de erro exata caso os campos de Semestre e Coorientador permitam digitação livre em vez de seleção restrita na interface.

#### CT13 - Rejeitar anexo de arquivo do TCC em formato inválido e tentativa de anexar 2 arquivos (acima do limite 0..1)
- **Relacionamento:** RF#01, UC01. **Tipo:** negativo / limite.
- **Critério Funcional (CE / AVL):**
  - `CEI14`: formato de arquivo fora da enumeração `FormatoArquivo {DOCX, PDF, EPUB}` (ex.: `.zip` ou `.txt`).
  - `CEI13` / AVL acima do limite superior de `ArquivoTcc 0..1`: tentativa de anexar `2` arquivos de TCC.
- **Pré-condições:** aluno autenticado com credenciais institucionais válidas.
- **Entrada:** mesmos dados de CT01, acrescentando:
  - Tentativa 1 (formato inválido): arquivo `codigo_fonte.zip` (ou `rascunho.txt`).
  - Tentativa 2 (limite de quantidade): arquivo `tcc_v1.pdf` (`1º` arquivo válido) seguido de tentativa de anexar `tcc_v2.pdf` (`2º` arquivo) sem remover o primeiro.
- **Passos:**
  1. Abrir "Cadastrar Novo TCC" e preencher os dados obrigatórios.
  2. Tentar anexar o arquivo `codigo_fonte.zip` no campo de arquivo do TCC.
  3. Anexar o arquivo válido `tcc_v1.pdf` (`1` arquivo) e tentar adicionar simultaneamente um segundo arquivo `tcc_v2.pdf`.
- **Resultados esperados:**
  - No passo 2, o sistema recusa o arquivo `codigo_fonte.zip` por não pertencer aos formatos permitidos (`DOCX`, `PDF` ou `EPUB`).
  - No passo 3, o sistema permite apenas `1` arquivo de TCC associado ao trabalho (`0..1`), bloqueando a adição de um 2º arquivo simultâneo (ou substituindo o anterior).
  - *Nota de lacuna (L06):* o relatório não define a mensagem literal exibida na rejeição de formato ou de segundo arquivo.

#### CT14 - Cadastrar TCC com link pertencente ao domínio do LUME porém quebrado/inexistente e recusar salvar como rascunho (FA02)
- **Relacionamento:** RF#01, UC01 (FA02). **Tipo:** negativo.
- **Critério Funcional (CE / AVL):**
  - `CEI16`: URL com domínio correto do LUME (`lume.ufrgs.br/handle/10183/NNNNNN`), mas com recurso inexistente/link quebrado (404).
  - `CEV20`: recusar a opção de salvar como rascunho no diálogo do `FA02` (ramo `[no]` da decisão `"Deseja salvar como rascunho?"` em `atividades-uc01.png`).
- **Pré-condições:** aluno autenticado com credenciais institucionais válidas; serviço LUME online, porém o handle `10183/999999` não existe no LUME.
- **Entrada:** mesmos dados de CT01, exceto Link do LUME: `https://lume.ufrgs.br/handle/10183/999999`.
- **Passos:**
  1. Abrir "Cadastrar Novo TCC" e preencher todos os campos obrigatórios e o link `https://lume.ufrgs.br/handle/10183/999999`.
  2. Clicar em "Publicar TCC".
  3. Quando o sistema exibir a pergunta se deseja salvar como rascunho, selecionar a opção de recusar ("Não" / cancelar rascunho).
- **Resultados esperados:**
  - No passo 2, `ValidadorLumeService.validarIntegridadeLink()` retorna `false` por link quebrado e o sistema exibe: `"A URL informada não pertence ao domínio do LUME ou está inacessível. Deseja salvar como rascunho até que a publicação no LUME esteja homologada?"`.
  - No passo 3, ao recusar salvar como rascunho, o sistema não persiste o trabalho nem como publicado nem como rascunho e retorna ao formulário de cadastro mantendo todos os dados preenchidos pelo aluno para correção da URL.

#### CT15 - Cadastrar TCC com servidor do LUME indisponível ou com Link do LUME em branco (FA02)
- **Relacionamento:** RF#01, UC01 (Pré-condições e FA02). **Tipo:** exceção / negativo.
- **Critério Funcional (CE / AVL):** `CEI17` (servidor do LUME indisponível na verificação de URL) e `CEI18` (Link do LUME em branco ao tentar publicar).
- **Pré-condições:** aluno autenticado com credenciais institucionais válidas; no Cenário A, o servidor externo do LUME está indisponível (timeout/erro de rede); no Cenário B, o aluno ainda não possui a URL do LUME.
- **Entrada:**
  - Cenário A: mesmos dados de CT01 com URL `https://lume.ufrgs.br/handle/10183/26428`, mas servidor LUME fora do ar.
  - Cenário B: mesmos dados de CT01, mas com o campo Link do LUME em branco.
- **Passos:**
  1. (Cenário A) Preencher os dados de CT01 com o serviço LUME indisponível, clicar em "Publicar TCC" e confirmar "Salvar como rascunho".
  2. (Cenário B) Preencher todos os dados obrigatórios exceto Link do LUME, clicar em "Publicar TCC" e optar por salvar como rascunho.
- **Resultados esperados:**
  - No Cenário A, a falha de comunicação com o servidor do LUME aciona o `FA02`, exibindo `"A URL informada não pertence ao domínio do LUME ou está inacessível. Deseja salvar como rascunho até que a publicação no LUME esteja homologada?"`, e após confirmar exibe `"Rascunho salvo com sucesso"`, salvando com status `RASCUNHO`.
  - No Cenário B, conforme a pré-condição de UC01 (*"A URL do LUME é exigida apenas para publicar; sem ela, o trabalho pode ser salvo como rascunho"*), o sistema impede a publicação imediata e permite salvar o trabalho com status `RASCUNHO`.
  - *Nota de lacuna (L07):* verificar se a ausência de URL do LUME aciona diretamente o diálogo do `FA02` ou um botão específico de rascunho.

#### CT16 - Bloquear acesso ao cadastro de TCC para Visitante não autenticado ou usuário sem credenciais de Aluno Formando
- **Relacionamento:** RF#01, UC01 (Pré-condições), Seção 2.1 (Restrição de acesso). **Tipo:** negativo.
- **Critério Funcional (CE / AVL):** `CEI01` (Visitante em modo leitura) e `CEI02` (usuário sem autenticação institucional válida de Aluno Formando).
- **Pré-condições:** usuário acessando a plataforma em modo Visitante (sem login institucional UFRGS).
- **Entrada:** tentativa de acesso à funcionalidade "Cadastrar Novo TCC" sem autenticação (ou com credenciais inválidas).
- **Passos:**
  1. Acessar a plataforma como Visitante externo (não autenticado).
  2. Tentar acessar a opção "Cadastrar Novo TCC" (ou informar credenciais inválidas na tela de login solicitada em `atividades-uc01.png`).
- **Resultados esperados:**
  - O sistema restringe a permissão de escrita, não exibe o formulário de cadastro para visitantes não autenticados e exige autenticação com credenciais institucionais válidas da UFRGS.
  - *Nota de lacuna:* o relatório não define a mensagem literal de acesso negado/falha de login.

---

### 4.3 Novos Casos de Teste — Funcionalidade 2: Buscar e Filtrar TCCs (`RF#02` / `UC04`)

Para os casos **CT17 a CT21**, considere a seguinte base de TCCs estendida a partir de CT03 (incluindo Autor, Coleção e Arquivo):

| TCC | Título | Autor | Ano/Semestre | Orientador (Coorient.) | Tags | Coleção | Arquivo | Status |
|---|---|---|---|---|---|---|---|---|
| **A** | Detecção de anomalias em redes veiculares | Lucas Martins | 2025/1 | Profº Carlos Lima | Redes | Ciência da Computação | `tcc_a.pdf` (PDF) | `PUBLICADO` |
| **B** | Modelos generativos para síntese de voz | Marina Costa | 2025/1 | Profº Carlos Lima | IA | Ciência da Computação | `tcc_b.docx` (DOCX) | `PUBLICADO` |
| **C** | Roteamento seguro em IoT | Pedro Alves | 2024/2 | Profº Carlos Lima | Redes, Segurança | Engenharia de Computação | `tcc_c.epub` (EPUB) | `PUBLICADO` |
| **D** | Escalonamento em nuvens híbridas | Júlia Rocha | 2025/2 | Profª Ana Reis | Redes, Sistemas Distribuídos | Ciência da Computação | *(sem arquivo)* | `PUBLICADO` |
| **E** | Arquitetura zero-trust em 5G | Bruno Silva | 2025/1 | Profº Carlos Lima (Coorient.: Profº João Vaz) | Redes | Engenharia de Computação | `tcc_e.pdf` (PDF) | `RASCUNHO` |

#### CT17 - Buscar TCCs aplicando cada critério individualmente (limite inferior de 1 critério ativo por busca)
- **Relacionamento:** RF#02, UC04, US#04. **Tipo:** positivo / limite.
- **Critério Funcional (CE / AVL):**
  - AVL limite inferior de busca filtrada: `1` único critério ativo por pesquisa (`CEV22`).
  - `CEV25` (Termo na barra de pesquisa: palavra do título e nome de orientador conforme `US#04`), `CEV27` (apenas Ano), `CEV28` (apenas Autor), `CEV29` (apenas Orientador), `CEV30` (apenas Tag) e `CEV31` (apenas Coleção).
- **Pré-condições:** base populada com os TCCs A, B, C, D (`PUBLICADO`) e E (`RASCUNHO`).
- **Entrada:** seis buscas independentes, cada uma com exatamente `1` critério preenchido e os demais em branco:
  1. Apenas Barra de Pesquisa (`termo`): `"anomalias"` (e variação `US#04`: `"Ana Reis"` na barra de pesquisa).
  2. Apenas Filtro `Ano`: `2024`.
  3. Apenas Filtro `Autor`: `"Marina Costa"`.
  4. Apenas Filtro `Orientador`: `"Profª Ana Reis"`.
  5. Apenas Filtro `Tag`: `"IA"`.
  6. Apenas Filtro `Coleção`: `"Engenharia de Computação"`.
- **Passos:**
  1. Acessar "Buscar TCC".
  2. Executar cada uma das 6 pesquisas acima separadamente, limpando o critério anterior antes de aplicar o próximo e clicando em "Pesquisar".
- **Resultados esperados:**
  - Busca 1 (`termo = "anomalias"`): retorna apenas o **TCC A**; na variação `termo = "Ana Reis"` (`US#04`), retorna apenas o **TCC D**.
  - Busca 2 (`Ano = 2024`): retorna apenas o **TCC C** (`2024/2`).
  - Busca 3 (`Autor = "Marina Costa"`): retorna apenas o **TCC B**.
  - Busca 4 (`Orientador = "Profª Ana Reis"`): retorna apenas o **TCC D**.
  - Busca 5 (`Tag = "IA"`): retorna apenas o **TCC B**.
  - Busca 6 (`Coleção = "Engenharia de Computação"`): retorna apenas o **TCC C** (o TCC E pertence à mesma coleção, mas permanece oculto por estar em `RASCUNHO`).

#### CT18 - Buscar TCCs no limite máximo de critérios combinados simultaneamente (6 critérios ativos)
- **Relacionamento:** RF#02, UC04, US#04. **Tipo:** positivo / limite.
- **Critério Funcional (CE / AVL):** AVL limite superior de combinação de critérios (`6` critérios ativos simultaneamente: Termo + Ano + Autor + Orientador + Tag + Coleção, `CEV23`).
- **Pré-condições:** base populada com os TCCs A a E.
- **Entrada:**
  - Termo na barra de busca: `"anomalias"`
  - Ano: `2025`
  - Autor: `"Lucas Martins"`
  - Orientador: `"Profº Carlos Lima"`
  - Tag: `"Redes"`
  - Coleção: `"Ciência da Computação"`
- **Passos:**
  1. Acessar "Buscar TCC".
  2. Preencher o termo `"anomalias"` na barra de pesquisa e selecionar simultaneamente os 5 filtros (Ano, Autor, Orientador, Tag e Coleção) com os valores de entrada.
  3. Clicar em "Pesquisar".
- **Resultados esperados:**
  - O sistema aplica todas as 6 condições simultaneamente (conjunção `AND`) e exibe no feed exclusivamente o **TCC A** (`1` resultado).

#### CT19 - Buscar TCCs no limite inferior absoluto de critérios (0 filtros selecionados e barra de pesquisa vazia)
- **Relacionamento:** RF#02, UC04. **Tipo:** limite.
- **Critério Funcional (CE / AVL):** AVL limite `0` de critérios ativos (`0` filtros e termo em branco, `CEV24`), verificando que apenas todos os TCCs `PUBLICADO`s são exibidos (`CEV21`, `CEI19`).
- **Pré-condições:** base populada com os TCCs A, B, C, D (`PUBLICADO`) e E (`RASCUNHO`).
- **Entrada:** Barra de pesquisa em branco e todos os filtros (Data/Ano, Autores, Orientadores, Assuntos/Tags e Coleções) desmarcados (`0` critérios).
- **Passos:**
  1. Acessar "Buscar TCC".
  2. Sem digitar nenhum termo e sem selecionar nenhum filtro, clicar em "Pesquisar".
- **Resultados esperados:**
  - O sistema retorna no feed todos os TCCs com status `PUBLICADO` (**TCCs A, B, C e D**, totalizando `4` trabalhos) e não exibe o **TCC E** (`RASCUNHO`).
  - *Nota de lacuna (L09):* caso a regra de negócio venha a exigir ao menos 1 critério de busca, este teste evidenciará a necessidade de mensagem de validação.

#### CT20 - Buscar TCCs na fronteira de Ano/Semestre, com múltiplas tags e por Autor/Orientador/Tag exclusivos de RASCUNHO (FA01)
- **Relacionamento:** RF#02, UC04 (FA01), US#04. **Tipo:** limite / negativo.
- **Critério Funcional (CE / AVL):**
  - AVL na fronteira de Ano (`2024/2` vs. `2025/1` e `2025/2` — `CEV27`).
  - Múltiplas tags selecionadas simultaneamente (`List<Tag>` — `CEV30`).
  - `CEI23` (Autor `"Bruno Silva"` cujo único TCC está em `RASCUNHO`), `CEI24` (Professor `"Profº João Vaz"` associado apenas ao TCC E em `RASCUNHO`), `CEI25` (Tag sem TCC publicado) e `CEI26` (Coleção sem TCC publicado para o filtro combinado).
- **Pré-condições:** base populada com os TCCs A a E.
- **Entrada:**
  - Busca 1 (Fronteira de Ano `2025` abrangendo `2025/1` e `2025/2`): Filtro `Ano = 2025`.
  - Busca 2 (Múltiplas Tags em conjunção): Filtro `Tags = ["Redes", "Segurança"]`.
  - Busca 3 (Autor exclusivo de rascunho): Filtro `Autor = "Bruno Silva"`.
  - Busca 4 (Orientador/Coorientador exclusivo de rascunho): Filtro `Orientador = "Profº João Vaz"`.
- **Passos:**
  1. Acessar "Buscar TCC" e pesquisar apenas por `Ano = 2025`.
  2. Limpar o filtro de ano, selecionar as duas tags `"Redes"` e `"Segurança"` e clicar em "Pesquisar".
  3. Limpar as tags, selecionar `Autor = "Bruno Silva"` e clicar em "Pesquisar".
  4. Limpar o filtro de autor, selecionar `Orientador = "Profº João Vaz"` e clicar em "Pesquisar".
- **Resultados esperados:**
  - Na Busca 1 (`Ano = 2025`), o feed retorna os **TCCs A (`2025/1`), B (`2025/1`) e D (`2025/2`)**, excluindo C (`2024/2` — fronteira de ano anterior) e E (`RASCUNHO`).
  - Na Busca 2 (`Tags = ["Redes", "Segurança"]`), aplicando todas as condições simultaneamente, o feed retorna apenas o **TCC C** (único que possui ambas as tags). *(Ver Lacuna L11).*
  - Nas Buscas 3 e 4, como o TCC E está com status `RASCUNHO`, o sistema retorna `0` resultados (`CEI27`) e exibe: `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."`.

#### CT21 - Baixar arquivo do TCC nos formatos DOCX e EPUB e verificar comportamento em TCC publicado sem arquivo anexado (limite 0 de ArquivoTcc)
- **Relacionamento:** RF#02, UC04 (Passos 6 a 9), US#04. **Tipo:** positivo / limite.
- **Critério Funcional (CE / AVL):**
  - `CEV35`: download concluído com sucesso de arquivo no formato `DOCX` (TCC B).
  - `CEV36`: download concluído com sucesso de arquivo no formato `EPUB` (TCC C).
  - `CEI29` / AVL limite inferior (`0`) da composição `TCC ◆— ArquivoTcc (0..1)` na tela de detalhes/download (TCC D, publicado sem arquivo anexado, apenas com Link do LUME).
- **Pré-condições:** TCC B publicado com `tcc_b.docx` (`DOCX`), TCC C publicado com `tcc_c.epub` (`EPUB`) e TCC D publicado sem `ArquivoTcc` anexado (`0` arquivos). Conexão com a internet estável.
- **Entrada:** seleção sucessiva dos trabalhos B, C e D a partir do feed de resultados da busca.
- **Passos:**
  1. Buscar e abrir os detalhes do **TCC B**, e clicar em "Baixar Artigo".
  2. Buscar e abrir os detalhes do **TCC C**, e clicar em "Baixar Artigo".
  3. Buscar e abrir os detalhes do **TCC D** (cadastrado sem arquivo anexado) e verificar a ação de download.
- **Resultados esperados:**
  - No passo 1, o sistema transfere e salva no dispositivo do usuário o arquivo `tcc_b.docx` (`DOCX`).
  - No passo 2, o sistema transfere e salva no dispositivo do usuário o arquivo `tcc_c.epub` (`EPUB`).
  - No passo 3, o sistema exibe normalmente todos os detalhes preenchidos pelo autor do **TCC D** (título, resumo, tags, mídias e link oficial do LUME), sem provocar falha inesperada pela ausência de `ArquivoTcc`.
  - *Nota de lacuna (L13):* a especificação deve definir se, para TCCs com `0` arquivos anexados (`0..1`), o botão "Baixar Artigo" fica desabilitado/oculto ou se direciona o leitor ao documento oficial no LUME.

---

## 5. Matriz de Rastreabilidade e Cobertura Funcional

| Funcionalidade | Grupo de Critérios (CE / AVL) | Classes de Equivalência e Limites Cobertos | Casos de Teste (Originais + Novos) |
|---|---|---|---|
| **Cadastrar TCC** (`RF#01` / `UC01`) | Autenticação e Perfil (`E01`) | `CEV01`, `CEI01`, `CEI02` | CT01, CT02, CT04, CT07–CT15, **CT16** |
| **Cadastrar TCC** (`RF#01` / `UC01`) | Campos Textuais Obrigatórios (`E02`, `E03`) | `CEV02`, `CEI03` (Título); `CEV03`, `CEI04` (Resumo) | CT01, CT04, **CT11** |
| **Cadastrar TCC** (`RF#01` / `UC01`) | Ano e Semestre (`E04`) | `CEV04`, `CEV05`, `CEI05`, `CEI06`, `CEI07` \| AVL Semestre: `0`, `1`, `2`, `3` | CT01, **CT07**, **CT11**, **CT12** |
| **Cadastrar TCC** (`RF#01` / `UC01`) | Orientador e Coorientador (`E05`: `Professor 1..2`) | `CEV06`, `CEV07`, `CEI08`, `CEI09` \| AVL Professores: `0`, `1`, `2`, `3` | CT01, **CT07**, **CT11**, **CT12** |
| **Cadastrar TCC** (`RF#01` / `UC01`) | Tags Temáticas (`E06`, `E07`: `Tag 1..5`) | `CEV08`, `CEI10`, `CEI11`, `CEV09`, `CEV10` \| AVL Tags: `0`, `1`, `2`, `3`, `4`, `5`, `6` | CT01, CT04, **CT07**, **CT08**, **CT09**, **CT10** |
| **Cadastrar TCC** (`RF#01` / `UC01`) | Mídias / Imagens (`E08`: `Midia 0..3`) | `CEV11`, `CEV12`, `CEI12` \| AVL Mídias: `0`, `1`, `2`, `3`, `4` | CT01, CT04, **CT07**, **CT09** |
| **Cadastrar TCC** (`RF#01` / `UC01`) | Arquivo do TCC (`E09`, `E10`: `ArquivoTcc 0..1`, `FormatoArquivo`) | `CEV13`, `CEV14`, `CEI13`, `CEV15` (`PDF`), `CEV16` (`DOCX`), `CEV17` (`EPUB`), `CEI14` \| AVL Arquivos: `0`, `1`, `2` | CT01, **CT07**, **CT09**, **CT10**, **CT13** |
| **Cadastrar TCC** (`RF#01` / `UC01`) | Link do LUME e Rascunho (`E11`, `E12` - `FA02`) | `CEV18`, `CEI15`, `CEI16`, `CEI17`, `CEI18`, `CEV19`, `CEV20` | CT01, CT02, **CT14**, **CT15** |
| **Buscar e Filtrar TCCs** (`RF#02` / `UC04`) | Status do TCC e Quantidade de Critérios (`B01`, `B02`) | `CEV21` (`PUBLICADO`), `CEI19` (`RASCUNHO`), `CEV22`, `CEV23`, `CEV24` \| AVL Critérios ativos: `0`, `1`, `2`, `3`, `6` | CT03, CT05, **CT17**, **CT18**, **CT19**, **CT20** |
| **Buscar e Filtrar TCCs** (`RF#02` / `UC04`) | Barra de Pesquisa e Filtros (`B03` a `B08`) | `CEV25`–`CEV31`, `CEI20`–`CEI26` \| AVL Fronteira de Ano (`2024/2` vs. `2025/1` e `2025/2`) e `1` vs. múltiplas Tags | CT03, CT05, **CT17**, **CT18**, **CT20** |
| **Buscar e Filtrar TCCs** (`RF#02` / `UC04`) | Quantidade de Resultados no Feed (`B09` - `FA01`) | `CEI27` (`0` resultados), `CEV32` (`1` resultado), `CEV33` (`> 1` resultados) | CT03, CT05, **CT17**–**CT20** |
| **Buscar e Filtrar TCCs** (`RF#02` / `UC04`) | Download do Artigo (`B10` - `FA02`) | `CEV34` (`PDF`), `CEV35` (`DOCX`), `CEV36` (`EPUB`), `CEI28` (falha de rede), `CEI29` (`0` arquivos anexados) | CT06, **CT21** |

