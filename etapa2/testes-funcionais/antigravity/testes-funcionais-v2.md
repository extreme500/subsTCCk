# Testes Funcionais (v2) — Classes de Equivalência e Análise de Valor Limite

Este documento aplica com rigor os critérios de **Particionamento em Classes de Equivalência** e **Análise de Valor Limite** sobre a especificação da Etapa 1 (`contexto/relatorio-etapa1.md` e `contexto/diagramas/`), estruturado separadamente para cada uma das duas funcionalidades: **UC01 — Cadastrar TCC (`RF#01`)** e **UC04 — Buscar e Filtrar TCCs (`RF#02`)**.

---

# Funcionalidade 1: UC01 — Cadastrar TCC (`RF#01`)

## 1. Condições de Entrada (UC01)

As entradas e condições definidas pelo relatório e pelos diagramas para o cadastro de TCC são:

1. **Autenticação e perfil do usuário:** O ator deve ser um **Aluno Formando (Autor)** autenticado com credenciais institucionais válidas da UFRGS; visitantes têm acesso restrito ao modo leitura, sem permissão de escrita.
   - *Origem:* Seção 2.1 (Stakeholders — Restrição de acesso), `UC01` (Ator principal e Pré-condições), Diagrama de Classes (`AlunoFormando` herda de `Usuario` com `loginInstitucional: String`) e Diagrama de Atividades (`atividades-uc01.png`).
2. **Título (`titulo: String`):** Campo textual obrigatório do formulário de cadastro do TCC.
   - *Origem:* `RF#01`, `UC01` (Passos 2, 3 e 8), `UC01 - FA01`, `CT01`, Diagrama de Classes (`TCC.titulo: String`).
3. **Resumo simplificado (`resumoSimplificado: String`):** Campo textual obrigatório do formulário de cadastro do TCC.
   - *Origem:* `RF#01`, `US#01`, `UC01` (Passos 2, 3 e 8), `UC01 - FA01`, `CT01`, `CT04`, Diagrama de Classes (`TCC.resumoSimplificado: String`).
4. **Ano/Semestre (`ano: int`, `semestre: int`):** Campo obrigatório indicando o ano e o semestre do TCC, que deve estar já defendido. Nos casos de teste do relatório, aparece no formato `AAAA/S` (`2025/2` em `CT01`, `2025/1` e `2024/2` em `CT03`), e no Diagrama de Classes como atributos inteiros `ano: int` e `semestre: int`.
   - *Origem:* `RF#01`, `UC01` (Pré-condições: `"TCC já defendido"`; Passos 2, 3 e 8; `FA01`), `CT01`, `CT03`, Diagrama de Classes (`TCC.ano: int`, `TCC.semestre: int`).
5. **Orientador (`Professor`):** Campo obrigatório que associa o professor orientador ao TCC (mínimo de `1` professor na associação `TCC (0..n) — Professor (1..2)`).
   - *Origem:* `RF#01`, `UC01` (Passos 2, 3 e 8; `FA01`), `CT01`, Diagrama de Classes (`TCC — Professor 1..2`, `TccDTO.orientador: String`).
6. **Coorientador (`Professor`):** Campo opcional do formulário que associa um segundo professor (coorientador) ao TCC (máximo de `2` professores na associação `TCC (0..n) — Professor (1..2)`).
   - *Origem:* `RF#01`, `UC01` (Passo 2: `"Coorientador (opcional)"`), `CT01` (`"coorientador em branco"`), Diagrama de Classes (`TCC — Professor 1..2`).
7. **Tags temáticas — Quantidade (`Tag 1..5`):** Campo obrigatório (`FA01` cita explicitamente `"como Título, Resumo ou Tags"`), com mínimo de `1` e limite máximo de `5` tags (`"seleciona até 5 tags temáticas"`). Tentar adicionar uma 6ª tag é impedido com aviso de limite atingido.
   - *Origem:* `US#01`, `UC01` (Passos 2, 4 e 8; `FA01`), `CT01`, `CT04`, Diagrama de Classes (`TCC ◇— Tag 1..5`).
8. **Tags temáticas — Modo de entrada:** As tags podem ser selecionadas da lista sugerida pelo sistema ou digitadas como novas tags pelo aluno.
   - *Origem:* `UC01` (Passo 4: `"O aluno seleciona até 5 tags temáticas da lista sugerida ou digita novas tags"`).
9. **Mídias / Imagens de demonstração — Quantidade (`Midia 0..3`):** Anexo opcional de figuras/gráficos de demonstração, de `0` até o limite máximo de `3` imagens (`"até 3 imagens/figuras de demonstração"`). Tentar anexar uma 4ª imagem é impedido com aviso de limite atingido.
   - *Origem:* `RF#01`, `US#01`, `UC01` (Passos 2 e 5), `CT01`, `CT04`, Diagrama de Classes (`TCC ◆— Midia 0..3`).
10. **Arquivo do TCC — Presença e Formato (`ArquivoTcc 0..1`, `FormatoArquivo`):** Anexo opcional (`"caso existente"`, multiplicidade `0..1`) do documento do trabalho, restrito aos formatos `DOCX`, `PDF` ou `EPUB`.
    - *Origem:* `RF#01` (`"arquivo docx, pdf ou epub"`), `UC01` (Passo 6: `"o arquivo com as informações (caso existente)"`), Diagrama de Classes (`TCC ◆— ArquivoTcc 0..1`, `FormatoArquivo «Enumeration»: DOCX, PDF, EPUB`).
11. **Link do LUME (`linkLume: String`):** URL permanente do trabalho no repositório oficial da UFRGS (formato `lume.ufrgs.br/handle/10183/NNNNNN`), exigida para publicar o TCC e validada quanto ao domínio e à acessibilidade/integridade (`ValidadorLumeService`).
    - *Origem:* Seção 2.2 (Benchmark LUME), `RF#01`, `UC01` (Pré-condições, Passos 2, 6, 8 e `FA02`), `CT01`, `CT02`, Diagrama de Casos de Uso (`UC03`), Diagrama de Sequência (`sequencia-uc01.png`) e Diagrama de Atividades (`atividades-uc01.png`).
12. **Decisão de salvamento como rascunho (`StatusTcc` em `FA02`):** Quando a validação do Link do LUME falha no passo 8 (`FA02`), o aluno escolhe entre confirmar `"Salvar como rascunho"` (gravando com status `RASCUNHO`, oculto do feed e da busca) ou recusar (retornando ao formulário com os dados mantidos).
    - *Origem:* `UC01` (Pré-condições e `FA02`), `CT02` (resultado esperado e variação), Diagrama de Classes (`StatusTcc: RASCUNHO, PUBLICADO`), Diagrama de Atividades (`atividades-uc01.png`).

---

## 2. Tabela de Classes de Equivalência (UC01)

| Condição de entrada | Classes válidas (IDs CV01, CV02...) | Classes inválidas (IDs CI01, CI02...) | Origem |
|---|---|---|---|
| **Autenticação e perfil do usuário** | **CV01:** Aluno formando autenticado com credenciais institucionais válidas da UFRGS. | **CI01:** Visitante não autenticado (modo leitura, sem permissão de escrita) ou credenciais inválidas. | Seção 2.1, `UC01` (Pré-condições), `atividades-uc01.png` |
| **Título (`titulo: String`)** | **CV02:** Título preenchido (não vazio). | **CI02:** Título não preenchido (em branco). | `RF#01`, `UC01` (Passos 2, 3, 8 e `FA01`), `CT01` |
| **Resumo (`resumoSimplificado: String`)** | **CV03:** Resumo preenchido (não vazio). | **CI03:** Resumo não preenchido (em branco). | `RF#01`, `UC01` (Passos 2, 3, 8 e `FA01`), `CT01`, `CT04` |
| **Ano/Semestre (`ano: int`, `semestre: int`)** | **CV04:** Ano/Semestre preenchido correspondente a TCC já defendido (ex.: `2024/2`, `2025/1`, `2025/2`). | **CI04:** Ano/Semestre não preenchido (em branco).<br>**CI05:** Ano posterior ao período atual (TCC ainda não defendido, ex.: `2026`). | `RF#01`, `UC01` (Pré-condições: `"TCC já defendido"`, Passos 2, 3, 8 e `FA01`), `CT01`, `CT03` |
| **Orientador (`Professor`)** | **CV05:** Orientador preenchido (`1` orientador associado). | **CI06:** Orientador não preenchido (`0` professores associados). | `RF#01`, `UC01` (Passos 2, 3, 8 e `FA01`), `CT01`, `classes.png` (`Professor 1..2`) |
| **Coorientador (`Professor`)** | **CV06:** Coorientador em branco (total de `1` professor).<br>**CV07:** Coorientador preenchido (total de `2` professores). | *(Não há classe inválida definida para o campo opcional isolado; lacunas de multiplicidade registradas na Seção 6).* | `RF#01`, `UC01` (Passo 2: `"Coorientador (opcional)"`), `CT01`, `classes.png` (`Professor 1..2`) |
| **Quantidade de Tags temáticas (`Tag 1..5`)** | **CV08:** Entre `1` e `5` tags selecionadas/digitadas ($1 \le N_{\text{tags}} \le 5$). | **CI07:** Nenhuma tag informada ($N_{\text{tags}} = 0$).<br>**CI08:** Mais de `5` tags ($N_{\text{tags}} > 5$, tentativa de adicionar 6ª tag). | `UC01` (Passos 4, 8 e `FA01`), `CT01`, `CT04`, `classes.png` (`Tag 1..5`) |
| **Modo de entrada das Tags** | **CV09:** Tag selecionada da lista sugerida.<br>**CV10:** Nova tag digitada pelo aluno. | *(Regras de validação lexical de novas tags não definidas; ver Seção 6).* | `UC01` (Passo 4) |
| **Quantidade de Imagens de demonstração (`Midia 0..3`)** | **CV11:** Nenhuma imagem anexada ($N_{\text{img}} = 0$).<br>**CV12:** Entre `1` e `3` imagens anexadas ($1 \le N_{\text{img}} \le 3$). | **CI09:** Mais de `3` imagens anexadas ($N_{\text{img}} > 3$, tentativa de anexar 4ª imagem). | `RF#01`, `UC01` (Passo 5), `CT01`, `CT04`, `classes.png` (`Midia 0..3`) |
| **Arquivo do TCC — Presença e Formato (`ArquivoTcc 0..1`, `FormatoArquivo`)** | **CV13:** Nenhum arquivo anexado ($N_{\text{arq}} = 0$).<br>**CV14:** `1` arquivo anexado em formato `PDF`.<br>**CV15:** `1` arquivo anexado em formato `DOCX`.<br>**CV16:** `1` arquivo anexado em formato `EPUB`. | **CI10:** Arquivo anexado em formato diferente de `DOCX`, `PDF` e `EPUB` (ex.: `.zip`, `.txt`). | `RF#01`, `UC01` (Passo 6: `"caso existente"`), `classes.png` (`ArquivoTcc 0..1`, `FormatoArquivo`) |
| **Link do LUME (`linkLume: String`)** | **CV17:** URL pertencente ao domínio do LUME (`lume.ufrgs.br/handle/10183/NNNNNN`), existente e acessível. | **CI11:** URL com domínio incorreto / fora do LUME (ex.: `http://exemplo.com/tcc-123`).<br>**CI12:** URL no domínio do LUME, porém quebrada / inexistente.<br>**CI13:** Servidor do LUME indisponível durante a validação. | Seção 2.2, `RF#01`, `UC01` (Pré-condições, Passos 6, 8 e `FA02`), `CT01`, `CT02`, `sequencia-uc01.png` |
| **Decisão de salvar rascunho (`FA02`)** | **CV18:** Selecionar `"Salvar como rascunho"` (Sim) quando a validação da URL falha.<br>**CV19:** Recusar o rascunho (Não) quando a validação da URL falha. | *(Decisão binária sem classe inválida).* | `UC01` (`FA02`), `CT02` (e variação), `atividades-uc01.png` |

---

## 3. Tabela de Análise de Valor Limite (UC01)

| Condição | Limite | Valores a testar (limite - 1, limite, limite + 1, ou mínimo/máximo) | Resultado esperado | Origem |
|---|---|---|---|---|
| **Quantidade de Tags temáticas (`Tag 1..5`)** | Limite mínimo = `1` tag | **VL01 (`limite - 1` = `0` tags)**<br>**VL02 (`limite` = `1` tag)**<br>**VL03 (`limite + 1` = `2` tags)** | - **0 tags (`VL01`):** Impede a publicação, destaca o campo em vermelho e exibe `"Preencha todos os campos obrigatórios"` (`FA01`).<br>- **1 tag (`VL02`):** Aceita e publica o TCC com `"TCC publicado com sucesso!"`.<br>- **2 tags (`VL03`):** Aceita e publica o TCC com `"TCC publicado com sucesso!"`. | `UC01` (Passo 4 e `FA01`), `classes.png` (`Tag 1..5`) |
| **Quantidade de Tags temáticas (`Tag 1..5`)** | Limite máximo = `5` tags | **VL04 (`limite - 1` = `4` tags)**<br>**VL05 (`limite` = `5` tags)**<br>**VL06 (`limite + 1` = `6` tags)** | - **4 tags (`VL04`):** Aceita e publica o TCC com `"TCC publicado com sucesso!"`.<br>- **5 tags (`VL05`):** Aceita e publica o TCC com 5 tags e `"TCC publicado com sucesso!"`.<br>- **6 tags (`VL06`):** A 6ª tag não é adicionada e o sistema avisa que o limite foi atingido. | `UC01` (Passo 4: `"até 5 tags"`), `CT04`, `classes.png` (`Tag 1..5`) |
| **Quantidade de Imagens de demonstração (`Midia 0..3`)** | Limite mínimo = `0` imagens | *(Não há `limite - 1 = -1` para quantidade de arquivos)*<br>**VL07 (`limite` = `0` imagens)**<br>**VL08 (`limite + 1` = `1` imagem)** | - **0 imagens (`VL07`):** Aceita e publica o TCC sem imagens com `"TCC publicado com sucesso!"`.<br>- **1 imagem (`VL08`):** Aceita e publica o TCC com 1 imagem e `"TCC publicado com sucesso!"`. | `RF#01` (`"até 3 imagens"`), `UC01` (Passo 5), `classes.png` (`Midia 0..3`) |
| **Quantidade de Imagens de demonstração (`Midia 0..3`)** | Limite máximo = `3` imagens | **VL09 (`limite - 1` = `2` imagens)**<br>**VL10 (`limite` = `3` imagens)**<br>**VL11 (`limite + 1` = `4` imagens)** | - **2 imagens (`VL09`):** Aceita e publica o TCC com 2 imagens (`CT01`).<br>- **3 imagens (`VL10`):** Aceita e publica o TCC com 3 imagens (`CT04`).<br>- **4 imagens (`VL11`):** A 4ª imagem não é adicionada e o sistema avisa que o limite foi atingido (`CT04`). | `RF#01`, `UC01` (Passo 5), `CT01`, `CT04`, `classes.png` (`Midia 0..3`) |
| **Quantidade de Professores orientadores (`Professor 1..2`)** | Mínimo = `1` professor (Orientador)<br>Máximo = `2` professores (Orientador + Coorientador) | **VL12 (`mínimo - 1` = `0` professores)**<br>**VL13 (`mínimo` = `1` professor)**<br>**VL14 (`máximo` = `2` professores)** | - **0 professores (`VL12`):** Impede a publicação, destaca Orientador em vermelho e exibe `"Preencha todos os campos obrigatórios"` (`FA01`).<br>- **1 professor (`VL13`):** Aceita (só Orientador, sem Coorientador) e publica (`CT01`).<br>- **2 professores (`VL14`):** Aceita (Orientador + Coorientador) e publica. | `RF#01`, `UC01` (Passo 2 e `FA01`), `CT01`, `classes.png` (`Professor 1..2`) |
| **Quantidade de Arquivos do TCC (`ArquivoTcc 0..1`)** | Mínimo = `0` arquivos<br>Máximo = `1` arquivo | **VL15 (`mínimo` = `0` arquivos)**<br>**VL16 (`máximo` = `1` arquivo)** | - **0 arquivos (`VL15`):** Aceita (anexo opcional) e publica (`CT01`).<br>- **1 arquivo (`VL16`):** Aceita (`PDF`, `DOCX` ou `EPUB`) e publica. | `RF#01`, `UC01` (Passo 6: `"caso existente"`), `CT01`, `classes.png` (`ArquivoTcc 0..1`) |
| **Ano de defesa do TCC (`ano: int`)** | Limite máximo = `2025` (ano corrente dos casos de teste para `"TCC já defendido"`) | **VL17 (`limite - 1` = `2024`)**<br>**VL18 (`limite` = `2025`)**<br>**VL19 (`limite + 1` = `2026`)** | - **Ano 2024 (`VL17`):** Aceito (TCC já defendido) e publicado.<br>- **Ano 2025 (`VL18`):** Aceito (TCC já defendido no ano corrente) e publicado (`CT01`).<br>- **Ano 2026 (`VL19`):** Impede a publicação por violar a pré-condição `"TCC já defendido"` (ano futuro). *(Limite mínimo de ano não definido no relatório; ver Seção 6).* | `UC01` (Pré-condições: `"TCC já defendido"`, Passo 2), `CT01` (`2025/2`), `CT03` (`2024/2`, `2025/1`), `classes.png` (`TCC.ano: int`) |

---

## 4. Casos de Teste para UC01 (Reaproveitamento + Novos Casos)

### Reaproveitamento dos Casos Existentes (CT01, CT02 e CT04)

- **CT01 (Cadastrar TCC com dados válidos — Positivo):** Reaproveitado para cobrir as classes válidas **`CV01`**, **`CV02`**, **`CV03`**, **`CV04`**, **`CV05`**, **`CV06`**, **`CV08`** (3 tags), **`CV09`** (tags da lista sugerida), **`CV12`** (2 imagens), **`CV13`** (sem arquivo anexado), **`CV17`** (link do LUME válido) e os valores limite **`VL09`** (`2` imagens), **`VL13`** (`1` professor), **`VL15`** (`0` arquivos) e **`VL18`** (`Ano = 2025`).
- **CT02 (Cadastrar TCC com link fora do LUME — Negativo / `FA02`):** Reaproveitado para cobrir isoladamente a classe inválida **`CI11`** (`http://exemplo.com/tcc-123`, domínio fora do LUME) e a classe válida **`CV18`** (selecionar `"Salvar como rascunho"`).
- **CT04 (Cadastrar TCC no limite de tags e imagens — Limite/Exceção / `FA01`):** Reaproveitado para cobrir os valores limite **`VL05`** (`5` tags), **`VL06`** (`6` tags — **`CI08`**), **`VL10`** (`3` imagens), **`VL11`** (`4` imagens — **`CI09`**) e a classe inválida **`CI03`** (Resumo em branco).

### Casos de Teste Novos de UC01 (CT07 a CT18)

**CT07 - Cadastrar TCC com 1 tag nova digitada, 0 imagens, coorientador preenchido, arquivo PDF e ano 2024**
- **Objetivo:** Verificar a publicação de TCC combinando as classes válidas e limites ainda não exercitados por `CT01`: limite mínimo de tags (`1` tag nova digitada), limite mínimo de imagens (`0` imagens), limite máximo de professores (`2`: orientador e coorientador), limite máximo de arquivo (`1` arquivo no formato `PDF`) e ano imediatamente anterior ao corrente (`2024`).
- **Relacionamento:** RF#01, UC01, US#01. **Tipo:** positivo (combina `CV01`, `CV02`, `CV03`, `CV04`, `CV05`, `CV07`, `CV08`, `CV10`, `CV11`, `CV14`, `CV17` e limites `VL02`, `VL07`, `VL14`, `VL16`, `VL17`).
- **Pré-condições:** aluno autenticado com credenciais institucionais; base com o link `https://lume.ufrgs.br/handle/10183/100001` ativo no LUME.
- **Entrada:**
  - Título: `"Otimização de consultas em bancos de dados distribuídos"`
  - Resumo: `"Estudo de particionamento e indexação em bancos distribuídos."`
  - Ano/Semestre: `2024/2`
  - Orientador: `Prof. Carlos Lima`
  - Coorientador: `Profª Ana Reis`
  - Link do LUME: `https://lume.ufrgs.br/handle/10183/100001`
  - Tags: `"Bancos Distribuídos"` (`1` tag nova digitada pelo aluno)
  - Mídias: nenhuma (`0` imagens)
  - Arquivo: `monografia.pdf` (`1` arquivo `PDF`)
- **Passos:**
  1. Acessar o menu do perfil e selecionar "Cadastrar Novo TCC".
  2. Preencher os campos com os dados acima (digitando a nova tag, deixando sem imagens e anexando o arquivo `PDF`).
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O sistema valida os campos e o link e exibe `"TCC publicado com sucesso!"`.
  - O TCC fica com status `PUBLICADO`, com orientador e coorientador, `1` tag, `0` imagens e `1` arquivo `PDF`, e aparece no feed e na busca.

**CT08 - Cadastrar TCC com 2 tags, 1 imagem e arquivo em formato DOCX**
- **Objetivo:** Verificar a publicação de TCC exercitando os valores limite adjacentes ao mínimo de tags (`2` tags) e de imagens (`1` imagem) e a classe válida de arquivo no formato `DOCX`.
- **Relacionamento:** RF#01, UC01, US#01. **Tipo:** positivo (combina `CV01`–`CV06`, `CV08`, `CV09`, `CV12`, `CV15`, `CV17` e limites `VL03`, `VL08`, `VL16`, `VL18`).
- **Pré-condições:** aluno autenticado com credenciais institucionais; base com o link `https://lume.ufrgs.br/handle/10183/100002` ativo no LUME.
- **Entrada:**
  - Título: `"Análise estática de código em projetos ágeis"`
  - Resumo: `"Avaliação empírica de ferramentas de análise estática."`
  - Ano/Semestre: `2025/1`
  - Orientador: `Profª Ana Reis` (coorientador em branco)
  - Link do LUME: `https://lume.ufrgs.br/handle/10183/100002`
  - Tags: `Engenharia de Software`, `Qualidade` (`2` tags da lista sugerida)
  - Mídias: `1` imagem PNG
  - Arquivo: `tcc_analise.docx` (`1` arquivo `DOCX`)
- **Passos:**
  1. Acessar o menu do perfil e selecionar "Cadastrar Novo TCC".
  2. Preencher os campos com os dados acima.
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O sistema valida os campos e o link e exibe `"TCC publicado com sucesso!"`.
  - O TCC fica com status `PUBLICADO` com `2` tags, `1` imagem e o arquivo `DOCX` disponível para download.

**CT09 - Cadastrar TCC com 4 tags e arquivo em formato EPUB**
- **Objetivo:** Verificar a publicação de TCC exercitando o valor limite imediatamente abaixo do máximo de tags (`4` tags) e a classe válida de arquivo no formato `EPUB`.
- **Relacionamento:** RF#01, UC01, US#01. **Tipo:** positivo (combina `CV01`–`CV06`, `CV08`, `CV09`, `CV12`, `CV16`, `CV17` e limites `VL04`, `VL09`, `VL16`, `VL18`).
- **Pré-condições:** aluno autenticado com credenciais institucionais; base com o link `https://lume.ufrgs.br/handle/10183/100003` ativo no LUME.
- **Entrada:**
  - Título: `"Renderização em tempo real para dispositivos móveis"`
  - Resumo: `"Pipeline gráfico otimizado para GPUs móveis."`
  - Ano/Semestre: `2025/2`
  - Orientador: `Prof. Carlos Lima` (coorientador em branco)
  - Link do LUME: `https://lume.ufrgs.br/handle/10183/100003`
  - Tags: `Computação Gráfica`, `IA`, `Sistemas Embarcados`, `Jogos` (`4` tags)
  - Mídias: `2` imagens PNG
  - Arquivo: `tcc_renderizacao.epub` (`1` arquivo `EPUB`)
- **Passos:**
  1. Acessar o menu do perfil e selecionar "Cadastrar Novo TCC".
  2. Preencher os campos com os dados acima.
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O sistema valida os campos e o link e exibe `"TCC publicado com sucesso!"`.
  - O TCC fica com status `PUBLICADO` com `4` tags e o arquivo `EPUB` disponível para download.

**CT10 - Tentar acessar o cadastro de TCC como visitante não autenticado**
- **Objetivo:** Verificar que o sistema impede o cadastro de TCC por um usuário não autenticado com credenciais institucionais da UFRGS (cobrindo isoladamente a classe inválida `CI01`).
- **Relacionamento:** RF#01, UC01 (Pré-condições). **Tipo:** negativo (`CI01`).
- **Pré-condições:** usuário acessando a plataforma em modo visitante (não autenticado).
- **Entrada:** solicitação de acesso à funcionalidade "Cadastrar Novo TCC" sem credenciais institucionais.
- **Passos:**
  1. Acessar o aplicativo sem realizar login institucional.
  2. Tentar acionar a opção de cadastro de TCC.
- **Resultados esperados:**
  - O sistema bloqueia o acesso à tela de escrita/cadastro de TCC e solicita autenticação com credenciais institucionais válidas da UFRGS.

**CT11 - Cadastrar TCC com o campo obrigatório Título em branco (FA01)**
- **Objetivo:** Verificar que o sistema impede a publicação quando exclusivamente o campo obrigatório Título está em branco (cobrindo isoladamente a classe inválida `CI02`).
- **Relacionamento:** RF#01, UC01 (FA01). **Tipo:** negativo (`CI02`).
- **Pré-condições:** aluno autenticado com credenciais institucionais; link ativo no LUME.
- **Entrada:** mesmos dados válidos de CT01, exceto:
  - Título: em branco.
- **Passos:**
  1. Acessar o menu do perfil e selecionar "Cadastrar Novo TCC".
  2. Preencher todos os dados de CT01, deixando apenas o campo Título em branco.
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O sistema impede a publicação, mantém os dados digitados, destaca em vermelho o campo Título e exibe a mensagem: `"Preencha todos os campos obrigatórios"`.

**CT12 - Cadastrar TCC com o campo obrigatório Ano/Semestre em branco (FA01)**
- **Objetivo:** Verificar que o sistema impede a publicação quando exclusivamente o campo obrigatório Ano/Semestre está em branco (cobrindo isoladamente a classe inválida `CI04`).
- **Relacionamento:** RF#01, UC01 (FA01). **Tipo:** negativo (`CI04`).
- **Pré-condições:** aluno autenticado com credenciais institucionais; link ativo no LUME.
- **Entrada:** mesmos dados válidos de CT01, exceto:
  - Ano/Semestre: em branco.
- **Passos:**
  1. Acessar o menu do perfil e selecionar "Cadastrar Novo TCC".
  2. Preencher todos os dados de CT01, deixando apenas o campo Ano/Semestre em branco.
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O sistema impede a publicação, mantém os dados digitados, destaca em vermelho o campo Ano/Semestre e exibe a mensagem: `"Preencha todos os campos obrigatórios"`.

**CT13 - Cadastrar TCC com ano futuro 2026 (TCC ainda não defendido)**
- **Objetivo:** Verificar que o sistema impede a publicação quando o ano informado é imediatamente superior ao ano corrente (`2026`, `limite + 1`), violando a pré-condição de TCC já defendido (cobrindo isoladamente `CI05` e `VL19`).
- **Relacionamento:** RF#01, UC01 (Pré-condições e Passo 8). **Tipo:** negativo / limite (`CI05`, `VL19`).
- **Pré-condições:** aluno autenticado com credenciais institucionais; ano corrente de referência `2025`.
- **Entrada:** mesmos dados válidos de CT01, exceto:
  - Ano/Semestre: `2026/1`.
- **Passos:**
  1. Acessar o menu do perfil e selecionar "Cadastrar Novo TCC".
  2. Preencher os dados de CT01 informando Ano/Semestre `2026/1`.
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O sistema impede a publicação por se tratar de ano futuro (trabalho ainda não defendido), mantendo os dados preenchidos no formulário.

**CT14 - Cadastrar TCC com o campo obrigatório Orientador em branco (0 professores) (FA01)**
- **Objetivo:** Verificar que o sistema impede a publicação quando nenhum professor orientador é informado (`0` professores associados, cobrindo isoladamente `CI06` e o limite `VL12`).
- **Relacionamento:** RF#01, UC01 (FA01). **Tipo:** negativo / limite (`CI06`, `VL12`).
- **Pré-condições:** aluno autenticado com credenciais institucionais; link ativo no LUME.
- **Entrada:** mesmos dados válidos de CT01, exceto:
  - Orientador: em branco (e Coorientador em branco — `0` professores).
- **Passos:**
  1. Acessar o menu do perfil e selecionar "Cadastrar Novo TCC".
  2. Preencher todos os dados de CT01, deixando o campo Orientador em branco.
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O sistema impede a publicação, mantém os dados digitados, destaca em vermelho o campo Orientador e exibe a mensagem: `"Preencha todos os campos obrigatórios"`.

**CT15 - Cadastrar TCC sem nenhuma tag selecionada (0 tags) (FA01)**
- **Objetivo:** Verificar que o sistema impede a publicação quando `0` tags são informadas (`limite - 1` do mínimo de tags, cobrindo isoladamente `CI07` e `VL01`).
- **Relacionamento:** RF#01, UC01 (FA01), US#01. **Tipo:** negativo / limite (`CI07`, `VL01`).
- **Pré-condições:** aluno autenticado com credenciais institucionais; link ativo no LUME.
- **Entrada:** mesmos dados válidos de CT01, exceto:
  - Tags: nenhuma (`0` tags selecionadas/digitadas).
- **Passos:**
  1. Acessar o menu do perfil e selecionar "Cadastrar Novo TCC".
  2. Preencher todos os dados de CT01, mas não selecionar nem digitar nenhuma tag.
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O sistema impede a publicação, mantém os dados digitados, destaca em vermelho o campo Tags e exibe a mensagem: `"Preencha todos os campos obrigatórios"`.

**CT16 - Cadastrar TCC anexando arquivo em formato não suportado**
- **Objetivo:** Verificar que o sistema rejeita o anexo de arquivo do trabalho quando o formato não pertence a `DOCX`, `PDF` ou `EPUB` (cobrindo isoladamente a classe inválida `CI10`).
- **Relacionamento:** RF#01, UC01. **Tipo:** negativo (`CI10`).
- **Pré-condições:** aluno autenticado com credenciais institucionais; link ativo no LUME.
- **Entrada:** mesmos dados válidos de CT01, acrescentando:
  - Arquivo: `trabalho.zip` (formato inválido fora de `DOCX`, `PDF`, `EPUB`).
- **Passos:**
  1. Acessar o menu do perfil e selecionar "Cadastrar Novo TCC".
  2. Preencher os dados de CT01 e tentar anexar o arquivo `trabalho.zip` no campo de arquivo do TCC.
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O sistema não aceita o arquivo `trabalho.zip` por não estar em formato `DOCX`, `PDF` ou `EPUB` e impede a publicação com o arquivo inválido.

**CT17 - Cadastrar TCC com link do LUME quebrado/inexistente e recusar salvar como rascunho (FA02)**
- **Objetivo:** Verificar o tratamento de URL pertencente ao domínio do LUME mas quebrada/inexistente (cobrindo isoladamente `CI12`) e o retorno ao formulário quando o aluno recusa salvar como rascunho (`CV19`).
- **Relacionamento:** RF#01, UC01 (FA02). **Tipo:** negativo (`CI12`, `CV19`).
- **Pré-condições:** aluno autenticado com credenciais institucionais; handle `10183/999999` inexistente no repositório LUME.
- **Entrada:** mesmos dados válidos de CT01, exceto:
  - Link do LUME: `https://lume.ufrgs.br/handle/10183/999999` (link quebrado no domínio do LUME).
- **Passos:**
  1. Abrir o formulário "Cadastrar Novo TCC" e preencher os dados acima.
  2. Clicar em "Publicar TCC".
  3. Na mensagem exibida, recusar a opção de salvar como rascunho.
- **Resultados esperados:**
  - O sistema não publica e exibe o aviso: `"A URL informada não pertence ao domínio do LUME ou está inacessível. Deseja salvar como rascunho até que a publicação no LUME esteja homologada?"`.
  - Ao recusar o rascunho, o TCC não é salvo e o formulário volta com todos os dados mantidos.

**CT18 - Cadastrar TCC com servidor do LUME indisponível (FA02)**
- **Objetivo:** Verificar que a indisponibilidade do servidor externo do LUME no passo 8 aciona o fluxo alternativo `FA02` (cobrindo isoladamente a classe inválida `CI13`).
- **Relacionamento:** RF#01, UC01 (FA02). **Tipo:** negativo / exceção (`CI13`, `CV18`).
- **Pré-condições:** aluno autenticado com credenciais institucionais; servidor externo do LUME indisponível/inacessível no momento da checagem.
- **Entrada:** mesmos dados de CT01 (com link `https://lume.ufrgs.br/handle/10183/26428`).
- **Passos:**
  1. Abrir o formulário "Cadastrar Novo TCC" e preencher os dados de CT01.
  2. Clicar em "Publicar TCC" enquanto o servidor do LUME está indisponível.
  3. Na mensagem exibida, selecionar "Salvar como rascunho".
- **Resultados esperados:**
  - O sistema não publica e exibe o aviso: `"A URL informada não pertence ao domínio do LUME ou está inacessível. Deseja salvar como rascunho até que a publicação no LUME esteja homologada?"`.
  - Após a confirmação, aparece `"Rascunho salvo com sucesso"`, e o TCC é armazenado com status `RASCUNHO`, sem aparecer no feed nem nos resultados de busca.

---

## 5. Matriz de Cobertura (UC01)

| Classe de Equivalência / Valor Limite | Descrição resumida | Caso(s) de Teste que o cobrem |
|---|---|---|
| **CV01** | Aluno formando autenticado com credenciais institucionais válidas | CT01, CT02, CT04, CT07, CT08, CT09, CT11–CT18 |
| **CV02** | Título preenchido | CT01, CT02, CT04, CT07, CT08, CT09, CT12–CT18 |
| **CV03** | Resumo simplificado preenchido | CT01, CT02, CT04 (passo 5), CT07, CT08, CT09, CT11–CT18 |
| **CV04** | Ano/Semestre válido preenchido | CT01, CT02, CT04, CT07, CT08, CT09, CT11, CT14–CT18 |
| **CV05** | Orientador preenchido | CT01, CT02, CT04, CT07, CT08, CT09, CT11–CT13, CT15–CT18 |
| **CV06** | Coorientador em branco (`1` professor) | CT01, CT02, CT04, CT08, CT09 |
| **CV07** | Coorientador preenchido (`2` professores) | **CT07** |
| **CV08** | Quantidade válida de tags (`1` a `5`) | CT01 (`3`), CT04 (`5`), **CT07** (`1`), **CT08** (`2`), **CT09** (`4`) |
| **CV09** | Tag selecionada da lista sugerida | CT01, CT04, **CT08**, **CT09** |
| **CV10** | Nova tag digitada pelo aluno | **CT07** |
| **CV11** | `0` imagens de demonstração anexadas | **CT07** |
| **CV12** | `1` a `3` imagens de demonstração anexadas | CT01 (`2`), CT04 (`3`), **CT08** (`1`), **CT09** (`2`) |
| **CV13** | Nenhum arquivo do TCC anexado (`0` arquivos) | CT01, CT02, CT04 |
| **CV14** | `1` arquivo do TCC no formato `PDF` | **CT07** |
| **CV15** | `1` arquivo do TCC no formato `DOCX` | **CT08** |
| **CV16** | `1` arquivo do TCC no formato `EPUB` | **CT09** |
| **CV17** | Link do LUME válido e acessível | CT01, CT04, **CT07**, **CT08**, **CT09** |
| **CV18** | Confirmar `"Salvar como rascunho"` no `FA02` | CT02, **CT18** |
| **CV19** | Recusar `"Salvar como rascunho"` no `FA02` | CT02 (variação), **CT17** |
| **CI01** | Visitante não autenticado / sem permissão de escrita | **CT10** |
| **CI02** | Título em branco (`FA01`) | **CT11** |
| **CI03** | Resumo em branco (`FA01`) | CT04 (passo 4) |
| **CI04** | Ano/Semestre em branco (`FA01`) | **CT12** |
| **CI05** | Ano futuro (TCC ainda não defendido) | **CT13** |
| **CI06** | Orientador em branco (`0` professores — `FA01`) | **CT14** |
| **CI07** | `0` tags selecionadas (`FA01`) | **CT15** |
| **CI08** | Tentativa de adicionar `6ª` tag (acima do limite `5`) | CT04 (passo 2) |
| **CI09** | Tentativa de anexar `4ª` imagem (acima do limite `3`) | CT04 (passo 3) |
| **CI10** | Arquivo do TCC em formato inválido (fora de `DOCX`, `PDF`, `EPUB`) | **CT16** |
| **CI11** | Link com domínio fora do LUME (`FA02`) | CT02 |
| **CI12** | Link no domínio do LUME, porém quebrado/inexistente (`FA02`) | **CT17** |
| **CI13** | Servidor do LUME indisponível (`FA02`) | **CT18** |
| **VL01** | Tags: `limite mínimo - 1` = `0` tags | **CT15** |
| **VL02** | Tags: `limite mínimo` = `1` tag | **CT07** |
| **VL03** | Tags: `limite mínimo + 1` = `2` tags | **CT08** |
| **VL04** | Tags: `limite máximo - 1` = `4` tags | **CT09** |
| **VL05** | Tags: `limite máximo` = `5` tags | CT04 |
| **VL06** | Tags: `limite máximo + 1` = `6` tags | CT04 |
| **VL07** | Imagens: `limite mínimo` = `0` imagens | **CT07** |
| **VL08** | Imagens: `limite mínimo + 1` = `1` imagem | **CT08** |
| **VL09** | Imagens: `limite máximo - 1` = `2` imagens | CT01, **CT09** |
| **VL10** | Imagens: `limite máximo` = `3` imagens | CT04 |
| **VL11** | Imagens: `limite máximo + 1` = `4` imagens | CT04 |
| **VL12** | Professores: `mínimo - 1` = `0` professores | **CT14** |
| **VL13** | Professores: `mínimo` = `1` professor (só Orientador) | CT01, **CT08**, **CT09** |
| **VL14** | Professores: `máximo` = `2` professores (Orientador + Coorientador) | **CT07** |
| **VL15** | Arquivo do TCC: `mínimo` = `0` arquivos | CT01 |
| **VL16** | Arquivo do TCC: `máximo` = `1` arquivo | **CT07**, **CT08**, **CT09** |
| **VL17** | Ano do TCC: `limite - 1` = `2024` | **CT07** |
| **VL18** | Ano do TCC: `limite` = `2025` | CT01, **CT08**, **CT09** |
| **VL19** | Ano do TCC: `limite + 1` = `2026` | **CT13** |

---

## 6. Lacunas da Especificação (UC01)

1. **Tamanho mínimo e máximo de `Título` e `Resumo simplificado`:** O relatório define ambos como campos textuais obrigatórios, mas não define a quantidade mínima nem máxima de caracteres/palavras, nem se entradas contendo apenas espaços em branco são rejeitadas.
   - *Pergunta para o grupo:* Qual é o número mínimo e máximo de caracteres permitido para o `Título` e para o `Resumo simplificado`?
2. **Formato de entrada, faixa de anos aceita e valores válidos de `Ano/Semestre`:** O formulário (`UC01` Passo 2) cita um único campo `"Ano/Semestre"` (preenchido como `2025/2` em `CT01`), mas o Diagrama de Classes modela dois inteiros separados (`ano: int` e `semestre: int`). O relatório não define o ano mínimo aceito nem se `semestre` aceita apenas `1` e `2`.
   - *Pergunta para o grupo:* Qual é o menor ano aceito no cadastro (por exemplo, ano de criação do INF/LUME), como o ano máximo é validado em relação ao semestre corrente, e o semestre é restrito apenas aos valores `1` e `2`?
3. **Seleção e unicidade de `Orientador` e `Coorientador`:** No Diagrama de Classes há a relação `Professor 1..2`, mas em `TccDTO` não existe campo para `coorientador`. Também não é definido se o aluno seleciona docentes de uma lista cadastrada ou digita texto livre, nem se o mesmo professor pode ser selecionado como orientador e coorientador.
   - *Pergunta para o grupo:* O orientador e o coorientador são selecionados de uma lista de `Professor` pré-cadastrados (impedindo que sejam a mesma pessoa e limitando a interface a 1 coorientador), e `TccDTO` deve incluir o atributo `coorientador`?
4. **Regras para novas `Tags` digitadas e mensagem literal de limite de tags/imagens:** O `UC01` permite digitar novas tags, sem definir tamanho máximo da tag ou tratamento de duplicatas/maiúsculas. Além disso, `CT04` afirma que *"o sistema avisa que o limite foi atingido"* ao tentar inserir a 6ª tag ou 4ª imagem, mas não define a string literal desse aviso.
   - *Pergunta para o grupo:* Quais são os limites de caracteres e regras de normalização (maiúsculas/acentos) ao criar uma nova tag, e qual é a mensagem exata exibida ao atingir o limite de 5 tags ou de 3 imagens?
5. **Formatos de imagem permitidos, tamanho máximo de upload e obrigatoriedade de `Midia.descricao`:** `CT01` e `CT04` utilizam imagens `PNG`, mas `RF#01` e `classes.png` não especificam quais formatos de imagem são aceitos (ex.: `PNG`, `JPG`, `WEBP`), nem o tamanho máximo em MB para cada `Midia` e para o `ArquivoTcc` (`DOCX`, `PDF`, `EPUB`), nem se `descricao: String` em `Midia` é obrigatória.
   - *Pergunta para o grupo:* Quais extensões de imagem e qual tamanho máximo (em MB) são aceitos para as mídias e para o arquivo do TCC, e qual mensagem de erro deve ser exibida quando um arquivo inválido é anexado?
6. **Campo `Link do LUME` em branco vs. Botão direto de `"Salvar como rascunho"`:** As pré-condições de `UC01` dizem que *"A URL do LUME é exigida apenas para publicar; sem ela, o trabalho pode ser salvo como rascunho"*, mas o fluxo principal só apresenta o botão `"Publicar TCC"`.
   - *Pergunta para o grupo:* Haverá um botão `"Salvar como rascunho"` diretamente no formulário ou deixar o `Link do LUME` em branco ao clicar em `"Publicar TCC"` deve acionar o diálogo do `FA02` (em vez do erro `FA01` de campo obrigatório)?

---
---

# Funcionalidade 2: UC04 — Buscar e Filtrar TCCs (`RF#02`)

## 1. Condições de Entrada (UC04)

As entradas, filtros e condições definidas pelo relatório e pelos diagramas para a busca, filtragem e download de TCCs são:

1. **Status do TCC cadastrado (`StatusTcc`):** Somente TCCs com status `PUBLICADO` são considerados na busca; trabalhos com status `RASCUNHO` permanecem ocultos do feed e dos resultados.
   - *Origem:* `UC04` (Pré-condição: `"status 'PUBLICADO'"`), `CT02`, `CT03`, `CT05`, Diagrama de Classes (`StatusTcc: RASCUNHO, PUBLICADO`), Diagrama de Atividades (`atividades-uc04.png`: `"somente TCCs PUBLICADOS"`).
2. **Termo na barra de pesquisa (`termo: String`):** Palavra ou expressão digitada pelo usuário leitor na barra de pesquisa (como termo contido no trabalho ou nome de orientador conforme `US#04`).
   - *Origem:* `US#04` (critério 3), `UC04` (Passos 2, 3 e 5; `FA01`), `CT05`, Diagrama de Classes (`FiltroBusca.termo: String`), Diagrama de Atividades (`atividades-uc04.png`).
3. **Filtro Data/Ano (`ano: int`):** Filtro pelo ano do TCC. Na base de dados do relatório (`CT03`), os TCCs publicados distribuem-se entre os anos `2024` (`2024/2`) e `2025` (`2025/1`, `2025/2`).
   - *Origem:* `RF#02` ("por ano"), `UC04` (Passos 2, 3 e 5; `FA01`), `CT03` (`Ano = 2025` e variação `Ano = 2023`), Diagrama de Classes (`FiltroBusca.ano: int`), Diagrama de Atividades (`atividades-uc04.png`).
4. **Filtro Autores (`autor: String`):** Filtro pelo autor do TCC.
   - *Origem:* `RF#02` ("autor"), `UC04` (Passos 2, 3 e 5; `FA01`), Diagrama de Classes (`FiltroBusca.autor: String`), Diagrama de Atividades (`atividades-uc04.png`).
5. **Filtro Orientadores (`orientador: String`):** Filtro pelo professor orientador do TCC.
   - *Origem:* `RF#02` ("orientador"), `US#04`, `UC04` (Passos 2, 3 e 5; `FA01`), `CT03`, Diagrama de Classes (`FiltroBusca.orientador: String`), Diagrama de Atividades (`atividades-uc04.png`).
6. **Filtro Assuntos/Tags (`tags: String`):** Filtro por tag(s) temática(s) associada(s) ao TCC.
   - *Origem:* `RF#02` ("tags"), `US#04`, `UC04` (Passos 2, 3 e 5; `FA01`), `CT01`, `CT03`, `CT05`, Diagrama de Classes (`FiltroBusca.tags: String`, `TccRepository.buscarPorTags`), Diagrama de Atividades (`atividades-uc04.png`).
7. **Filtro Coleções:** Filtro pela coleção à qual o TCC pertence.
   - *Origem:* `RF#02` ("coleção"), `UC04` (Passos 2, 3 e 5; `FA01`).
8. **Combinação simultânea de filtros e termos:** O usuário pode aplicar `1` ou mais critérios (barra de busca e/ou filtros de Ano, Autores, Orientadores, Assuntos/Tags e Coleções); o sistema exibe apenas os trabalhos publicados que atendem a **todas** as condições simultaneamente (conjunção `AND`).
   - *Origem:* `UC04` (Passos 3 e 5; `FA01`), `CT03`, `CT05`, Diagrama de Atividades (`atividades-uc04.png`).
9. **Download do arquivo do artigo (`FormatoArquivo` e conexão de rede):** Ação `"Baixar Artigo"` na página de detalhes do TCC selecionado, que transfere o arquivo (`DOCX`, `PDF` ou `EPUB`) para o dispositivo do usuário ou exibe mensagem de erro caso a transferência falhe (`FA02`).
   - *Origem:* `RF#02` ("baixar o arquivo do trabalho"), `UC04` (Passos 6 a 9 e `FA02`), `CT06`, Diagrama de Classes (`TccController.baixarArquivo`, `FormatoArquivo`), Diagrama de Atividades (`atividades-uc04.png`).

---

## 2. Tabela de Classes de Equivalência (UC04)

| Condição de entrada | Classes válidas (IDs CV20, CV21...) | Classes inválidas (IDs CI14, CI15...) | Origem |
|---|---|---|---|
| **Status do TCC na base (`StatusTcc`)** | **CV20:** TCC com status `PUBLICADO` compatível com a busca. | **CI14:** TCC com status `RASCUNHO` (nunca deve ser retornado na busca). | `UC04` (Pré-condição, Passo 5 e `FA01`), `CT03`, `CT05`, `classes.png`, `atividades-uc04.png` |
| **Termo na barra de pesquisa (`termo: String`)** | **CV21:** Termo preenchido que ocorre em TCC(s) `PUBLICADO`(s).<br>**CV22:** Barra de pesquisa em branco (quando combinada com ao menos um filtro). | **CI15:** Termo preenchido que não ocorre em nenhum TCC `PUBLICADO` (ex.: `"blockchain"` — aciona `FA01`). | `US#04`, `UC04` (Passos 2, 3, 5 e `FA01`), `CT03`, `CT05`, `classes.png` |
| **Filtro Data/Ano (`ano: int`)** | **CV23:** Ano selecionado que possui TCC(s) `PUBLICADO`(s) (ex.: `2024`, `2025`). | **CI16:** Ano selecionado sem nenhum TCC `PUBLICADO` (ex.: `2023`, `2026` — aciona `FA01`). | `RF#02`, `UC04` (Passos 2, 3, 5 e `FA01`), `CT03`, `classes.png` |
| **Filtro Autores (`autor: String`)** | **CV24:** Autor selecionado que possui TCC(s) `PUBLICADO`(s). | **CI17:** Autor selecionado sem nenhum TCC `PUBLICADO` (aciona `FA01`). | `RF#02`, `UC04` (Passos 2, 3, 5 e `FA01`), `classes.png` |
| **Filtro Orientadores (`orientador: String`)** | **CV25:** Orientador selecionado que possui TCC(s) `PUBLICADO`(s). | **CI18:** Orientador selecionado sem nenhum TCC `PUBLICADO` (aciona `FA01`). | `RF#02`, `US#04`, `UC04` (Passos 2, 3, 5 e `FA01`), `CT03`, `classes.png` |
| **Filtro Assuntos/Tags (`tags: String`)** | **CV26:** Tag selecionada que possui TCC(s) `PUBLICADO`(s). | **CI19:** Tag selecionada sem nenhum TCC `PUBLICADO` (aciona `FA01`). | `RF#02`, `US#04`, `UC04` (Passos 2, 3, 5 e `FA01`), `CT03`, `CT05`, `classes.png` |
| **Filtro Coleções** | **CV27:** Coleção selecionada que possui TCC(s) `PUBLICADO`(s). | **CI20:** Coleção selecionada sem nenhum TCC `PUBLICADO` (aciona `FA01`). | `RF#02`, `UC04` (Passos 2, 3, 5 e `FA01`) |
| **Combinação de critérios de busca/filtros** | **CV28:** `1` único critério ativo (apenas termo ou apenas 1 filtro).<br>**CV29:** Múltiplos critérios ativos simultaneamente (`2` a `6`) com TCC(s) `PUBLICADO`(s) que satisfazem todas as condições (`AND`). | **CI21:** Múltiplos critérios individualmente válidos, mas sem nenhum TCC `PUBLICADO` que atenda a todos simultaneamente (interseção vazia — aciona `FA01`). | `UC04` (Passos 3, 5 e `FA01`), `CT03`, `CT05`, `atividades-uc04.png` |
| **Download do arquivo do artigo (`FormatoArquivo` e rede)** | **CV30:** Download concluído de arquivo `PDF`.<br>**CV31:** Download concluído de arquivo `DOCX`.<br>**CV32:** Download concluído de arquivo `EPUB`. | **CI22:** Falha na transferência / perda de conexão com a internet durante o download (`FA02`). | `RF#02`, `UC04` (Passos 8, 9 e `FA02`), `CT06`, `classes.png`, `atividades-uc04.png` |

---

## 3. Tabela de Análise de Valor Limite (UC04)

| Condição | Limite | Valores a testar (limite - 1, limite, limite + 1, ou mínimo/máximo) | Resultado esperado | Origem |
|---|---|---|---|---|
| **Filtro Data/Ano (`ano: int`, faixa de anos com TCCs publicados na base: `[2024, 2025]`)** | Limite mínimo na base = `2024` | **VL20 (`limite - 1` = `2023`)**<br>**VL21 (`limite` = `2024`)**<br>**VL22 (`limite + 1` = `2025`)** | - **Ano 2023 (`VL20`):** Feed vazio e exibe `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."` (`CT03` variação, `FA01`).<br>- **Ano 2024 (`VL21`):** Exibe no feed os TCCs publicados em `2024` (TCC C).<br>- **Ano 2025 (`VL22`):** Exibe no feed os TCCs publicados em `2025` (TCCs A, B, D; oculta rascunho E). | `RF#02`, `UC04` (Passos 2, 5 e `FA01`), `CT03` |
| **Filtro Data/Ano (`ano: int`, faixa de anos com TCCs publicados na base: `[2024, 2025]`)** | Limite máximo na base = `2025` | **VL21 (`limite - 1` = `2024`)**<br>**VL22 (`limite` = `2025`)**<br>**VL23 (`limite + 1` = `2026`)** | - **Ano 2024 (`VL21`):** Exibe no feed os TCCs publicados em `2024` (TCC C).<br>- **Ano 2025 (`VL22`):** Exibe no feed os TCCs publicados em `2025` (TCCs A, B, D).<br>- **Ano 2026 (`VL23`):** Feed vazio e exibe `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."` (`FA01`). | `RF#02`, `UC04` (Passos 2, 5 e `FA01`), `CT03` |
| **Quantidade de critérios de busca/filtros combinados (`[1, 6]`)** | Mínimo = `1` critério ativo<br>Máximo = `6` critérios ativos (Termo + 5 filtros) | **VL24 (`mínimo` = `1` critério)**<br>**VL25 (`mínimo + 1` = `2` critérios)**<br>**VL26 (`máximo - 1` = `5` critérios)**<br>**VL27 (`máximo` = `6` critérios)** | - **1 critério (`VL24`):** Exibe todos os TCCs publicados que atendem ao critério único (`CT05` passo 4).<br>- **2 critérios (`VL25`):** Aplica ambos simultaneamente (`CT05` passo 3 / `CT03` variação).<br>- **5 critérios (`VL26`):** Aplica os 5 filtros simultaneamente e exibe os TCCs publicados compatíveis.<br>- **6 critérios (`VL27`):** Aplica o termo e os 5 filtros simultaneamente e exibe os TCCs publicados compatíveis. *(Caso de `0` critérios registrado na Seção 6).* | `UC04` (Passos 2, 3 e 5), `CT03`, `CT05` |
| **Quantidade de trabalhos compatíveis retornados no feed (`[0, N]`)** | Limite mínimo de retorno = `0` (vazio) vs. `1` trabalho encontrado | **VL28 (`mínimo` = `0` trabalhos)**<br>**VL29 (`mínimo + 1` = `1` trabalho)**<br>**VL30 (`> 1` = `3` trabalhos)** | - **0 trabalhos (`VL28`):** Feed vazio e exibe `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."` (`FA01`, `CT05` passo 3).<br>- **1 trabalho (`VL29`):** Feed exibe exatamente `1` TCC publicado (`CT03`).<br>- **3 trabalhos (`VL30`):** Feed exibe os `3` TCCs publicados compatíveis (`CT05` passo 4). | `UC04` (Passo 5 e `FA01`), `CT03`, `CT05`, `atividades-uc04.png` |

---

## 4. Casos de Teste para UC04 (Reaproveitamento + Novos Casos)

### Reaproveitamento dos Casos Existentes (CT03, CT05 e CT06)

- **CT03 (Buscar TCCs com filtros combinados — Positivo + Variação):** Reaproveitado para cobrir **`CV20`** (retorna publicado), **`CI14`** (oculta rascunho E), **`CV22`** (barra em branco com filtros), **`CV23`** (**`VL22`**: `Ano = 2025`), **`CV25`** (`Orientador = Carlos Lima`), **`CV26`** (`Tag = Redes`), **`CV29`** (3 filtros combinados) e **`VL29`** (`1` trabalho retornado: TCC A). Sua variação (`Ano = 2023` e `Tag = Redes`) cobre **`CI16`** e o limite inferior inválido **`VL20`** (`Ano = 2023`).
- **CT05 (Buscar TCCs sem correspondência — Negativo / `FA01`):** Reaproveitado para cobrir isoladamente **`CI15`** (`Termo = "blockchain"`), **`VL25`** (`2` critérios combinados) e **`VL28`** (`0` resultados no passo 3); no passo 4, cobre **`CV28`** (**`VL24`**: `1` critério ativo) e **`VL30`** (`3` trabalhos retornados: A, C, D); sua variação cobre isoladamente **`CI14`** (busca pelo título do rascunho E retornando `0` resultados).
- **CT06 (Falha durante o download do artigo — Exceção / `FA02`):** Reaproveitado para cobrir isoladamente **`CI22`** (interrupção de conexão no download, passo 3) e **`CV30`** (download concluído de arquivo `PDF`, passo 4).

### Base de Dados para os Novos Casos de Teste de UC04 (CT19 a CT26)

Considere a mesma base de TCCs de `CT03` (A a E), explicitando os campos de Título, Autor, Coleção e Arquivo anexado conforme o domínio:

| TCC | Título | Autor | Ano/Semestre | Orientador | Tag | Coleção | Arquivo | Status |
|---|---|---|---|---|---|---|---|---|
| **A** | Detecção de anomalias em redes veiculares | Lucas Martins | 2025/1 | Profº Carlos Lima | Redes | Ciência da Computação | `tcc_a.pdf` (`PDF`) | Publicado |
| **B** | Modelos generativos para síntese de voz | Marina Costa | 2025/1 | Profº Carlos Lima | IA | Ciência da Computação | `tcc_b.docx` (`DOCX`) | Publicado |
| **C** | Roteamento seguro em IoT | Pedro Alves | 2024/2 | Profº Carlos Lima | Redes | Engenharia de Computação | `tcc_c.epub` (`EPUB`) | Publicado |
| **D** | Escalonamento em nuvens híbridas | Júlia Rocha | 2025/1 | Profª Ana Reis | Redes | Ciência da Computação | `tcc_d.pdf` (`PDF`) | Publicado |
| **E** | Arquitetura zero-trust em 5G | Bruno Silva | 2025/1 | Profº Carlos Lima | Redes | Engenharia de Computação | `tcc_e.pdf` (`PDF`) | Rascunho |

### Casos de Teste Novos de UC04 (CT19 a CT26)

**CT19 - Buscar TCC combinando todos os 5 filtros e a barra de pesquisa (5 e 6 critérios simultâneos) e baixar artigo em DOCX**
- **Objetivo:** Verificar a busca combinando as classes válidas ainda não cobertas por `CT03` (`Termo`, `Autor` e `Coleção`), exercitando os limites superiores de critérios simultâneos (`5` filtros em `VL26` e `6` critérios em `VL27`) e o download de arquivo em formato `DOCX` (`CV31`).
- **Relacionamento:** RF#02, UC04, US#04. **Tipo:** positivo (combina `CV20`, `CV21`, `CV23`, `CV24`, `CV25`, `CV26`, `CV27`, `CV29`, `CV31` e limites `VL22`, `VL26`, `VL27`, `VL29`).
- **Pré-condições:** base com os TCCs A a E; conexão com a internet ativa.
- **Entrada:**
  - Filtros (`5` critérios): Ano: `2025`; Autor: `"Marina Costa"`; Orientador: `"Profº Carlos Lima"`; Tag: `"IA"`; Coleção: `"Ciência da Computação"`.
  - Termo na barra de busca (`6º` critério): `"síntese"`.
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Selecionar os 5 filtros (Ano = `2025`, Autor = `"Marina Costa"`, Orientador = `"Carlos Lima"`, Tag = `"IA"`, Coleção = `"Ciência da Computação"`) com a barra de busca em branco e clicar em "Pesquisar".
  3. Inserir também o termo `"síntese"` na barra de pesquisa (totalizando os 6 critérios ativos simultaneamente) e clicar em "Pesquisar".
  4. Selecionar o TCC B listado e clicar no botão "Baixar Artigo".
- **Resultados esperados:**
  - Nos passos 2 (`5` critérios) e 3 (`6` critérios), o feed mostra apenas o TCC B (`1` resultado).
  - Ao abrir o TCC B, o sistema exibe suas informações e, no passo 4, conclui o download do arquivo `tcc_b.docx` (`DOCX`) para o dispositivo do usuário.

**CT20 - Buscar TCC no limite mínimo de ano da base (Ano = 2024) e baixar artigo em formato EPUB**
- **Objetivo:** Verificar a busca com `1` único filtro no valor limite mínimo de ano com TCC publicado na base (`Ano = 2024`, `VL21`) e o download de arquivo em formato `EPUB` (`CV32`).
- **Relacionamento:** RF#02, UC04, US#04. **Tipo:** positivo / limite (combina `CV20`, `CV22`, `CV23`, `CV28`, `CV32` e limites `VL21`, `VL24`, `VL29`).
- **Pré-condições:** base com os TCCs A a E; conexão com a internet ativa.
- **Entrada:** Ano: `2024` (demais filtros e barra de busca em branco).
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Selecionar apenas o filtro Ano = `2024` e clicar em "Pesquisar".
  3. Selecionar o TCC C listado e clicar no botão "Baixar Artigo".
- **Resultados esperados:**
  - O feed mostra apenas o TCC C (`2024/2`).
  - Ao selecionar o TCC C e clicar em "Baixar Artigo", o sistema realiza o download do arquivo `tcc_c.epub` (`EPUB`) para o dispositivo do usuário.

**CT21 - Buscar TCCs no limite superior inválido de ano (Ano = 2026) (FA01)**
- **Objetivo:** Verificar que a busca pelo ano imediatamente superior ao maior ano com TCCs publicados na base (`Ano = 2026`, `limite + 1`) retorna feed vazio com a mensagem do `FA01` (cobrindo isoladamente `CI16` no limite `VL23`).
- **Relacionamento:** RF#02, UC04 (FA01), US#04. **Tipo:** negativo / limite (`CI16`, `VL23`, `VL28`).
- **Pré-condições:** base com os TCCs A a E (nenhum TCC publicado em `2026`).
- **Entrada:** Ano: `2026`.
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Selecionar o filtro Ano = `2026` e clicar em "Pesquisar".
- **Resultados esperados:**
  - O sistema devolve um feed vazio e exibe: `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."`

**CT22 - Buscar TCCs por Autor sem trabalhos publicados (FA01)**
- **Objetivo:** Verificar que filtrar por um autor que não possui TCC publicado aciona o fluxo alternativo `FA01` (cobrindo isoladamente a classe inválida `CI17`).
- **Relacionamento:** RF#02, UC04 (FA01). **Tipo:** negativo (`CI17`, `VL28`).
- **Pré-condições:** base com os TCCs A a E (o autor `"Bruno Silva"` possui apenas o TCC E em status `RASCUNHO`).
- **Entrada:** Autor: `"Bruno Silva"`.
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Selecionar apenas o filtro Autor = `"Bruno Silva"` e clicar em "Pesquisar".
- **Resultados esperados:**
  - O sistema não retorna o TCC E (por estar em rascunho), devolve um feed vazio e exibe: `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."`

**CT23 - Buscar TCCs por Orientador sem trabalhos publicados (FA01)**
- **Objetivo:** Verificar que filtrar por um orientador que não possui TCC publicado aciona o fluxo alternativo `FA01` (cobrindo isoladamente a classe inválida `CI18`).
- **Relacionamento:** RF#02, UC04 (FA01), US#04. **Tipo:** negativo (`CI18`, `VL28`).
- **Pré-condições:** base com os TCCs A a E; professor `"Profº Roberto Dias"` sem nenhum TCC publicado.
- **Entrada:** Orientador: `"Profº Roberto Dias"`.
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Selecionar apenas o filtro Orientador = `"Profº Roberto Dias"` e clicar em "Pesquisar".
- **Resultados esperados:**
  - O sistema devolve um feed vazio e exibe: `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."`

**CT24 - Buscar TCCs por Tag sem trabalhos publicados (FA01)**
- **Objetivo:** Verificar que filtrar por uma tag temática que não está associada a nenhum TCC publicado aciona o fluxo alternativo `FA01` (cobrindo isoladamente a classe inválida `CI19`).
- **Relacionamento:** RF#02, UC04 (FA01), US#04. **Tipo:** negativo (`CI19`, `VL28`).
- **Pré-condições:** base com os TCCs A a E; nenhum TCC publicado possui a tag `"Compiladores"`.
- **Entrada:** Tag: `"Compiladores"`.
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Selecionar apenas o filtro Tag = `"Compiladores"` e clicar em "Pesquisar".
- **Resultados esperados:**
  - O sistema devolve um feed vazio e exibe: `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."`

**CT25 - Buscar TCCs por Coleção sem trabalhos publicados (FA01)**
- **Objetivo:** Verificar que filtrar por uma coleção sem TCCs publicados aciona o fluxo alternativo `FA01` (cobrindo isoladamente a classe inválida `CI20`).
- **Relacionamento:** RF#02, UC04 (FA01). **Tipo:** negativo (`CI20`, `VL28`).
- **Pré-condições:** base com os TCCs A a E; nenhum TCC publicado pertence à coleção `"Licenciatura em Computação"`.
- **Entrada:** Coleção: `"Licenciatura em Computação"`.
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Selecionar apenas o filtro Coleção = `"Licenciatura em Computação"` e clicar em "Pesquisar".
- **Resultados esperados:**
  - O sistema devolve um feed vazio e exibe: `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."`

**CT26 - Buscar TCCs com filtros individualmente válidos mas sem interseção simultânea (FA01)**
- **Objetivo:** Verificar que a aplicação simultânea (`AND`) de filtros que possuem TCCs publicados isoladamente, mas nenhum TCC em comum, resulta em feed vazio com a mensagem do `FA01` (cobrindo isoladamente a classe inválida `CI21`).
- **Relacionamento:** RF#02, UC04 (Passo 5 e FA01), US#04. **Tipo:** negativo (`CI21`, `VL25`, `VL28`).
- **Pré-condições:** base com os TCCs A a E (existe TCC publicado em `2024` — TCC C, com tag `Redes` — e existe TCC publicado com tag `IA` — TCC B, de `2025/1` —, mas nenhum TCC de `2024` com tag `IA`).
- **Entrada:** Ano: `2024`; Tag: `"IA"`.
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Selecionar os filtros Ano = `2024` e Tag = `"IA"` e clicar em "Pesquisar".
- **Resultados esperados:**
  - Como os filtros são aplicados simultaneamente, o sistema devolve um feed vazio e exibe: `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."`

---

## 5. Matriz de Cobertura (UC04)

| Classe de Equivalência / Valor Limite | Descrição resumida | Caso(s) de Teste que o cobrem |
|---|---|---|
| **CV20** | TCC com status `PUBLICADO` retornado na busca | CT03, CT05 (passo 4), **CT19**, **CT20** |
| **CV21** | Termo na barra de pesquisa com correspondência em TCC publicado | **CT19** |
| **CV22** | Barra de pesquisa em branco combinada com filtro(s) | CT03, CT05 (passo 4), **CT19** (passo 2), **CT20** |
| **CV23** | Filtro Ano com TCC(s) publicado(s) (`2024`, `2025`) | CT03 (`2025`), **CT19** (`2025`), **CT20** (`2024`) |
| **CV24** | Filtro Autor com TCC(s) publicado(s) | **CT19** |
| **CV25** | Filtro Orientador com TCC(s) publicado(s) | CT03, **CT19** |
| **CV26** | Filtro Tag com TCC(s) publicado(s) | CT03, CT05 (passo 4), **CT19** |
| **CV27** | Filtro Coleção com TCC(s) publicado(s) | **CT19** |
| **CV28** | `1` único critério ativo na pesquisa | CT05 (passo 4), **CT20** |
| **CV29** | Múltiplos critérios ativos simultaneamente (`AND`) com resultado | CT03 (`3` critérios), **CT19** (`5` e `6` critérios) |
| **CV30** | Download concluído de arquivo no formato `PDF` | CT06 (passo 4) |
| **CV31** | Download concluído de arquivo no formato `DOCX` | **CT19** (passo 4) |
| **CV32** | Download concluído de arquivo no formato `EPUB` | **CT20** (passo 3) |
| **CI14** | TCC em status `RASCUNHO` oculto da busca | CT03, CT05 (passo 4 e variação), **CT22** |
| **CI15** | Termo na barra de pesquisa sem correspondência (`FA01`) | CT05 (passo 3) |
| **CI16** | Filtro Ano sem TCCs publicados (`FA01`) | CT03 (variação `2023`), **CT21** (`2026`) |
| **CI17** | Filtro Autor sem TCCs publicados (`FA01`) | **CT22** |
| **CI18** | Filtro Orientador sem TCCs publicados (`FA01`) | **CT23** |
| **CI19** | Filtro Tag sem TCCs publicados (`FA01`) | **CT24** |
| **CI20** | Filtro Coleção sem TCCs publicados (`FA01`) | **CT25** |
| **CI21** | Múltiplos filtros válidos sem interseção simultânea (`FA01`) | **CT26** |
| **CI22** | Falha de conexão durante a transferência do arquivo (`FA02`) | CT06 (passo 3) |
| **VL20** | Ano na busca: `limite mínimo - 1` = `2023` | CT03 (variação) |
| **VL21** | Ano na busca: `limite mínimo` = `2024` (`máximo - 1`) | **CT20**, **CT26** |
| **VL22** | Ano na busca: `limite máximo` = `2025` (`mínimo + 1`) | CT03, **CT19** |
| **VL23** | Ano na busca: `limite máximo + 1` = `2026` | **CT21** |
| **VL24** | Quantidade de critérios ativos: `mínimo` = `1` critério | CT05 (passo 4), **CT20**–**CT25** |
| **VL25** | Quantidade de critérios ativos: `mínimo + 1` = `2` critérios | CT05 (passo 3), **CT26** |
| **VL26** | Quantidade de critérios ativos: `máximo - 1` = `5` critérios | **CT19** (passo 2) |
| **VL27** | Quantidade de critérios ativos: `máximo` = `6` critérios | **CT19** (passo 3) |
| **VL28** | Resultados no feed: `mínimo` = `0` trabalhos (`FA01`) | CT05 (passo 3), **CT21**–**CT26** |
| **VL29** | Resultados no feed: `mínimo + 1` = `1` trabalho | CT03, **CT19**, **CT20** |
| **VL30** | Resultados no feed: `> 1` = `3` trabalhos | CT05 (passo 4) |

---

## 6. Lacunas da Especificação (UC04)

1. **Busca com `0` critérios preenchidos (barra de pesquisa vazia e nenhum filtro selecionado):** O `UC04` não define o que ocorre se o usuário clicar em `"Pesquisar"` sem informar nenhum termo e sem selecionar nenhum filtro.
   - *Pergunta para o grupo:* Clicar em `"Pesquisar"` sem nenhum filtro ou termo ativo deve listar todos os TCCs com status `PUBLICADO` ou exibir um aviso solicitando ao menos um critério?
2. **Campos pesquisados e regras de comparação da barra de pesquisa (`termo: String`):** `US#04` menciona pesquisar o nome do orientador na barra de pesquisa e `CT05` pesquisa termos como `"blockchain"`, mas o relatório não define quais campos do TCC a barra textual consulta, nem se há diferenciação de maiúsculas/minúsculas, acentuação ou busca parcial (substring).
   - *Pergunta para o grupo:* A barra de pesquisa textual busca em quais atributos (`Título`, `Resumo`, `Autor`, `Orientador`, `Tags`) e deve ser insensível a maiúsculas/minúsculas e acentos?
3. **Ausência de `Coleções` e `Area` na classe `FiltroBusca`:** `RF#02` e `UC04` (Passo 2) definem o filtro `Coleções`, e `US#04` menciona filtrar por *"áreas de interesse"* (representada pela classe `Area` em `classes.png`), porém o DTO `FiltroBusca` em `classes.png` e o diagrama `atividades-uc04.png` possuem apenas `termo`, `ano`, `autor`, `orientador` e `tags`.
   - *Pergunta para o grupo:* O filtro `Coleções` do `UC04` corresponde à classe `Area` do Diagrama de Classes (devendo ser incluído em `FiltroBusca`), ou `Coleção` e `Área` são conceitos distintos?
4. **Seleção de múltiplas tags no mesmo filtro (`List<Tag>`) e filtro por Coorientador:** Em `TccRepository` há o método `buscarPorTags(tags: List<Tag>)`, mas o relatório não define se selecionar mais de uma tag exige que o TCC possua todas as tags (`AND`) ou qualquer uma delas (`OR`), nem se o filtro `Orientador` também retorna TCCs nos quais o docente é *coorientador*.
   - *Pergunta para o grupo:* Ao selecionar mais de uma tag no filtro, a busca aplica lógica `AND` ou `OR` entre as tags, e o filtro de `Orientadores` inclui coorientações?
5. **Comportamento do botão `"Baixar Artigo"` quando o TCC publicado não tem arquivo anexado (`ArquivoTcc 0..1`):** Pelo `UC01` (Passo 6: `"caso existente"`) e pelo Diagrama de Classes (`ArquivoTcc 0..1`), um TCC pode ser publicado apenas com o Link do LUME, sem arquivo anexado. Contudo, o `UC04` (Passo 8) prevê sempre o clique em `"Baixar Artigo"`.
   - *Pergunta para o grupo:* Quando um TCC publicado não possui arquivo anexado (`0` arquivos), o botão `"Baixar Artigo"` deve ficar oculto/desabilitado ou deve abrir o `Link do LUME`?
6. **Ordenação dos resultados da busca e limites do Feed de Destaques (`limite: int`, `dias: int`):** O relatório não define a ordem de apresentação dos TCCs retornados em `UC04` (Passo 5), nem os valores dos parâmetros `listarMaisRecentes(limite: int)` e `listarTagsMaisExploradas(dias: int)` de `TccService` (`RF#02`).
   - *Pergunta para o grupo:* Qual é o critério de ordenação do feed de resultados da busca (ex.: mais recentes primeiro) e quais são os valores padrão de `limite` e `dias` no feed inicial?

---

## 7. Comparação com `testes-funcionais-v1.md`

- **O que mudou na estrutura e organização:** Em `testes-funcionais-v2.md`, toda a análise (seções 1 a 6: condições de entrada, tabela de classes de equivalência com IDs `CV`/`CI`, tabela de análise de valor limite, novos casos de teste, matriz de cobertura e lacunas com perguntas objetivas) foi separada rigorosamente por funcionalidade (**UC01** e **UC04**), utilizando exatamente as colunas exigidas nos itens 2 e 3 e o formato de casos de teste de `CT01` a `CT06` (incluindo o campo `Objetivo`).
- **O que a versão 1 tinha de errado:**
  1. **Violação do critério de isolamento de classes inválidas:** Em `v1`, vários casos negativos misturavam múltiplas entradas inválidas ou múltiplos cenários independentes no mesmo caso de teste (por exemplo, `CT11` juntava Título vazio, Ano/Semestre vazio e Orientador vazio; `CT12` juntava Semestre `0`, Semestre `3` e `3` professores; `CT13` juntava formato inválido e `2` arquivos; `CT20` misturava buscas válidas e inválidas). Na `v2`, **cada caso de teste inválido exercita uma única classe inválida (`CI`)**, mantendo todas as demais entradas válidas.
  2. **Regras inventadas sem respaldo no relatório:** A `v1` criou classes de equivalência e testes para `Semestre = 0` e `Semestre = 3`, `> 2` professores e `> 1` arquivo como se a interface permitisse essas entradas e o relatório definisse mensagens de erro para elas. Na `v2`, usaram-se apenas regras definidas pelo relatório, movendo comportamentos não especificados para a **Seção 6 (Lacunas)** acompanhados de perguntas objetivas para o grupo.
- **O que a versão 1 tinha de faltante:** Faltava na `v1` a análise de valor limite explícita (`limite - 1`, `limite`, `limite + 1`) para o **Ano** na tabela de valores limite (tanto sob a restrição `"TCC já defendido"` em `UC01` quanto nos limites `[2024, 2025]` da base em `UC04`, com `2023`, `2024`, `2025` e `2026`), além de perguntas objetivas de decisão para cada lacuna identificada.

