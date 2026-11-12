# Testes funcionais v2: classes de equivalência e análise de valor limite

Esta versão substitui a v1 com critérios mais rígidos. Ela amplia os casos de teste CT01 a CT06 da Etapa 1 para **UC01 Cadastrar TCC (RF#01)** e **UC04 Buscar e Filtrar TCCs (RF#02)**.

Fontes: `contexto/relatorio-etapa1.md` e os diagramas da Etapa 1 (`contexto/diagramas/`, transcritos em `transcricao-diagramas.md`). Os diagramas fazem parte do relatório (seções 3.2.1.3 e 3.2.2) e só são citados quando o texto não basta.

Convenções:

- **CV** = classe válida, **CI** = classe inválida. A numeração é contínua entre as duas funcionalidades (UC01: CV01 a CV18 e CI01 a CI13; UC04: CV19 a CV38 e CI14 a CI21), para que cada ID seja único no documento.
- **L** = lacuna (seção 6). Uma entrada sem regra no relatório não gera classe nem resultado esperado.
- No UC04, uma busca que não encontra nada (FA01) é tratada como **classe inválida**, como no CT05 do relatório, que é classificado como "negativo".
- Os casos novos começam em CT07. Esta numeração é própria da v2 e não continua a da v1.

---

# Parte A: UC01 Cadastrar TCC (RF#01)

## A1. Condições de entrada

| # | Entrada / condição | O que o relatório define | Origem exata |
|---|---|---|---|
| A1.1 | Autenticação do usuário | Só usuário autenticado com credenciais institucionais da UFRGS cadastra; visitantes não têm permissão de escrita | UC01 pré-condições; seção 2.1 (Restrição de acesso); atividades UC01 ("Solicitar login", "Autenticação e validação do acesso") |
| A1.2 | TCC já defendido | É pré-condição; o relatório não diz como o sistema verifica | UC01 pré-condições → seção 6 (L03) |
| A1.3 | Título | Campo do formulário; obrigatório | RF#01; UC01 passo 2; UC01 FA01 ("como Título, Resumo ou Tags") |
| A1.4 | Resumo (simplificado) | Campo do formulário; obrigatório | RF#01; UC01 passo 2; UC01 FA01; US#01; CT04 |
| A1.5 | Ano/Semestre | Campo do formulário; formato usado nos exemplos: AAAA/S (2025/2). Obrigatoriedade, formato e faixa não são definidos | RF#01; UC01 passo 2; CT01, CT03 → seção 6 (L06, L07, L08) |
| A1.6 | Orientador | Campo do formulário; o TCC tem de 1 a 2 professores (orientador e coorientador), logo o orientador é obrigatório | RF#01; UC01 passo 2; diagrama de classes (TCC — Professor 1..2) |
| A1.7 | Coorientador | Opcional | RF#01; UC01 passo 2 ("Coorientador (opcional)"); CT01 ("coorientador em branco") |
| A1.8 | Link do LUME | Obrigatório para publicar; sem ele, pode ser rascunho. Deve pertencer ao domínio do LUME e estar acessível; a falha (link quebrado, domínio incorreto ou servidor indisponível) leva ao FA02 | RF#01; UC01 pré-condições; UC01 passos 6 e 8; UC01 FA02; CT02; UC03 (diagrama de casos de uso) |
| A1.9 | Tags: quantidade | No mínimo 1 (obrigatórias) e no máximo 5; a 6ª não é adicionada e o sistema avisa que o limite foi atingido | UC01 passo 4 ("até 5 tags"); UC01 FA01 (Tags obrigatórias); CT04; diagrama de classes (Tag 1..5) |
| A1.10 | Tags: origem | Selecionadas da lista sugerida ou digitadas como novas | UC01 passo 4; US#01 (2º critério) |
| A1.11 | Mídias (imagens) | De 0 a 3; a 4ª não é adicionada e o sistema avisa que o limite foi atingido. Formato e tamanho não são definidos | RF#01 ("até 3 imagens"); UC01 passo 5; US#01 (3º critério); CT04; diagrama de classes (Midia 0..3) |
| A1.12 | Arquivo do trabalho | Opcional ("caso existente"), no máximo 1, nos formatos docx, pdf ou epub | RF#01; UC01 passo 6; diagrama de classes (ArquivoTcc 0..1; FormatoArquivo = DOCX, PDF, EPUB) |
| A1.13 | Resposta à oferta de rascunho | "Salvar como rascunho" → rascunho; recusar → volta ao formulário com os dados mantidos | UC01 FA02; CT02 e sua variação; atividades UC01 ("Deseja salvar como rascunho?") |
| A1.14 | Status resultante | PUBLICADO (no feed e na busca) ou RASCUNHO (fora do feed e da busca) | UC01 passo 9 e pós-condição; UC01 FA02; CT01; CT02; diagrama de classes (StatusTcc) |

Regra de processamento usada nos resultados esperados: os campos obrigatórios são validados antes do link; com campo pendente, o link não é checado (UC01 passo 8; atividades UC01; diagrama de sequência UC01).

## A2. Classes de equivalência

| Condição de entrada | Classes válidas | Classes inválidas | Origem |
|---|---|---|---|
| Autenticação | CV01: aluno formando autenticado com credenciais institucionais | CI01: visitante não autenticado | UC01 pré-condições; seção 2.1 |
| Título | CV02: preenchido | CI02: vazio | UC01 passo 2; FA01 |
| Resumo | CV03: preenchido | CI03: vazio | UC01 passo 2; FA01; CT04 |
| Ano/Semestre | CV04: informado no formato dos exemplos (ex.: 2025/2) | — (não há regra que defina um valor inválido; ver L06 a L08) | RF#01; UC01 passo 2; CT01 |
| Orientador | CV05: informado | CI04: vazio | UC01 passo 2; diagrama de classes (Professor 1..2) |
| Coorientador | CV06: vazio; CV07: informado | — | UC01 passo 2; CT01 |
| Link do LUME | CV08: URL do domínio do LUME, existente e acessível | CI05: URL de outro domínio; CI06: URL do domínio do LUME com link quebrado (item inexistente); CI07: URL correta com servidor do LUME indisponível; CI08: link vazio ao publicar | UC01 pré-condições, passo 8, FA02; CT02 |
| Tags: quantidade | CV09: de 1 a 5 | CI09: nenhuma tag; CI10: mais de 5 | UC01 passo 4; FA01; CT04 |
| Tags: origem | CV10: da lista sugerida; CV11: nova, digitada | — | UC01 passo 4 |
| Mídias: quantidade | CV12: de 0 a 3 | CI11: mais de 3 | RF#01; UC01 passo 5; CT04 |
| Arquivo do trabalho | CV13: nenhum; CV14: 1 DOCX; CV15: 1 PDF; CV16: 1 EPUB | CI12: 1 arquivo em outro formato; CI13: mais de 1 arquivo | RF#01; UC01 passo 6; diagrama de classes (ArquivoTcc 0..1, FormatoArquivo) |
| Resposta à oferta de rascunho | CV17: salvar como rascunho; CV18: recusar | — | UC01 FA02; CT02 (variação) |

## A3. Análise de valor limite

| Condição | Limite | Valores a testar | Resultado esperado | Origem |
|---|---|---|---|---|
| Quantidade de tags | Mínimo 1 | 0 (mín − 1) | Não publica; FA01: "Preencha todos os campos obrigatórios", campo Tags em vermelho | UC01 FA01 |
| | | 1 (mín) | Publica: "TCC publicado com sucesso!" | UC01 passo 4 |
| | | 2 (mín + 1) | Publica | UC01 passo 4 |
| | Máximo 5 | 4 (máx − 1) | Publica | UC01 passo 4 |
| | | 5 (máx) | Publica | UC01 passo 4; CT04 |
| | | 6 (máx + 1) | A 6ª tag não é adicionada e o sistema avisa que o limite foi atingido | CT04 |
| Quantidade de imagens | Mínimo 0 | −1 | Não se aplica (quantidade negativa não existe) | — |
| | | 0 (mín) | Publica | RF#01 ("até 3"); diagrama de classes (0..3) |
| | | 1 (mín + 1) | Publica | RF#01 |
| | Máximo 3 | 2 (máx − 1) | Publica | RF#01; CT01 |
| | | 3 (máx) | Publica | RF#01; CT04 |
| | | 4 (máx + 1) | A 4ª imagem não é adicionada e o sistema avisa que o limite foi atingido | CT04 |
| Quantidade de professores (orientador + coorientador) | Mínimo 1, máximo 2 | 0 (mín − 1) | Não publica; FA01: "Preencha todos os campos obrigatórios", Orientador em vermelho | Diagrama de classes (1..2) |
| | | 1 (mín) | Publica | CT01 |
| | | 2 (máx) | Publica | UC01 passo 2 |
| | | 3 (máx + 1) | Não se aplica (o formulário só tem dois campos de professor) | UC01 passo 2 |
| Quantidade de arquivos | Mínimo 0, máximo 1 | 0 (mín) | Publica | UC01 passo 6 ("caso existente") |
| | | 1 (máx) | Publica | RF#01 |
| | | 2 (máx + 1) | O TCC não fica com mais de um arquivo associado | Diagrama de classes (ArquivoTcc 0..1) |
| Ano (Ano/Semestre) | Não definido | Nenhum valor pode ser derivado: o relatório não define formato, faixa aceita nem se ano/semestre futuro é recusado | — | Seção 6 (L06, L07, L08) |

## A4. Casos de teste novos (UC01)

**Dados de referência ("dados de CT01"):** Título "Detecção de anomalias em redes veiculares"; Resumo: texto simplificado preenchido; Ano/Semestre 2025/2; Orientador Prof. Carlos Lima; Coorientador em branco; Link do LUME: URL válida do repositório; Tags Redes, IA, Segurança (lista sugerida); Mídias: 2 imagens PNG; sem arquivo.

**Casos existentes reaproveitados:**

- **CT01** cobre CV01, CV02, CV03, CV04, CV05, CV06, CV08, CV09, CV10, CV12 e CV13, além dos valores 2 imagens, 1 professor e 0 arquivo.
- **CT02** cobre CI05 (URL de outro domínio) e, com a variação, CV17 e CV18.
- **CT04** atinge os valores 5 e 6 tags, 3 e 4 imagens e o Resumo vazio (CI03), mas junta três classes inválidas (CI03, CI10, CI11) em um caso. Pelo critério de uma classe inválida por caso, CT13, CT16 e CT17 isolam essas classes. O CT04 continua valendo como teste de regressão.

**CT07 - Publicar com o mínimo de tags e de imagens e arquivo PDF**

- **Objetivo:** verificar que o sistema publica um TCC com 1 tag, nenhuma imagem, só o orientador e arquivo PDF.
- **Relacionamento:** RF#01, UC01, US#01. **Tipo:** positivo.
- **Pré-condições:** aluno autenticado com credenciais institucionais; base com o link do TCC ativo no LUME.
- **Entrada:** dados de CT01, exceto:
  - Tags: Redes (1 tag, da lista sugerida)
  - Mídias: nenhuma
  - Arquivo: `tcc.pdf`
- **Passos:**
  1. Acessar o menu do perfil e selecionar "Cadastrar Novo TCC".
  2. Preencher os campos com os dados acima e anexar o PDF.
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O sistema valida os campos e o link e exibe "TCC publicado com sucesso!".
  - O TCC fica com status PUBLICADO e aparece no feed.
  - Uma busca pela tag "Redes" retorna o TCC, que mostra 1 tag e nenhuma imagem; "Baixar Artigo" salva o arquivo PDF.

**CT08 - Publicar com coorientador, tag nova e arquivo DOCX**

- **Objetivo:** verificar a publicação com valores logo acima do mínimo (2 tags, 1 imagem), dois professores, uma tag digitada e arquivo DOCX.
- **Relacionamento:** RF#01, UC01, US#01. **Tipo:** positivo.
- **Pré-condições:** aluno autenticado com credenciais institucionais; base com o link do TCC ativo no LUME.
- **Entrada:** dados de CT01, exceto:
  - Coorientador: Profª Ana Reis
  - Tags: Redes (da lista sugerida) e Veículos Autônomos (digitada como nova)
  - Mídias: 1 imagem PNG
  - Arquivo: `tcc.docx`
- **Passos:**
  1. Acessar o menu do perfil e selecionar "Cadastrar Novo TCC".
  2. Preencher os campos, selecionar "Redes", digitar "Veículos Autônomos" e anexar a imagem e o DOCX.
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O sistema exibe "TCC publicado com sucesso!" e o TCC fica com status PUBLICADO.
  - Os detalhes mostram orientador Prof. Carlos Lima, coorientador Profª Ana Reis, 2 tags e 1 imagem.
  - Uma busca pela tag "Veículos Autônomos" retorna o TCC; "Baixar Artigo" salva o arquivo DOCX.

**CT09 - Publicar com 4 tags, 3 imagens e arquivo EPUB**

- **Objetivo:** verificar a publicação com 4 tags (máximo − 1), 3 imagens (máximo) e arquivo EPUB.
- **Relacionamento:** RF#01, UC01, US#01. **Tipo:** positivo.
- **Pré-condições:** aluno autenticado com credenciais institucionais; base com o link do TCC ativo no LUME.
- **Entrada:** dados de CT01, exceto:
  - Tags: Redes, IA, Segurança, Sistemas Distribuídos (4 tags)
  - Mídias: 3 imagens PNG
  - Arquivo: `tcc.epub`
- **Passos:**
  1. Acessar o menu do perfil e selecionar "Cadastrar Novo TCC".
  2. Preencher os campos com os dados acima.
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - Nenhum aviso de limite aparece durante o preenchimento.
  - O sistema exibe "TCC publicado com sucesso!"; o TCC fica com status PUBLICADO, 4 tags e 3 imagens.
  - "Baixar Artigo" salva o arquivo EPUB.

**CT10 - Publicar com 5 tags, 3 imagens, coorientador e sem arquivo**

- **Objetivo:** verificar a publicação com o máximo de tags (5) atingido diretamente, sem tentativa de exceder, com tag nova e coorientador.
- **Relacionamento:** RF#01, UC01, US#01. **Tipo:** positivo.
- **Pré-condições:** aluno autenticado com credenciais institucionais; base com o link do TCC ativo no LUME.
- **Entrada:** dados de CT01, exceto:
  - Coorientador: Profª Ana Reis
  - Tags: Redes, IA, Segurança, Sistemas Distribuídos (lista sugerida) e Veículos Autônomos (digitada) (5 tags)
  - Mídias: 3 imagens PNG
  - Arquivo: nenhum
- **Passos:**
  1. Acessar o menu do perfil e selecionar "Cadastrar Novo TCC".
  2. Preencher os campos com os dados acima.
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - Nenhum aviso de limite aparece.
  - O sistema exibe "TCC publicado com sucesso!"; o TCC fica com status PUBLICADO, 5 tags e 3 imagens.
  - Uma busca por qualquer uma das 5 tags retorna o TCC.

**CT11 - Visitante tenta cadastrar TCC**

- **Objetivo:** verificar que um usuário não autenticado não consegue cadastrar TCC (CI01).
- **Relacionamento:** RF#01, UC01 (pré-condição), seção 2.1. **Tipo:** negativo.
- **Pré-condições:** usuário não autenticado (visitante).
- **Entrada:** nenhuma credencial.
- **Passos:**
  1. Tentar acessar a opção "Cadastrar Novo TCC".
- **Resultados esperados:**
  - O visitante não consegue preencher nem publicar um TCC; o sistema exige a autenticação institucional antes da tela de cadastro (atividades UC01).
  - Nenhum TCC é criado.
  - O relatório não define a mensagem exibida (L01).

**CT12 - Publicar sem Título**

- **Objetivo:** verificar o FA01 com o Título vazio (CI02).
- **Relacionamento:** RF#01, UC01 (FA01), US#01. **Tipo:** negativo.
- **Pré-condições:** aluno autenticado com credenciais institucionais.
- **Entrada:** dados de CT01, exceto: Título em branco.
- **Passos:**
  1. Abrir o formulário "Cadastrar Novo TCC" e preencher os dados.
  2. Clicar em "Publicar TCC".
  3. Preencher o Título e clicar novamente em "Publicar TCC".
- **Resultados esperados:**
  - No passo 2, o sistema não publica, destaca o Título em vermelho, exibe "Preencha todos os campos obrigatórios" e mantém os demais dados.
  - No passo 3, o fluxo volta ao passo 8 do UC01 e o sistema exibe "TCC publicado com sucesso!".

**CT13 - Publicar sem Resumo**

- **Objetivo:** verificar o FA01 com o Resumo vazio (CI03), isolado das outras classes inválidas do CT04.
- **Relacionamento:** RF#01, UC01 (FA01), US#01. **Tipo:** negativo.
- **Pré-condições:** aluno autenticado com credenciais institucionais.
- **Entrada:** dados de CT01, exceto: Resumo em branco.
- **Passos:**
  1. Abrir o formulário "Cadastrar Novo TCC" e preencher os dados.
  2. Clicar em "Publicar TCC".
  3. Preencher o Resumo e clicar novamente em "Publicar TCC".
- **Resultados esperados:**
  - No passo 2, o sistema não publica, destaca o Resumo em vermelho, exibe "Preencha todos os campos obrigatórios" e mantém os demais dados.
  - No passo 3, o sistema exibe "TCC publicado com sucesso!".

**CT14 - Publicar sem Orientador**

- **Objetivo:** verificar o FA01 com 0 professor informado (CI04; valor mín − 1).
- **Relacionamento:** RF#01, UC01 (FA01). **Tipo:** negativo.
- **Pré-condições:** aluno autenticado com credenciais institucionais.
- **Entrada:** dados de CT01, exceto: Orientador em branco (Coorientador também em branco).
- **Passos:**
  1. Abrir o formulário "Cadastrar Novo TCC" e preencher os dados.
  2. Clicar em "Publicar TCC".
  3. Informar o Orientador Prof. Carlos Lima e clicar novamente em "Publicar TCC".
- **Resultados esperados:**
  - No passo 2, o sistema não publica, destaca o Orientador em vermelho, exibe "Preencha todos os campos obrigatórios" e mantém os demais dados.
  - No passo 3, o sistema exibe "TCC publicado com sucesso!".

**CT15 - Publicar sem nenhuma tag**

- **Objetivo:** verificar o FA01 com 0 tag (CI09; valor mín − 1).
- **Relacionamento:** RF#01, UC01 (FA01), US#01. **Tipo:** negativo / limite.
- **Pré-condições:** aluno autenticado com credenciais institucionais.
- **Entrada:** dados de CT01, exceto: Tags: nenhuma.
- **Passos:**
  1. Abrir o formulário "Cadastrar Novo TCC" e preencher os dados sem selecionar tags.
  2. Clicar em "Publicar TCC".
  3. Selecionar a tag "Redes" e clicar novamente em "Publicar TCC".
- **Resultados esperados:**
  - No passo 2, o sistema não publica, destaca o campo Tags em vermelho, exibe "Preencha todos os campos obrigatórios" e mantém os demais dados.
  - No passo 3, o TCC é publicado com 1 tag e o sistema exibe "TCC publicado com sucesso!".

**CT16 - Tentar adicionar a 6ª tag**

- **Objetivo:** verificar que a 6ª tag não é adicionada (CI10; valor máx + 1), sem outras classes inválidas no caso.
- **Relacionamento:** RF#01, UC01 (passo 4), US#01. **Tipo:** limite / negativo.
- **Pré-condições:** aluno autenticado com credenciais institucionais; base com o link do TCC ativo no LUME.
- **Entrada:** dados de CT01, exceto: Tags Redes, IA, Segurança, Sistemas Distribuídos e Engenharia de Software (5 tags), mais uma 6ª tag "Robótica".
- **Passos:**
  1. Abrir o formulário e preencher os dados.
  2. Selecionar as 5 tags e tentar adicionar "Robótica".
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - No passo 2, "Robótica" não é adicionada e o sistema avisa que o limite foi atingido (o texto do aviso não é definido; L13).
  - No passo 3, o sistema exibe "TCC publicado com sucesso!" e o TCC fica com exatamente 5 tags, sem "Robótica".

**CT17 - Tentar anexar a 4ª imagem**

- **Objetivo:** verificar que a 4ª imagem não é anexada (CI11; valor máx + 1), sem outras classes inválidas no caso.
- **Relacionamento:** RF#01, UC01 (passo 5), US#01. **Tipo:** limite / negativo.
- **Pré-condições:** aluno autenticado com credenciais institucionais; base com o link do TCC ativo no LUME.
- **Entrada:** dados de CT01, exceto: Mídias: 3 imagens PNG, mais uma 4ª imagem PNG.
- **Passos:**
  1. Abrir o formulário e preencher os dados.
  2. Anexar as 3 imagens e tentar anexar a 4ª.
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - No passo 2, a 4ª imagem não é anexada e o sistema avisa que o limite foi atingido (texto não definido; L13).
  - No passo 3, o sistema exibe "TCC publicado com sucesso!" e o TCC fica com exatamente 3 imagens.

**CT18 - Anexar arquivo em formato não suportado**

- **Objetivo:** verificar que um arquivo fora de docx, pdf e epub não fica associado ao TCC (CI12).
- **Relacionamento:** RF#01, UC01 (passo 6). **Tipo:** negativo.
- **Pré-condições:** aluno autenticado com credenciais institucionais; base com o link do TCC ativo no LUME.
- **Entrada:** dados de CT01, exceto: Arquivo `tcc.odt`.
- **Passos:**
  1. Abrir o formulário e preencher os dados.
  2. Tentar anexar `tcc.odt`.
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O arquivo `tcc.odt` não fica associado ao TCC; a página do TCC não oferece download de arquivo ODT.
  - O relatório não define em que momento o arquivo é recusado nem a mensagem (L15).

**CT19 - Anexar dois arquivos do trabalho**

- **Objetivo:** verificar que o TCC não fica com mais de um arquivo (CI13; valor máx + 1).
- **Relacionamento:** RF#01, UC01 (passo 6). **Tipo:** limite / negativo.
- **Pré-condições:** aluno autenticado com credenciais institucionais; base com o link do TCC ativo no LUME.
- **Entrada:** dados de CT01, exceto: Arquivos `tcc.pdf` e `tcc.docx`.
- **Passos:**
  1. Abrir o formulário e preencher os dados.
  2. Anexar `tcc.pdf` e depois tentar anexar `tcc.docx`.
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O TCC publicado tem no máximo um arquivo associado.
  - O relatório não define se o segundo arquivo substitui o primeiro ou é recusado, nem a mensagem (L15).

**CT20 - Link do LUME quebrado**

- **Objetivo:** verificar o FA02 com URL do domínio do LUME que aponta para um item inexistente (CI06) e o salvamento como rascunho (CV17).
- **Relacionamento:** RF#01, UC01 (FA02). **Tipo:** negativo.
- **Pré-condições:** aluno autenticado com credenciais institucionais.
- **Entrada:** dados de CT01, exceto: Link do LUME `https://lume.ufrgs.br/handle/10183/<handle-inexistente>` (item que não existe no LUME do ambiente de teste).
- **Passos:**
  1. Abrir o formulário "Cadastrar Novo TCC" e preencher os dados.
  2. Clicar em "Publicar TCC".
  3. Na mensagem exibida, selecionar "Salvar como rascunho".
- **Resultados esperados:**
  - O sistema não publica e exibe o aviso: "A URL informada não pertence ao domínio do LUME ou está inacessível. Deseja salvar como rascunho até que a publicação no LUME esteja homologada?".
  - Após a confirmação, aparece "Rascunho salvo com sucesso".
  - O TCC fica com status RASCUNHO, com todos os dados preservados, e não aparece no feed nem nos resultados de busca.

**CT21 - Servidor do LUME indisponível**

- **Objetivo:** verificar o FA02 quando o link está correto mas o LUME não responde (CI07) e a recusa do rascunho (CV18).
- **Relacionamento:** RF#01, UC01 (FA02). **Tipo:** exceção.
- **Pré-condições:** aluno autenticado com credenciais institucionais; o serviço do LUME está indisponível (simulado) no passo 2 e volta a responder antes do passo 4.
- **Entrada:** dados de CT01 (link válido).
- **Passos:**
  1. Abrir o formulário "Cadastrar Novo TCC" e preencher os dados.
  2. Clicar em "Publicar TCC".
  3. Na mensagem exibida, recusar o rascunho.
  4. Com o LUME de volta, clicar novamente em "Publicar TCC".
- **Resultados esperados:**
  - No passo 2, o sistema não publica e exibe "A URL informada não pertence ao domínio do LUME ou está inacessível. Deseja salvar como rascunho até que a publicação no LUME esteja homologada?".
  - No passo 3, o formulário volta com os dados mantidos.
  - No passo 4, o link é validado e o sistema exibe "TCC publicado com sucesso!".

**CT22 - Publicar sem link do LUME**

- **Objetivo:** verificar que o TCC não é publicado sem a URL do LUME (CI08).
- **Relacionamento:** RF#01, UC01 (pré-condições). **Tipo:** negativo.
- **Pré-condições:** aluno autenticado com credenciais institucionais.
- **Entrada:** dados de CT01, exceto: Link do LUME em branco.
- **Passos:**
  1. Abrir o formulário "Cadastrar Novo TCC" e preencher os dados sem o link.
  2. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O TCC não recebe status PUBLICADO e não aparece no feed nem na busca ("A URL do LUME é exigida apenas para publicar").
  - O relatório não define se o sistema responde com o FA01 ou com o FA02, nem como salvar o rascunho sem link (L10). Registrar a mensagem exibida.

## A5. Matriz de cobertura (UC01)

**Classes**

| Classe | Descrição resumida | Caso(s) |
|---|---|---|
| CV01 | Aluno formando autenticado | CT01, CT07 a CT10 |
| CV02 | Título preenchido | CT01, CT07 a CT10 |
| CV03 | Resumo preenchido | CT01, CT07 a CT10 |
| CV04 | Ano/Semestre informado | CT01, CT07 a CT10 |
| CV05 | Orientador informado | CT01, CT07 a CT10 |
| CV06 | Coorientador vazio | CT01, CT07, CT09 |
| CV07 | Coorientador informado | CT08, CT10 |
| CV08 | Link do LUME válido e acessível | CT01, CT07 a CT10 |
| CV09 | De 1 a 5 tags | CT01, CT07 a CT10 |
| CV10 | Tag da lista sugerida | CT01, CT07 a CT10 |
| CV11 | Tag nova digitada | CT08, CT10 |
| CV12 | De 0 a 3 imagens | CT01, CT07 a CT10 |
| CV13 | Sem arquivo | CT01, CT10 |
| CV14 | Arquivo DOCX | CT08 |
| CV15 | Arquivo PDF | CT07 |
| CV16 | Arquivo EPUB | CT09 |
| CV17 | Salvar como rascunho | CT02, CT20 |
| CV18 | Recusar rascunho | CT02 (variação), CT21 |
| CI01 | Visitante não autenticado | CT11 |
| CI02 | Título vazio | CT12 |
| CI03 | Resumo vazio | CT13 (também CT04, combinado) |
| CI04 | Orientador vazio | CT14 |
| CI05 | URL de outro domínio | CT02 |
| CI06 | Link do LUME quebrado | CT20 |
| CI07 | LUME indisponível | CT21 |
| CI08 | Link vazio ao publicar | CT22 |
| CI09 | Nenhuma tag | CT15 |
| CI10 | Mais de 5 tags | CT16 (também CT04, combinado) |
| CI11 | Mais de 3 imagens | CT17 (também CT04, combinado) |
| CI12 | Arquivo em formato não suportado | CT18 |
| CI13 | Mais de 1 arquivo | CT19 |

**Valores limite**

| Condição | Valor | Caso(s) |
|---|---|---|
| Tags | 0 | CT15 |
| | 1 | CT07, CT15 (passo 3) |
| | 2 | CT08 |
| | 4 | CT09 |
| | 5 | CT10, CT16, CT04 |
| | 6 | CT16, CT04 |
| Imagens | 0 | CT07 |
| | 1 | CT08 |
| | 2 | CT01 |
| | 3 | CT09, CT10, CT17, CT04 |
| | 4 | CT17, CT04 |
| Professores | 0 | CT14 |
| | 1 | CT01, CT07, CT09 |
| | 2 | CT08, CT10 |
| Arquivos | 0 | CT01, CT10 |
| | 1 | CT07, CT08, CT09 |
| | 2 | CT19 |
| Ano | Nenhum valor derivável | Seção 6 (L06 a L08) |

---

# Parte B: UC04 Buscar e Filtrar TCCs (RF#02)

## B1. Condições de entrada

| # | Entrada / condição | O que o relatório define | Origem exata |
|---|---|---|---|
| B1.1 | Usuário leitor | Aluno pesquisador, professor ou visitante; o visitante usa o modo leitura (busca, consulta, download) | UC04 ator principal; seção 2.1 (Comunidade externa); diagrama de casos de uso; atividades UC04 |
| B1.2 | Termo da barra de busca | Opcional ("e/ou"); encontra pelo título (CT05 variação) e pelo nome do orientador (US#04) | UC04 passos 2 e 3; US#04 (3º critério); CT05 |
| B1.3 | Filtro Ano | Filtra pelo ano; ano sem TCC publicado leva ao FA01 | RF#02; UC04 passo 2 ("Data/Ano"); CT03 e sua variação |
| B1.4 | Filtro Autor | Filtra pelo autor | RF#02; UC04 passo 2 ("Autores") |
| B1.5 | Filtro Orientador | Filtra pelo orientador | RF#02; UC04 passo 2 ("Orientadores"); CT03 |
| B1.6 | Filtro Tags | Filtra por tag | RF#02; UC04 passo 2 ("Assuntos/Tags"); US#04; CT03; CT05 |
| B1.7 | Filtro Coleções | Citado, mas não definido (não está em `FiltroBusca` nem no diagrama de atividades) | RF#02; UC04 passo 2 → seção 6 (L16) |
| B1.8 | Combinação de critérios | Os resultados atendem a todas as condições ao mesmo tempo | UC04 passo 5; CT03; atividades UC04 |
| B1.9 | Status do TCC na base | Só TCCs PUBLICADOS aparecem; rascunhos nunca | UC04 pré-condição; atividades UC04; CT03; CT05 (variação) |
| B1.10 | Resultado vazio | FA01: "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."; ao redefinir, volta ao passo 5 | UC04 FA01; CT05 |
| B1.11 | Formato do arquivo baixado | DOCX, PDF ou EPUB | UC04 passos 8 e 9; atividades UC04 ("Transferir arquivo (DOCX, PDF ou EPUB)"); RF#01 |
| B1.12 | Transferência do arquivo | Concluída → arquivo salvo; interrompida → FA02: "Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente.", sem arquivo incompleto | UC04 passo 9; UC04 FA02; CT06 |

## B2. Classes de equivalência

| Condição de entrada | Classes válidas | Classes inválidas | Origem |
|---|---|---|---|
| Usuário leitor | CV19: aluno pesquisador; CV20: professor; CV21: visitante não autenticado | — (o relatório não define usuário impedido de buscar) | UC04 ator principal; seção 2.1 |
| Termo | CV22: vazio; CV23: título completo de TCC publicado; CV24: nome de orientador com TCC publicado | CI14: termo sem correspondência em nenhum TCC da base | UC04 passo 3; US#04; CT05 |
| Ano | CV25: não informado; CV26: ano com TCC publicado | CI15: ano sem nenhum TCC | UC04 passo 2; CT03 (variação) |
| Autor | CV27: não informado; CV28: autor com TCC publicado | CI16: autor sem nenhum TCC | RF#02; UC04 passo 2; FA01 |
| Orientador | CV29: não informado; CV30: orientador com TCC publicado | CI17: orientador sem nenhum TCC | RF#02; UC04 passo 2; FA01; CT03 |
| Tags | CV31: não informada; CV32: uma tag presente em TCC publicado | CI18: tag sem nenhum TCC | RF#02; UC04 passo 2; FA01; CT03 |
| Combinação de critérios | CV33: interseção não vazia | CI19: cada critério tem resultado isolado, mas a interseção é vazia | UC04 passo 5; FA01; CT03 |
| Status do TCC | CV34: PUBLICADO (listado) | CI20: único TCC que atende aos critérios está em RASCUNHO (não listado) | UC04 pré-condição; CT05 (variação) |
| Formato do arquivo | CV35: PDF; CV36: DOCX; CV37: EPUB | — | UC04 passo 9; atividades UC04 |
| Transferência | CV38: concluída | CI21: interrompida | UC04 passo 9; FA02; CT06 |

Observação: CI14, CI16, CI17 e CI18 usam valores que não existem em nenhum TCC da base, nem em rascunho. Assim, essas classes ficam separadas de CI20 e cada caso negativo cobre uma única classe inválida. O status não é digitado pelo usuário: é um dado da base.

## B3. Análise de valor limite

**Base de teste B2.** Ela estende a base do CT03 (mesmos TCCs A a E, com os mesmos ano/semestre, orientador, tag e status) com título, autor e arquivo. As colunas novas são dados de teste; CT03 e CT05 continuam com os mesmos resultados.

| TCC | Título | Autor | Ano/Sem. | Orientador | Tag | Arquivo | Status |
|---|---|---|---|---|---|---|---|
| A | Roteamento adaptativo em redes de sensores | João Silva | 2025/1 | Profº Carlos Lima | Redes | PDF | Publicado |
| B | Classificação de imagens médicas com aprendizado profundo | Maria Souza | 2025/1 | Profº Carlos Lima | IA | DOCX | Publicado |
| C | Balanceamento de carga em redes definidas por software | Pedro Alves | 2024/2 | Profº Carlos Lima | Redes | EPUB | Publicado |
| D | Protocolos de consenso para redes móveis | Júlia Rocha | 2025/1 | Profª Ana Reis | Redes | PDF | Publicado |
| E | Monitoramento de tráfego urbano com visão computacional | Lucas Melo | 2025/1 | Profº Carlos Lima | Redes | PDF | Rascunho |

Os limites de ano são os da base (menor ano com TCC publicado: 2024; maior: 2025), não uma faixa definida pelo sistema; a faixa aceita no filtro é lacuna (L19).

| Condição | Limite | Valores a testar | Resultado esperado | Origem |
|---|---|---|---|---|
| Filtro Ano | Menor ano com TCC publicado (2024) | 2023 (limite − 1) | FA01: "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros." | CT03 (variação); base B2 |
| | | 2024 (limite) | Só C | Base B2 |
| | | 2025 (limite + 1) | TCCs publicados de 2025 que atendem aos demais critérios | Base B2; CT03 |
| | Maior ano com TCC publicado (2025) | 2024 (limite − 1) | Só C | Base B2 |
| | | 2025 (limite) | TCCs publicados de 2025 que atendem aos demais critérios; E nunca aparece | Base B2; CT03 |
| | | 2026 (limite + 1) | FA01 com a mensagem acima | Base B2 |
| Quantidade de resultados | Fronteira do FA01 (0 resultado) | 0 (limite) | FA01 com a mensagem acima | UC04 FA01 |
| | | 1 (limite + 1) | Feed com 1 TCC | UC04 passo 5 |
| | | 2 (limite + 2) | Feed com 2 TCCs | UC04 passo 5 |
| Quantidade de critérios ativos | Mínimo 1, máximo 5 (termo, ano, autor, orientador, tags; Coleções fica fora por ser lacuna) | 0 (mín − 1) | Não definido → seção 6 (L18) | — |
| | | 1 (mín) | Aplica o critério | UC04 passo 3 ("e/ou") |
| | | 5 (máx) | Aplica todos simultaneamente | UC04 passo 5; diagrama de classes (`FiltroBusca`) |

## B4. Casos de teste novos (UC04)

Pré-condição comum: base B2 carregada.

**Casos existentes reaproveitados:**

- **CT03** (não especifica o tipo de usuário leitor) cobre CV22, CV26, CV27, CV30, CV32, CV33 e CV34, o ano 2025, 1 resultado e 3 critérios. A variação (Ano = 2023 e Tag = "Redes") cobre CI15 e o ano 2023.
- **CT05** cobre CI14 (termo "blockchain" com Tag = "Redes"). O passo 4 cobre CV22 e CV32 com 3 resultados. A variação (título do TCC E) cobre CI20.
- **CT06** cobre CV35 (PDF) e CI21 (transferência interrompida).

**CT23 - Visitante busca com todos os critérios e baixa PDF**

- **Objetivo:** verificar que um visitante busca com os 5 critérios definidos ao mesmo tempo, abre o TCC e baixa o arquivo PDF.
- **Relacionamento:** RF#02, UC04, US#04, seção 2.1. **Tipo:** positivo.
- **Pré-condições:** base B2; usuário não autenticado (visitante); conexão estável.
- **Entrada:** Termo: "Roteamento adaptativo em redes de sensores"; Ano: 2025; Autor: João Silva; Orientador: Profº Carlos Lima; Tag: Redes.
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Digitar o termo e selecionar os filtros Ano, Autor, Orientador e Tag.
  3. Clicar em "Pesquisar".
  4. Selecionar o trabalho listado.
  5. Clicar em "Baixar Artigo".
- **Resultados esperados:**
  - O visitante consegue buscar sem se autenticar; o feed mostra apenas o TCC A.
  - Ao abrir A, o sistema exibe as informações preenchidas pelo autor.
  - O download é concluído e o arquivo PDF de A é salvo no dispositivo.

**CT24 - Professor busca pelo nome do orientador e baixa DOCX**

- **Objetivo:** verificar a busca por termo com nome de orientador combinada com o filtro de ano, com 2 resultados, e o download de DOCX.
- **Relacionamento:** RF#02, UC04, US#04. **Tipo:** positivo.
- **Pré-condições:** base B2; usuário autenticado como professor; conexão estável.
- **Entrada:** Termo: "Carlos Lima"; Ano: 2025.
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Digitar "Carlos Lima" e selecionar Ano = 2025.
  3. Clicar em "Pesquisar".
  4. Selecionar o TCC B.
  5. Clicar em "Baixar Artigo".
- **Resultados esperados:**
  - O feed mostra apenas A e B: C não atende ao ano e E está em rascunho.
  - Ao abrir B, o sistema exibe as informações preenchidas pelo autor.
  - O download é concluído e o arquivo DOCX de B é salvo no dispositivo.

**CT25 - Aluno pesquisador filtra só pelo menor ano e baixa EPUB**

- **Objetivo:** verificar a busca com 1 critério (ano no limite inferior da base), com 1 resultado, e o download de EPUB.
- **Relacionamento:** RF#02, UC04. **Tipo:** positivo / limite.
- **Pré-condições:** base B2; usuário aluno pesquisador; conexão estável.
- **Entrada:** Ano: 2024 (termo vazio, demais filtros não selecionados).
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Selecionar Ano = 2024.
  3. Clicar em "Pesquisar".
  4. Selecionar o trabalho listado e clicar em "Baixar Artigo".
- **Resultados esperados:**
  - O feed mostra apenas o TCC C.
  - O download é concluído e o arquivo EPUB de C é salvo no dispositivo.

**CT26 - Filtrar por ano acima do maior ano da base**

- **Objetivo:** verificar o FA01 com ano sem nenhum TCC, acima do maior ano da base (CI15; valor 2026).
- **Relacionamento:** RF#02, UC04 (FA01). **Tipo:** negativo / limite.
- **Pré-condições:** base B2.
- **Entrada:** Ano: 2026.
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Selecionar Ano = 2026.
  3. Clicar em "Pesquisar".
- **Resultados esperados:**
  - O feed fica vazio e o sistema exibe "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."

**CT27 - Filtrar por autor sem TCC**

- **Objetivo:** verificar o FA01 com autor sem nenhum TCC na base (CI16).
- **Relacionamento:** RF#02, UC04 (FA01). **Tipo:** negativo.
- **Pré-condições:** base B2.
- **Entrada:** Autor: Rafael Nunes.
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Informar Autor = Rafael Nunes.
  3. Clicar em "Pesquisar".
- **Resultados esperados:**
  - O feed fica vazio e o sistema exibe "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."
  - Se o filtro só oferecer autores existentes e o valor não puder ser informado, registrar o comportamento (L20).

**CT28 - Filtrar por orientador sem TCC**

- **Objetivo:** verificar o FA01 com orientador sem nenhum TCC na base (CI17).
- **Relacionamento:** RF#02, UC04 (FA01), US#04. **Tipo:** negativo.
- **Pré-condições:** base B2.
- **Entrada:** Orientador: Profº Bruno Dias.
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Informar Orientador = Profº Bruno Dias.
  3. Clicar em "Pesquisar".
- **Resultados esperados:**
  - O feed fica vazio e o sistema exibe "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."
  - Se o filtro só oferecer orientadores com TCC e o valor não puder ser informado, registrar o comportamento (L20).

**CT29 - Filtrar por tag sem TCC**

- **Objetivo:** verificar o FA01 com tag sem nenhum TCC na base (CI18).
- **Relacionamento:** RF#02, UC04 (FA01), US#04. **Tipo:** negativo.
- **Pré-condições:** base B2.
- **Entrada:** Tag: Robótica.
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Informar Tag = "Robótica".
  3. Clicar em "Pesquisar".
- **Resultados esperados:**
  - O feed fica vazio e o sistema exibe "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."
  - Se o filtro só oferecer tags com TCC e o valor não puder ser informado, registrar o comportamento (L20).

**CT30 - Critérios válidos sem interseção**

- **Objetivo:** verificar o FA01 quando cada critério tem resultado sozinho, mas nenhum TCC atende aos dois (CI19), e o retorno ao passo 5 depois do ajuste.
- **Relacionamento:** RF#02, UC04 (FA01). **Tipo:** negativo.
- **Pré-condições:** base B2. Sozinho, Orientador = Profª Ana Reis retorna D, e Tag = "IA" retorna B.
- **Entrada:** Orientador: Profª Ana Reis; Tag: IA.
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Selecionar Orientador = Profª Ana Reis e Tag = "IA".
  3. Clicar em "Pesquisar".
  4. Remover o filtro Tag e clicar novamente em "Pesquisar".
- **Resultados esperados:**
  - No passo 3, o feed fica vazio e o sistema exibe "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."
  - No passo 4, o fluxo volta ao passo 5 do UC04 e o feed mostra apenas o TCC D.

## B5. Matriz de cobertura (UC04)

**Classes**

| Classe | Descrição resumida | Caso(s) |
|---|---|---|
| CV19 | Aluno pesquisador | CT25 |
| CV20 | Professor | CT24 |
| CV21 | Visitante | CT23 |
| CV22 | Termo vazio | CT03, CT05 (passo 4), CT25 |
| CV23 | Termo = título de TCC publicado | CT23 |
| CV24 | Termo = nome de orientador | CT24 |
| CV25 | Ano não informado | CT05, CT30 |
| CV26 | Ano com TCC publicado | CT03, CT23, CT24, CT25 |
| CV27 | Autor não informado | CT03, CT24, CT25 |
| CV28 | Autor com TCC publicado | CT23 |
| CV29 | Orientador não informado | CT24, CT25 |
| CV30 | Orientador com TCC publicado | CT03, CT23, CT30 (passo 4) |
| CV31 | Tag não informada | CT24, CT25 |
| CV32 | Tag com TCC publicado | CT03, CT05 (passo 4), CT23 |
| CV33 | Interseção não vazia | CT03, CT23, CT24 |
| CV34 | TCC PUBLICADO listado | CT03, CT23, CT24, CT25 |
| CV35 | Download PDF | CT06, CT23 |
| CV36 | Download DOCX | CT24 |
| CV37 | Download EPUB | CT25 |
| CV38 | Transferência concluída | CT23, CT24, CT25, CT06 (passo 4) |
| CI14 | Termo sem correspondência | CT05 |
| CI15 | Ano sem TCC | CT03 (variação), CT26 |
| CI16 | Autor sem TCC | CT27 |
| CI17 | Orientador sem TCC | CT28 |
| CI18 | Tag sem TCC | CT29 |
| CI19 | Interseção vazia | CT30 |
| CI20 | Só rascunho atende aos critérios | CT05 (variação) |
| CI21 | Transferência interrompida | CT06 |

**Valores limite**

| Condição | Valor | Caso(s) |
|---|---|---|
| Ano | 2023 | CT03 (variação) |
| | 2024 | CT25 |
| | 2025 | CT03, CT23, CT24 |
| | 2026 | CT26 |
| Quantidade de resultados | 0 | CT05, CT26 a CT30 |
| | 1 | CT03, CT23, CT25 |
| | 2 | CT24 |
| Quantidade de critérios | 0 | Seção 6 (L18) |
| | 1 | CT25, CT26 a CT29 |
| | 5 | CT23 |

---

# 6. Lacunas

Entradas cujo comportamento o relatório não define. Nenhuma delas gerou classe nem resultado esperado; cada uma tem uma pergunta para o grupo decidir.

## UC01 Cadastrar TCC

| ID | Entrada | Pergunta para o grupo |
|---|---|---|
| L01 | Visitante na tela de cadastro (CT11) | O sistema redireciona para o login ou exibe uma mensagem? Qual é o texto? |
| L02 | Professor autenticado | Um professor pode cadastrar TCC? (A seção 2.1 fala em "usuários autenticados com credenciais institucionais", mas o diagrama de casos de uso liga o UC01 só ao Aluno Formando.) |
| L03 | TCC já defendido | O sistema verifica que o TCC foi defendido? Com qual dado (ano/semestre, data da banca, link do LUME) e com qual mensagem se não foi? |
| L04 | Tamanho do Título | Qual é o tamanho mínimo e máximo do Título? Título só com espaços conta como preenchido? |
| L05 | Tamanho do Resumo | Qual é o tamanho mínimo e máximo do Resumo simplificado? Resumo só com espaços conta como preenchido? |
| L06 | Obrigatoriedade de Ano/Semestre | Ano/Semestre é obrigatório? Se for, deixá-lo em branco leva ao FA01? |
| L07 | Formato do ano/semestre | O campo é um só (AAAA/S) ou são dois (ano e semestre)? Quais valores de semestre são aceitos (só 1 e 2)? |
| L08 | Faixa de anos aceita | Qual é o menor ano aceito? Ano/semestre atual ou futuro é aceito? Qual mensagem para valor fora da faixa? |
| L09 | Orientador e coorientador | São escolhidos entre professores cadastrados ou digitados livremente? (O modelo associa o TCC a `Professor`, mas `TccDTO.orientador` é `String`.) O coorientador pode ser igual ao orientador? |
| L10 | Link vazio (CT22) | Publicar sem link leva ao FA01 ou ao FA02? Como o aluno salva um rascunho sem link, se o UC01 só oferece rascunho no FA02? |
| L11 | Formato do link | Texto sem formato de URL leva ao FA01 ("preencha corretamente", atividades UC01) ou ao FA02? São aceitos `http`, `www.lume.ufrgs.br`, página do LUME que não é item, item de outro trabalho e link já usado por outro TCC? |
| L12 | Conteúdo das tags | Como tratar tag repetida, tag nova vazia e a mesma tag com maiúsculas diferentes? Há tamanho máximo do nome? |
| L13 | Aviso de limite (CT16, CT17) | Qual é o texto exato do aviso de limite de tags e de imagens? |
| L14 | Formato e tamanho das imagens | Quais formatos de imagem são aceitos (os exemplos usam só PNG)? Há tamanho máximo? |
| L15 | Arquivo do trabalho (CT18, CT19) | Formato não suportado é recusado ao anexar ou ao publicar, e com qual mensagem? Um segundo arquivo substitui o primeiro ou é recusado? Há tamanho máximo? |

## UC04 Buscar e Filtrar TCCs

| ID | Entrada | Pergunta para o grupo |
|---|---|---|
| L16 | Filtro Coleções | O que é uma coleção? Ela corresponde a `Area`? Por que não aparece em `FiltroBusca` nem no diagrama de atividades? Se não for implementada, deve sair do RF#02 e do UC04. |
| L17 | Termo de busca | Além de título e orientador, o termo pesquisa autor, resumo e tags? Aceita parte do título? Ignora maiúsculas e acentos? Há tamanho máximo? Termo só com espaços conta como vazio? |
| L18 | Pesquisar sem nenhum critério | Clicar em "Pesquisar" sem termo e sem filtro lista todos os publicados, exige um critério ou leva ao FA01? |
| L19 | Formato e faixa do filtro Ano | O ano é escolhido de uma lista ou digitado? Filtra também por semestre ("Data/Ano")? Qual faixa é aceita e o que acontece com valor inválido (texto, negativo)? |
| L20 | Forma de entrada dos filtros Autor, Orientador e Tags (CT27 a CT29) | Os valores são digitados ou escolhidos em lista? A lista mostra valores sem TCC publicado? |
| L21 | Vários valores no mesmo filtro | Duas tags (ou dois orientadores) no mesmo filtro combinam por E ou por OU? (`FiltroBusca.tags` é uma `String` única.) |
| L22 | Orientador × coorientador | O filtro e o termo de orientador também encontram TCCs em que o professor é coorientador? O nome precisa incluir "Profº/Profª"? |
| L23 | Ordem dos resultados | Em que ordem o feed de resultados é apresentado? Há paginação ou limite? |
| L24 | TCC publicado sem arquivo | O botão "Baixar Artigo" aparece para um TCC sem arquivo (ArquivoTcc 0..1)? O que acontece ao clicar? |
| L25 | Novas tentativas de download | Há limite de novas tentativas? O download pode ser retomado de onde parou? |

---

# 7. Comparação com testes-funcionais-v1.md

- **Inferências viraram lacunas.** A v1 deduziu que Ano/Semestre é obrigatório e que o semestre só pode ser 1 ou 2, e afirmou que um Título de 1 caractere seria aceito. O relatório não define nada disso. Na v2, esses pontos estão em L04 a L08 e os casos que dependiam deles (v1 CT11 e CT13c) foram retirados.
- **Uma classe inválida por caso.** Os casos da v1 que juntavam classes inválidas foram desfeitos: CT14 (todos os campos vazios) e CT15 (campo vazio e link inválido juntos). O CT04 do relatório, que junta três classes inválidas, ganhou casos isolados (CT13, CT16, CT17).
- **Valores limite sem regra foram retirados.** A v1 testava domínios parecidos com o do LUME, o momento da falha do download e duas falhas seguidas, mas o relatório não define limites para nada disso. Texto sem formato de URL virou a lacuna L11.
- **Classes do UC04.** A v1 chamava de "válidas" as buscas sem resultado. A v2 as trata como inválidas, coerente com o CT05 ("negativo"). A v1 também testava valores que só existiam em rascunho, o que misturava a classe do filtro com a do status; a v2 separa as duas (CI16 a CI18 × CI20).
- **O que faltava na v1:** o campo Objetivo nos casos; uma lista de condições de entrada com origem exata (RF, UC e passo, FA, US, CT); IDs no padrão CV/CI; e uma matriz que ligasse cada classe e cada valor limite a um caso. Faltavam ainda a classe "mais de um arquivo" (CI13, CT19), a linha do ano no UC01, registrada como sem limite derivável, e casos válidos com mais classes combinadas (CT23 usa os 5 critérios com visitante e download).
