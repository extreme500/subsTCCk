# Testes funcionais v1: classes de equivalência e análise de valor limite

Ampliação dos casos de teste CT01 a CT06 da Etapa 1 para as funcionalidades **Cadastrar TCC (RF#01 / UC01)** e **Buscar e Filtrar TCCs (RF#02 / UC04)**, aplicando particionamento em classes de equivalência (CE) e análise de valor limite (VL).

## 0. Fontes e convenções

Fontes usadas (somente as deste pacote): `contexto/relatorio-etapa1.md` (requisitos, US#01, US#04, UC01, UC04, CT01 a CT06) e os diagramas em `contexto/diagramas/` (classes, sequência do UC01, atividades do UC01 e do UC04, casos de uso, pacotes).

Cada regra usada para derivar classes e limites tem uma origem marcada:

- **R-xx (regra explícita):** está escrita no relatório ou nos diagramas, e a fonte é citada.
- **I-xx (inferência):** não está escrita literalmente, mas decorre de mais de uma fonte. A justificativa é dada e o caso que depende dela é sinalizado.
- **Lxx (lacuna):** o relatório não define a regra. Nenhum resultado esperado é inventado para ela: os casos afetados ficam na seção "Casos bloqueados por lacuna" com a pergunta que o grupo precisa responder.

Tipos de classe: **V** = válida; **I** = inválida; **?** = indefinida (depende de uma lacuna). No UC04, uma entrada válida que não encontra resultado leva ao FA01 ("feed vazio"); essas classes são marcadas como **V (FA01)**.

Os casos CT01 a CT06 continuam válidos e sem alteração. Os novos casos seguem a numeração a partir de CT07. Cada caso de teste parte de uma base limpa, salvo quando a pré-condição diz o contrário.

---

## 1. Cadastrar TCC (RF#01 / UC01)

### 1.1 Regras extraídas

| ID | Regra | Fonte |
|---|---|---|
| R-C01 | Só usuário autenticado com credenciais institucionais da UFRGS pode cadastrar e publicar; visitantes não têm permissão de escrita. | UC01 (pré-condições); seção 2.1 (restrição de acesso); atividades UC01 (começa com "Solicitar login" e "Autenticação e validação do acesso") |
| R-C02 | Título, Resumo e Tags são obrigatórios. Se faltar algum, o sistema não publica, mantém os dados, destaca os campos pendentes em vermelho e exibe "Preencha todos os campos obrigatórios". | UC01 FA01; CT04 |
| R-C03 | Coorientador é opcional. | UC01 passo 2; CT01 |
| R-C04 | O TCC tem de 1 a 2 professores associados (orientador e coorientador), logo o orientador é obrigatório. | Diagrama de classes (TCC 0..n — Professor 1..2); R-C03 |
| I-C01 | Ano/Semestre é obrigatório. Justificativa: é campo do formulário (UC01 passo 2), só o Coorientador é marcado "opcional", e `TCC.ano`/`TCC.semestre` não têm multiplicidade opcional no diagrama de classes. A lista de obrigatórios do FA01 é exemplificativa ("como Título, Resumo ou Tags"). | UC01 passos 2, 3 e FA01; diagrama de classes |
| I-C02 | Semestre assume os valores 1 ou 2 (formato AAAA/S). Justificativa: todos os exemplos usam /1 ou /2 (2025/2, 2025/1, 2024/2). O relatório não define a validação nem a mensagem para outros valores (L05). | CT01, CT03 |
| R-C05 | Tags: de 1 a 5 por TCC, escolhidas da lista sugerida ou digitadas como novas. A 6ª tag não é adicionada e o sistema avisa que o limite foi atingido. | UC01 passo 4; diagrama de classes (Tag 1..5); CT04 |
| R-C06 | Mídias: de 0 a 3 imagens. A 4ª não é adicionada e o sistema avisa que o limite foi atingido. | RF#01; UC01 passo 5; diagrama de classes (Midia 0..3); CT04 |
| R-C07 | Arquivo do trabalho: opcional, no máximo 1, nos formatos DOCX, PDF ou EPUB. | RF#01; UC01 passo 6 ("caso existente"); diagrama de classes (ArquivoTcc 0..1, FormatoArquivo) |
| R-C08 | A URL do LUME é exigida para publicar; sem ela, o trabalho pode ser salvo como rascunho. | UC01 (pré-condições) |
| R-C09 | A URL deve pertencer ao domínio do LUME e estar acessível. Se a verificação falhar (link quebrado, domínio incorreto ou servidor indisponível), ocorre o FA02: aviso "A URL informada não pertence ao domínio do LUME ou está inacessível. Deseja salvar como rascunho até que a publicação no LUME esteja homologada?". | UC01 passo 8 e FA02; UC03 (include); sequência UC01 |
| R-C10 | Formato de referência das URLs do LUME: `lume.ufrgs.br/handle/10183/NNNNNN`. O relatório não diz que a validação exige esse formato; ele é usado aqui só para montar os dados de teste. | Seção 2.2 (benchmark) |
| R-C11 | A validação dos campos obrigatórios acontece antes da verificação do link: se houver campo pendente, o link não é checado. | Atividades UC01 ("Preenchimento correto?" antes de "Requisitar checagem de URL"); sequência UC01 (`validarCamposObrigatorios()` antes de `validarIntegridadeLink`) |
| R-C12 | No FA02, se o aluno aceitar o rascunho: "Rascunho salvo com sucesso", status RASCUNHO, dados preservados, fora do feed e da busca. Se recusar: volta ao formulário com os dados mantidos. | UC01 FA02; CT02; atividades UC01 ("Deseja salvar como rascunho?" → não → volta ao preenchimento) |
| R-C13 | Publicação com sucesso: "TCC publicado com sucesso!", status PUBLICADO, TCC indexado e visível no feed e nos resultados de busca com suas tags. | UC01 passo 9 e pós-condição; CT01 |
| R-C14 | O TCC precisa já ter sido defendido (pré-condição). Como o sistema verifica isso não está definido (L03). | UC01 (pré-condições) |

### 1.2 Classes de equivalência

| Variável | ID | Classe | Tipo | Resultado esperado | Coberta por |
|---|---|---|---|---|---|
| Usuário | CE-C01 | Aluno formando autenticado com credenciais institucionais | V | Acessa o formulário e pode publicar | CT01, CT07 a CT19, CT21 |
| | CE-C02 | Visitante não autenticado | I | Não consegue cadastrar; o sistema exige login (R-C01) | CT20 |
| | CE-C03 | Professor autenticado tentando cadastrar | ? | Indefinido (L02) | Bloqueado B-C01 |
| Título | CE-C04 | Preenchido | V | Aceito | CT01 |
| | CE-C05 | Vazio | I | FA01 (R-C02) | CT13a, CT14 |
| | CE-C06 | Só espaços; acima de um tamanho máximo | ? | Indefinido (L04) | Bloqueado B-C02 |
| Resumo | CE-C07 | Preenchido | V | Aceito | CT01 |
| | CE-C08 | Vazio | I | FA01 (R-C02) | CT04, CT14, CT15 |
| | CE-C09 | Só espaços; acima de um tamanho máximo | ? | Indefinido (L04) | Bloqueado B-C02 |
| Ano/Semestre | CE-C10 | Ano/semestre de defesa já ocorrida, semestre 1 ou 2 | V | Aceito | CT01 (2025/2), CT07 (2025/1) |
| | CE-C11 | Vazio | I | FA01 (I-C01) | CT13c, CT14 |
| | CE-C12 | Semestre diferente de 1 e 2; ano/semestre futuro; ano muito antigo | ? | Indefinido (L05, L03) | Bloqueado B-C03 |
| Orientador | CE-C13 | Informado | V | Aceito | CT01 |
| | CE-C14 | Vazio | I | FA01 (R-C04) | CT13b, CT14 |
| | CE-C15 | Nome que não corresponde a professor cadastrado | ? | Indefinido (L06) | Bloqueado B-C04 |
| Coorientador | CE-C16 | Vazio | V | Aceito (R-C03) | CT01, CT07 |
| | CE-C17 | Informado, professor diferente do orientador | V | Aceito; exibido nos detalhes | CT08 |
| | CE-C18 | Igual ao orientador | ? | Indefinido (L06) | Bloqueado B-C04 |
| Link do LUME | CE-C19 | URL do domínio do LUME, item existente, LUME acessível | V | Link validado; publica (R-C13) | CT01, CT07 a CT10 |
| | CE-C20 | URL de outro domínio (inclusive domínios parecidos) | I | FA02 (R-C09) | CT02, CT18a, CT18b |
| | CE-C21 | URL do domínio do LUME com item inexistente (link quebrado) | I | FA02 (R-C09) | CT16 |
| | CE-C22 | URL correta, mas servidor do LUME indisponível | I | FA02 (R-C09) | CT17 |
| | CE-C23 | Texto sem formato de URL | I | Não publica; FA02 esperado ("domínio incorreto"), com ressalva em L08 | CT18c |
| | CE-C24 | Vazio | I | Não publica (R-C08); fluxo e mensagem indefinidos (L07) | CT19 |
| | CE-C25 | Variações de URL do LUME: `http` em vez de `https`, `www.`, página do LUME que não é um item, item de outro trabalho, link já usado por outro TCC | ? | Indefinido (L08) | Bloqueado B-C05 |
| Tags (quantidade) | CE-C26 | De 1 a 5 | V | Aceito | CT01, CT07 a CT10 |
| | CE-C27 | 0 | I | FA01 (R-C02) | CT12, CT14 |
| | CE-C28 | Mais de 5 | I | Tag excedente não é adicionada, com aviso de limite (R-C05) | CT04 |
| Tags (origem e conteúdo) | CE-C29 | Selecionada da lista sugerida | V | Aceita | CT01 |
| | CE-C30 | Nova, digitada pelo aluno | V | Aceita; o TCC é encontrado por ela (R-C13) | CT09 |
| | CE-C31 | Tag repetida, tag nova vazia, mesma tag com maiúsculas diferentes | ? | Indefinido (L09) | Bloqueado B-C06 |
| Mídias (quantidade) | CE-C32 | De 0 a 3 | V | Aceito | CT01, CT07 a CT10 |
| | CE-C33 | Mais de 3 | I | Imagem excedente não é adicionada, com aviso de limite (R-C06) | CT04 |
| Mídias (tipo) | CE-C34 | Imagem PNG | V | Aceita | CT01 |
| | CE-C35 | Outro formato de imagem, arquivo que não é imagem, imagem muito grande | ? | Indefinido (L11) | Bloqueado B-C07 |
| Arquivo do trabalho | CE-C36 | Nenhum arquivo | V | Aceito (R-C07) | CT07 |
| | CE-C37 | 1 arquivo PDF | V | Aceito | CT08 |
| | CE-C38 | 1 arquivo DOCX | V | Aceito | CT09 |
| | CE-C39 | 1 arquivo EPUB | V | Aceito | CT10 |
| | CE-C40 | 1 arquivo em formato fora de DOCX/PDF/EPUB | I | Não é associado ao TCC (R-C07); momento e mensagem indefinidos (L12) | CT21 |
| | CE-C41 | Mais de 1 arquivo; arquivo muito grande | ? | Indefinido (L12) | Bloqueado B-C08 |
| Resposta ao FA02 | CE-C42 | Aceitar rascunho | V | RASCUNHO, fora do feed e da busca (R-C12) | CT02, CT16 |
| | CE-C43 | Recusar rascunho | V | Volta ao formulário com dados mantidos (R-C12) | CT02 (variação), CT17 |
| Combinação de erros | CE-C44 | Campo obrigatório vazio e link inválido ao mesmo tempo | I | Só FA01; o link não é checado (R-C11) | CT15 |

### 1.3 Análise de valor limite

| Variável | Domínio válido | Valores testados | Resultado esperado | Caso |
|---|---|---|---|---|
| Quantidade de tags | 1 a 5 (R-C05) | 0 (mín−1) | FA01, campo Tags destacado | CT12 |
| | | 1 (mín) | Publica | CT07 |
| | | 2 (mín+1) | Publica | CT08 |
| | | 4 (máx−1) | Publica | CT09 |
| | | 5 (máx) | Publica | CT10, CT04 |
| | | 6 (máx+1) | 6ª tag não adicionada, aviso de limite | CT04 |
| Quantidade de imagens | 0 a 3 (R-C06) | 0 (mín) | Publica | CT07 |
| | | 1 (mín+1) | Publica | CT08 |
| | | 2 (máx−1) | Publica | CT09, CT01 |
| | | 3 (máx) | Publica | CT10, CT04 |
| | | 4 (máx+1) | 4ª imagem não adicionada, aviso de limite | CT04 |
| Quantidade de professores (orientador + coorientador) | 1 a 2 (R-C04) | 0 (mín−1) | FA01, Orientador destacado | CT13b |
| | | 1 (mín) | Publica | CT07, CT01 |
| | | 2 (máx) | Publica | CT08 |
| | | 3 (máx+1) | Não se aplica: o formulário só tem dois campos de professor | — |
| Quantidade de arquivos | 0 a 1 (R-C07) | 0 (mín) | Publica | CT07 |
| | | 1 (máx) | Publica | CT08, CT09, CT10 |
| | | 2 (máx+1) | Indefinido (L12) | B-C08 |
| Tamanho do Título | ≥ 1 caractere; máximo não definido | 0 | FA01 | CT13a |
| | | 1 | Publica (não há mínimo definido além de "preenchido"; ver L04) | CT11 |
| | | máximo e máximo+1 | Indefinido (L04) | B-C02 |
| Tamanho do Resumo | ≥ 1 caractere; máximo não definido | 0 | FA01 | CT04 |
| | | 1 | Publica (ver L04) | CT11 |
| | | máximo e máximo+1 | Indefinido (L04) | B-C02 |
| Semestre | 1 a 2 (I-C02) | 0 (mín−1) | Indefinido (L05) | B-C03 |
| | | 1 (mín) | Publica | CT07 |
| | | 2 (máx) | Publica | CT01 |
| | | 3 (máx+1) | Indefinido (L05) | B-C03 |
| Ano/semestre de defesa | Até o semestre atual, por ser TCC já defendido (R-C14) | semestre anterior ao atual | Publica | CT01 |
| | | semestre atual e semestre seguinte | Indefinido (L03, L05) | B-C03 |
| Domínio do link | Exatamente o domínio do LUME (`lume.ufrgs.br`) | `lume.ufrgs.br` | Publica | CT01 |
| | | `lume.ufrgs.br.exemplo.com` (domínio do LUME como prefixo de outro domínio) | FA02 | CT18a |
| | | `lume-ufrgs.br` (um caractere diferente) | FA02 | CT18b |
| | | `www.lume.ufrgs.br` | Indefinido (L08) | B-C05 |

### 1.4 Cobertura dos casos da Etapa 1

| Caso | Classes cobertas | Limites cobertos |
|---|---|---|
| CT01 | CE-C01, C04, C07, C10, C13, C16, C19, C26, C29, C32, C34 | 2 imagens; 1 professor; semestre 2 |
| CT02 | CE-C20, C42, C43 (variação) | — |
| CT04 | CE-C08, C28, C33 | 5 e 6 tags; 3 e 4 imagens; Resumo com 0 caractere |
| CT03, CT05, CT06 | Cobrem o UC04 (seção 2) | — |

Classes que a Etapa 1 não cobria e que os casos novos passam a cobrir: visitante (C02), Título/Ano/Orientador vazios (C05, C11, C14), coorientador informado (C17), link do LUME quebrado, LUME indisponível, texto sem formato de URL e link vazio (C21 a C24), zero tags (C27), tag nova (C30), cada formato de arquivo e arquivo inválido (C36 a C40) e a precedência do FA01 sobre o FA02 (C44).

### 1.5 Novos casos de teste do UC01

Em todos os casos, "dados de CT01" significa: Título "Detecção de anomalias em redes veiculares"; Resumo simplificado preenchido; Ano/Semestre 2025/2; Orientador Prof. Carlos Lima; Coorientador em branco; Link do LUME `https://lume.ufrgs.br/handle/10183/<handle-válido>` (item existente, preparado no ambiente de teste); Tags Redes, IA, Segurança; Mídias 2 imagens PNG; sem arquivo do trabalho. Pré-condição comum, salvo indicação: aluno autenticado com credenciais institucionais e LUME acessível.

**CT07 - Publicar com os limites inferiores das listas**

- **Relacionamento:** RF#01, UC01, US#01. **Tipo:** positivo / valor limite. **Classes:** CE-C10, C16, C26, C32, C36. **Limites:** 1 tag (mín), 0 imagem (mín), 1 professor (mín), 0 arquivo (mín), semestre 1 (mín).
- **Entrada:** dados de CT01, exceto: Ano/Semestre 2025/1; Tags: somente "Redes"; Mídias: nenhuma; Coorientador: em branco; Arquivo: nenhum.
- **Passos:** 1. Abrir "Cadastrar Novo TCC". 2. Preencher os dados. 3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O sistema exibe "TCC publicado com sucesso!".
  - O TCC fica com status PUBLICADO, aparece no feed e uma busca pela tag "Redes" o retorna.
  - A página do TCC mostra 1 tag e nenhuma imagem.

**CT08 - Publicar com valores logo acima do mínimo, coorientador e PDF**

- **Relacionamento:** RF#01, UC01, US#01. **Tipo:** positivo / valor limite. **Classes:** CE-C17, C37. **Limites:** 2 tags (mín+1), 1 imagem (mín+1), 2 professores (máx), 1 arquivo (máx).
- **Entrada:** dados de CT01, exceto: Tags "Redes" e "IA"; Mídias: 1 imagem PNG; Coorientador: Profª Ana Reis; Arquivo: `tcc.pdf`.
- **Passos:** 1. Abrir "Cadastrar Novo TCC". 2. Preencher os dados e anexar o PDF. 3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O sistema exibe "TCC publicado com sucesso!" e o status é PUBLICADO.
  - Os detalhes do TCC mostram orientador Prof. Carlos Lima, coorientador Profª Ana Reis, 2 tags e 1 imagem.
  - Na busca (UC04), "Baixar Artigo" salva o arquivo PDF no dispositivo.

**CT09 - Publicar com valores logo abaixo do máximo, tag nova e DOCX**

- **Relacionamento:** RF#01, UC01, US#01. **Tipo:** positivo / valor limite. **Classes:** CE-C30, C38. **Limites:** 4 tags (máx−1), 2 imagens (máx−1).
- **Entrada:** dados de CT01, exceto: Tags "Redes", "IA", "Segurança" (da lista sugerida) e "Veículos Autônomos" (digitada como nova); Arquivo: `tcc.docx`.
- **Passos:** 1. Abrir "Cadastrar Novo TCC". 2. Selecionar as 3 tags sugeridas e digitar a nova. 3. Preencher o restante e anexar o DOCX. 4. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O sistema exibe "TCC publicado com sucesso!" e o TCC fica com as 4 tags.
  - Uma busca pela tag "Veículos Autônomos" retorna o TCC (pós-condição: indexado "com suas tags").
  - "Baixar Artigo" salva o arquivo DOCX.

**CT10 - Publicar exatamente no máximo, sem exceder, com EPUB**

- **Relacionamento:** RF#01, UC01, US#01. **Tipo:** positivo / valor limite. **Classes:** CE-C39. **Limites:** 5 tags (máx), 3 imagens (máx).
- **Entrada:** dados de CT01, exceto: Tags "Redes", "IA", "Segurança", "Sistemas Distribuídos", "Engenharia de Software"; Mídias: 3 imagens PNG; Arquivo: `tcc.epub`.
- **Passos:** 1. Abrir "Cadastrar Novo TCC". 2. Preencher os dados. 3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - Nenhum aviso de limite é exibido durante o preenchimento.
  - O sistema exibe "TCC publicado com sucesso!"; o TCC tem 5 tags e 3 imagens.
  - "Baixar Artigo" salva o arquivo EPUB.
- **Diferença em relação ao CT04:** o CT04 chega a 5 tags e 3 imagens depois de tentar exceder o limite e passar pelo FA01; aqui o máximo é atingido diretamente.

**CT11 - Título e Resumo com 1 caractere**

- **Relacionamento:** RF#01, UC01. **Tipo:** valor limite. **Classes:** CE-C04, C07. **Limites:** Título e Resumo com 1 caractere (primeiro valor que satisfaz "preenchido").
- **Entrada:** dados de CT01, exceto: Título "X"; Resumo "Y".
- **Passos:** 1. Preencher os dados. 2. Clicar em "Publicar TCC".
- **Resultados esperados:** o sistema exibe "TCC publicado com sucesso!".
- **Observação:** o relatório só exige que os campos estejam preenchidos. Se o grupo definir um tamanho mínimo (L04), este caso passa a ser negativo e o valor limite muda.

**CT12 - Publicar sem nenhuma tag e depois com uma**

- **Relacionamento:** RF#01, UC01 (FA01), US#01. **Tipo:** negativo / valor limite. **Classes:** CE-C27, C26. **Limites:** 0 tag (mín−1) e 1 tag (mín).
- **Entrada:** dados de CT01, exceto: Tags: nenhuma.
- **Passos:** 1. Preencher os dados sem selecionar tags. 2. Clicar em "Publicar TCC". 3. Selecionar a tag "Redes". 4. Clicar novamente em "Publicar TCC".
- **Resultados esperados:**
  - No passo 2, o sistema não publica, destaca em vermelho o campo Tags e exibe "Preencha todos os campos obrigatórios"; os demais dados continuam preenchidos.
  - No passo 4, o fluxo volta ao passo 8 do UC01 e o sistema exibe "TCC publicado com sucesso!".

**CT13 - Um campo obrigatório vazio por vez**

- **Relacionamento:** RF#01, UC01 (FA01). **Tipo:** negativo. **Classes:** CE-C05, C14, C11.
- **Entrada:** dados de CT01, deixando em branco apenas o campo indicado em cada execução:

  | Execução | Campo em branco | Base da regra |
  |---|---|---|
  | CT13a | Título | R-C02 |
  | CT13b | Orientador | R-C04 (0 professor = mín−1) |
  | CT13c | Ano/Semestre | I-C01 (inferência) |

- **Passos:** 1. Preencher os dados, deixando o campo indicado em branco. 2. Clicar em "Publicar TCC". 3. Preencher o campo. 4. Clicar novamente em "Publicar TCC".
- **Resultados esperados:**
  - No passo 2, o sistema não publica, destaca em vermelho somente o campo em branco, exibe "Preencha todos os campos obrigatórios" e mantém os demais dados.
  - No passo 4, o TCC é publicado com "TCC publicado com sucesso!".
- **Observação:** CT13c depende da inferência I-C01; se o grupo decidir que Ano/Semestre é opcional, esta execução passa a ser positiva.

**CT14 - Todos os campos em branco**

- **Relacionamento:** RF#01, UC01 (FA01). **Tipo:** negativo. **Classes:** CE-C05, C08, C11, C14, C27.
- **Entrada:** formulário sem nenhum campo preenchido.
- **Passos:** 1. Abrir "Cadastrar Novo TCC". 2. Clicar em "Publicar TCC" sem preencher nada.
- **Resultados esperados:**
  - O sistema não publica e exibe "Preencha todos os campos obrigatórios".
  - Título, Resumo, Ano/Semestre, Orientador e Tags ficam destacados em vermelho; Coorientador, Mídias e Arquivo não ficam (são opcionais).
  - A checagem do link não é feita e a pergunta do FA02 não aparece (R-C11).
  - Nenhum TCC novo aparece no feed.

**CT15 - FA01 tem precedência sobre o FA02**

- **Relacionamento:** RF#01, UC01 (FA01, FA02). **Tipo:** negativo / combinação. **Classes:** CE-C44, C08, C20.
- **Entrada:** dados de CT01, exceto: Resumo em branco; Link do LUME `http://exemplo.com/tcc-123`.
- **Passos:** 1. Preencher os dados. 2. Clicar em "Publicar TCC". 3. Preencher o Resumo. 4. Clicar novamente em "Publicar TCC".
- **Resultados esperados:**
  - No passo 2, só aparece o FA01: Resumo destacado e "Preencha todos os campos obrigatórios". O aviso sobre a URL e a oferta de rascunho não aparecem.
  - No passo 4, os campos passam na validação, a checagem do link falha e o sistema exibe o aviso do FA02 com a oferta de rascunho.

**CT16 - Link do domínio do LUME para item inexistente**

- **Relacionamento:** RF#01, UC01 (FA02), UC03. **Tipo:** negativo. **Classes:** CE-C21, C42.
- **Entrada:** dados de CT01, exceto: Link do LUME `https://lume.ufrgs.br/handle/10183/<handle-inexistente>` (handle que não existe no LUME do ambiente de teste).
- **Passos:** 1. Preencher os dados. 2. Clicar em "Publicar TCC". 3. Selecionar "Salvar como rascunho".
- **Resultados esperados:**
  - No passo 2, o sistema não publica e exibe "A URL informada não pertence ao domínio do LUME ou está inacessível. Deseja salvar como rascunho até que a publicação no LUME esteja homologada?".
  - No passo 3, aparece "Rascunho salvo com sucesso"; o TCC fica com status RASCUNHO, dados preservados.
  - Uma busca pelo título do TCC (UC04) retorna "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."

**CT17 - LUME indisponível no momento da validação**

- **Relacionamento:** RF#01, UC01 (FA02), UC03. **Tipo:** exceção. **Classes:** CE-C22, C43.
- **Pré-condições:** aluno autenticado; o serviço do LUME está indisponível (simulado no ambiente de teste) no passo 2 e volta a responder antes do passo 5.
- **Entrada:** dados de CT01 (link válido).
- **Passos:** 1. Preencher os dados. 2. Clicar em "Publicar TCC". 3. Recusar o rascunho. 4. Restabelecer o serviço do LUME. 5. Clicar novamente em "Publicar TCC".
- **Resultados esperados:**
  - No passo 2, o sistema não publica e exibe o aviso do FA02.
  - No passo 3, o formulário volta com todos os dados mantidos; nenhum TCC é salvo como PUBLICADO.
  - No passo 5, o link é validado e o sistema exibe "TCC publicado com sucesso!".

**CT18 - Domínios parecidos com o do LUME e texto que não é URL**

- **Relacionamento:** RF#01, UC01 (FA02). **Tipo:** negativo / valor limite. **Classes:** CE-C20, C23.
- **Entrada:** dados de CT01, trocando apenas o link em cada execução:

  | Execução | Link informado | Motivo |
  |---|---|---|
  | CT18a | `https://lume.ufrgs.br.exemplo.com/handle/10183/<handle-válido>` | Começa com o domínio do LUME, mas o domínio real é outro |
  | CT18b | `https://lume-ufrgs.br/handle/10183/<handle-válido>` | Um caractere diferente do domínio do LUME |
  | CT18c | `lume ufrgs meu tcc` | Texto sem formato de URL |

- **Passos:** 1. Preencher os dados com o link da execução. 2. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - Em todas as execuções o TCC não é publicado e o sistema exibe o aviso do FA02 com a oferta de rascunho.
- **Observação:** em CT18c, a não publicação é certa. A mensagem do FA02 segue o UC01 ("domínio incorreto"), mas o diagrama de atividades fala em "Preencha todos os campos obrigatórios corretamente", o que deixa aberta a possibilidade de o formato ser checado no FA01 (L08).

**CT19 - Publicar sem link do LUME**

- **Relacionamento:** RF#01, UC01. **Tipo:** negativo. **Classes:** CE-C24.
- **Entrada:** dados de CT01, exceto: Link do LUME em branco.
- **Passos:** 1. Preencher os dados sem o link. 2. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O TCC não é publicado (R-C08): não recebe status PUBLICADO e não aparece no feed nem na busca.
  - Os dados digitados são mantidos.
- **Observação:** não está definido se o sistema trata o link vazio como campo obrigatório (FA01) ou como falha de verificação com oferta de rascunho (FA02) (L07). O verificador deve registrar qual mensagem apareceu.

**CT20 - Visitante tenta cadastrar TCC**

- **Relacionamento:** RF#01, UC01, seção 2.1. **Tipo:** negativo (acesso). **Classes:** CE-C02.
- **Pré-condições:** usuário não autenticado (visitante).
- **Passos:** 1. Tentar acessar a opção "Cadastrar Novo TCC" (ou a tela de cadastro diretamente).
- **Resultados esperados:**
  - O visitante não consegue preencher nem publicar um TCC; o sistema exige autenticação com credenciais institucionais antes da tela de cadastro (atividades UC01).
  - Nenhum TCC é criado.
- **Observação:** a mensagem exibida ao visitante não está definida (L01).

**CT21 - Arquivo do trabalho em formato não suportado**

- **Relacionamento:** RF#01, UC01. **Tipo:** negativo. **Classes:** CE-C40.
- **Entrada:** dados de CT01, exceto: Arquivo `tcc.odt`.
- **Passos:** 1. Preencher os dados. 2. Tentar anexar `tcc.odt`. 3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O arquivo `tcc.odt` não fica associado ao TCC: a página do TCC não oferece download de arquivo ODT (FormatoArquivo só admite DOCX, PDF e EPUB).
- **Observação:** não está definido se o arquivo é recusado no anexo ou na publicação, nem qual mensagem aparece (L12).

### 1.6 Casos bloqueados por lacuna (UC01)

Estes casos foram identificados pelos critérios, mas não têm resultado esperado porque o relatório não define a regra. Eles viram casos executáveis assim que o grupo responder à pergunta.

| ID | Classe / limite | Entrada sugerida | Pergunta a responder | Lacuna |
|---|---|---|---|---|
| B-C01 | CE-C03 | Professor autenticado abre "Cadastrar Novo TCC" | Professor pode cadastrar TCC? | L02 |
| B-C02 | CE-C06, C09; tamanho máx. de Título e Resumo | Título só com espaços; Título e Resumo com tamanho máximo e máximo+1 | Existe tamanho mínimo/máximo? Texto só com espaços conta como preenchido? | L04 |
| B-C03 | CE-C12; semestre 0 e 3; semestre atual e seguinte | Ano/Semestre 2025/0, 2025/3, semestre corrente, semestre seguinte, 1900/1 | Quais valores de ano e semestre são aceitos? Como o sistema verifica "já defendido"? | L03, L05 |
| B-C04 | CE-C15, C18 | Orientador com nome de quem não é professor cadastrado; coorientador igual ao orientador | Orientador é escolhido de lista ou digitado? Coorientador pode repetir o orientador? | L06 |
| B-C05 | CE-C25 | `http://lume.ufrgs.br/handle/10183/<válido>`, `https://www.lume.ufrgs.br/...`, página inicial do LUME, item válido de outro trabalho, link já usado por outro TCC | Quais variações de URL são aceitas? O sistema confere se o item do LUME corresponde ao TCC? | L08 |
| B-C06 | CE-C31 | Digitar "Redes" já selecionada; tag nova vazia; "redes" e "Redes" | Como tratar tags repetidas, vazias ou com maiúsculas diferentes? Há tamanho máximo do nome? | L09 |
| B-C07 | CE-C35 | Imagem JPG, GIF; arquivo PDF como mídia; imagem muito grande | Quais formatos e tamanhos de imagem são aceitos? | L11 |
| B-C08 | CE-C41; 2 arquivos (máx+1) | Anexar `tcc.pdf` e depois `tcc.docx`; arquivo muito grande | O segundo arquivo substitui o primeiro ou é recusado? Há tamanho máximo? | L12 |
| B-C09 | Texto do aviso de limite | 6ª tag, 4ª imagem | Qual é a mensagem exata do aviso de limite (CT04 diz só "avisa que o limite foi atingido")? | L10 |

---

## 2. Buscar e Filtrar TCCs (RF#02 / UC04)

### 2.1 Regras extraídas

| ID | Regra | Fonte |
|---|---|---|
| R-B01 | O ator é o Usuário Leitor: aluno pesquisador, professor ou visitante. O visitante pode buscar, consultar e baixar (modo leitura). | UC04 (ator principal); seção 2.1; diagrama de casos de uso; atividades UC04 |
| R-B02 | Critérios: termo na barra de busca e filtros Data/Ano, Autores, Orientadores, Assuntos/Tags e Coleções. | RF#02; UC04 passo 2. `FiltroBusca` tem termo, ano, autor, orientador e tags (sem coleção) |
| R-B03 | Os resultados atendem a todas as condições simultaneamente. | UC04 passo 5; atividades UC04; CT03 |
| R-B04 | Só aparecem TCCs com status PUBLICADO; rascunhos nunca. | UC04 (pré-condição); atividades UC04; CT03, CT05 |
| R-B05 | Sem resultado: feed vazio e "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."; o usuário ajusta os critérios e o fluxo volta ao passo 5. | UC04 FA01; CT05 |
| R-B06 | O termo encontra TCCs pelo título e pelo nome do orientador ("somente os seus trabalhos aparecerão"). | CT05 (variação: busca pelo título); US#04 (3º critério) |
| R-B07 | Ao selecionar um TCC, o sistema mostra as informações como preenchidas pelo autor (resumo, imagens, tags e trabalhos conexos). | UC04 passo 7; atividades UC04 |
| R-B08 | "Baixar Artigo" transfere o arquivo (DOCX, PDF ou EPUB) e o salva no dispositivo. | UC04 passos 8 e 9; atividades UC04 |
| R-B09 | Falha na transferência: mensagem "Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente.", nenhum arquivo incompleto salvo, página continua aberta e o usuário pode tentar de novo. | UC04 FA02; CT06; atividades UC04 |

### 2.2 Base de dados de teste (B2)

A base B2 estende a base do CT03 (mesmos TCCs A a E, com os mesmos ano/semestre, orientador, tag e status) com título, autor, arquivo e uma segunda tag para E. As colunas novas são dados de teste, não regras. Com B2, os resultados esperados de CT03 e CT05 não mudam.

| TCC | Título | Autor | Ano/Sem. | Orientador | Tags | Arquivo | Status |
|---|---|---|---|---|---|---|---|
| A | Roteamento adaptativo em redes de sensores | João Silva | 2025/1 | Profº Carlos Lima | Redes | PDF | Publicado |
| B | Classificação de imagens médicas com aprendizado profundo | Maria Souza | 2025/1 | Profº Carlos Lima | IA | DOCX | Publicado |
| C | Balanceamento de carga em redes definidas por software | Pedro Alves | 2024/2 | Profº Carlos Lima | Redes | EPUB | Publicado |
| D | Protocolos de consenso para redes móveis | Júlia Rocha | 2025/1 | Profª Ana Reis | Redes | PDF | Publicado |
| E | Monitoramento de tráfego urbano com visão computacional | Lucas Melo | 2025/1 | Profº Carlos Lima | Redes, Robótica | PDF | Rascunho |

Propriedades da base usadas nos limites: o menor ano com TCC publicado é 2024 (só C) e o maior é 2025 (A, B, D); "Robótica" e o autor "Lucas Melo" só aparecem no rascunho E; nenhum TCC tem coorientador.

### 2.3 Classes de equivalência

| Variável | ID | Classe | Tipo | Resultado esperado (base B2) | Coberta por |
|---|---|---|---|---|---|
| Usuário | CE-B01 | Usuário autenticado (aluno pesquisador ou professor) | V | Busca, abre e baixa | CT03, CT31 |
| | CE-B02 | Visitante não autenticado | V | Busca, abre e baixa (R-B01) | CT30 |
| Termo | CE-B03 | Vazio, com algum filtro selecionado | V | Aplica só os filtros | CT05 (passo 4), CT22 |
| | CE-B04 | Título exato de TCC publicado | V | Retorna esse TCC (R-B06) | CT28, CT29c |
| | CE-B05 | Nome de orientador | V | Retorna só os TCCs publicados desse orientador (R-B06) | CT29a, CT29b |
| | CE-B06 | Sem correspondência em nenhum TCC publicado | V (FA01) | Feed vazio e mensagem do FA01 | CT05 |
| | CE-B07 | Corresponde só a rascunho | V (FA01) | Feed vazio e mensagem do FA01 (R-B04) | CT05 (variação) |
| | CE-B08 | Parte do título, maiúsculas/minúsculas diferentes, sem acento, só espaços, nome de autor, trecho do resumo, nome de tag | ? | Indefinido (L14) | Bloqueado B-B01 |
| Ano | CE-B09 | Não selecionado | V | Não restringe | CT22, CT29 |
| | CE-B10 | Ano com TCC publicado | V | TCCs publicados daquele ano | CT03, CT23b, CT23c |
| | CE-B11 | Ano sem TCC publicado | V (FA01) | FA01 | CT03 (variação), CT23a, CT23d |
| | CE-B12 | Filtro por semestre; ano digitado inválido (texto, negativo) | ? | Indefinido (L16) | Bloqueado B-B02 |
| Autor | CE-B13 | Autor com TCC publicado | V | TCCs publicados do autor | CT25a, CT28 |
| | CE-B14 | Autor que só tem rascunho | V (FA01) | FA01 (R-B04) | CT25b |
| Orientador | CE-B15 | Orientador com TCC publicado | V | TCCs publicados do orientador | CT03, CT24, CT27 |
| | CE-B16 | Professor que é só coorientador; nome parcial ("Carlos Lima" × "Profº Carlos Lima"); orientador sem TCC publicado | ? | Indefinido (L18, L22) | Bloqueado B-B03 |
| Tags | CE-B17 | Uma tag presente em TCC publicado | V | TCCs publicados com a tag | CT05, CT22 |
| | CE-B18 | Uma tag presente só em rascunho | V (FA01) | FA01 (R-B04) | CT26 |
| | CE-B19 | Duas ou mais tags no mesmo filtro | ? | Indefinido: E ou OU (L17) | Bloqueado B-B04 |
| Coleções | CE-B20 | Qualquer valor | ? | Indefinido (L13) | Bloqueado B-B05 |
| Combinação de critérios | CE-B21 | Critérios com interseção não vazia | V | Só a interseção (R-B03) | CT03, CT24, CT28 |
| | CE-B22 | Cada critério tem resultados sozinho, mas a interseção é vazia | V (FA01) | FA01 (R-B03, R-B05) | CT27, CT28 (variação) |
| | CE-B23 | Nenhum critério (termo vazio e nenhum filtro) | ? | Indefinido (L15) | Bloqueado B-B06 |
| Status | CE-B24 | TCC em RASCUNHO que atende aos critérios | I (nunca listado) | Não aparece (R-B04) | CT03, CT05, CT24, CT25b, CT26, CT29b |
| Formato do arquivo baixado | CE-B25 | PDF | V | Arquivo PDF salvo | CT06 |
| | CE-B26 | DOCX | V | Arquivo DOCX salvo | CT30 |
| | CE-B27 | EPUB | V | Arquivo EPUB salvo | CT31 |
| | CE-B28 | TCC publicado sem arquivo | ? | Indefinido (L20) | Bloqueado B-B07 |
| Transferência | CE-B29 | Concluída | V | Arquivo salvo no dispositivo | CT30, CT31 |
| | CE-B30 | Interrompida | I | FA02 (R-B09) | CT06, CT32 |

### 2.4 Análise de valor limite

Os limites de ano são os da base B2 (menor e maior ano com TCC publicado), não regras do sistema. Os demais limites vêm de contagens (resultados, critérios, falhas).

| Variável | Valores testados | Resultado esperado | Caso |
|---|---|---|---|
| Ano (base B2: 2024 a 2025) | 2023 (menor−1) | FA01 | CT23a, CT03 (variação) |
| | 2024 (menor) | Só C | CT23b |
| | 2025 (maior) | A, B e D (E oculto) | CT23c |
| | 2026 (maior+1) | FA01 | CT23d |
| Quantidade de resultados | 0 | FA01 | CT05, CT23a |
| | 1 | Feed com 1 TCC | CT22, CT03 |
| | 2 | Feed com 2 TCCs | CT24 |
| | 3 | Feed com 3 TCCs | CT23c, CT05 (passo 4) |
| Quantidade de critérios ativos | 0 | Indefinido (L15) | B-B06 |
| | 1 (mín) | Aplica o critério | CT22 |
| | 2 | Interseção | CT24, CT27 |
| | 5 (todos os definidos em `FiltroBusca`) | Interseção de todos | CT28 |
| Critérios satisfeitos | todos menos um | FA01 | CT28 (variação) |
| | todos | Retorna o TCC | CT28 |
| Falhas seguidas de download | 0 | Download concluído na 1ª tentativa | CT30, CT31 |
| | 1 | FA02 e sucesso na 2ª tentativa | CT06 |
| | 2 | FA02 duas vezes e sucesso na 3ª tentativa | CT32 |
| Momento da falha na transferência | logo após o início; perto do fim | FA02 nos dois casos e nenhum arquivo incompleto salvo | CT32 |

### 2.5 Cobertura dos casos da Etapa 1

| Caso | Classes cobertas | Limites cobertos |
|---|---|---|
| CT03 | CE-B01, B10, B11 (variação), B15, B17, B21, B24 | 1 resultado; 3 critérios; ano 2023 (variação) |
| CT05 | CE-B03, B06, B07 (variação), B17, B24 | 0 e 3 resultados |
| CT06 | CE-B25, B30 | 1 falha de download |

Classes que a Etapa 1 não cobria e que os casos novos passam a cobrir: visitante (B02), termo com título exato e com nome de orientador (B04, B05), filtro por autor (B13, B14), tag só em rascunho (B18), interseção vazia de critérios válidos (B22), downloads DOCX e EPUB (B26, B27), além dos limites de ano, de 2 resultados, de 5 critérios e de falhas repetidas.

### 2.6 Novos casos de teste do UC04

Pré-condição comum: base B2 carregada; usuário autenticado como aluno pesquisador, salvo indicação. Passos comuns: acessar o menu e selecionar "Buscar TCC"; ao fim de cada busca, clicar em "Pesquisar".

**CT22 - Um único filtro com um único resultado**

- **Relacionamento:** RF#02, UC04, US#04. **Tipo:** positivo / valor limite. **Classes:** CE-B03, B09, B17. **Limites:** 1 critério (mín); 1 resultado.
- **Entrada:** Tag = "IA"; termo vazio; demais filtros não selecionados.
- **Passos:** 1. Selecionar Tag = "IA". 2. Clicar em "Pesquisar". 3. Selecionar o trabalho listado.
- **Resultados esperados:**
  - O feed mostra só o TCC B.
  - Ao abrir B, o sistema exibe resumo, imagens, tags e trabalhos conexos como preenchidos pelo autor.

**CT23 - Filtro de ano nos limites da base**

- **Relacionamento:** RF#02, UC04 (FA01). **Tipo:** valor limite. **Classes:** CE-B10, B11.
- **Entrada e resultados esperados** (só o filtro Ano selecionado):

  | Execução | Ano | Resultado esperado |
  |---|---|---|
  | CT23a | 2023 (menor−1) | Feed vazio e "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros." |
  | CT23b | 2024 (menor) | Só C |
  | CT23c | 2025 (maior) | A, B e D; E não aparece (rascunho) |
  | CT23d | 2026 (maior+1) | Feed vazio e mensagem do FA01 |

- **Passos:** 1. Selecionar o ano da execução. 2. Clicar em "Pesquisar".

**CT24 - Dois filtros com dois resultados**

- **Relacionamento:** RF#02, UC04. **Tipo:** positivo / valor limite. **Classes:** CE-B15, B21, B24. **Limites:** 2 critérios; 2 resultados.
- **Entrada:** Ano = 2025; Orientador = Profº Carlos Lima.
- **Passos:** 1. Selecionar os filtros. 2. Clicar em "Pesquisar".
- **Resultados esperados:** o feed mostra A e B. C não aparece (ano 2024) e E não aparece (rascunho).

**CT25 - Filtro por autor**

- **Relacionamento:** RF#02, UC04 (FA01). **Tipo:** positivo e negativo. **Classes:** CE-B13, B14, B24.
- **Entrada e resultados esperados:**

  | Execução | Autor | Resultado esperado |
  |---|---|---|
  | CT25a | João Silva | Só A |
  | CT25b | Lucas Melo (autor só do rascunho E) | FA01: feed vazio e mensagem "Nenhum trabalho encontrado..." |

- **Passos:** 1. Selecionar o autor da execução. 2. Clicar em "Pesquisar".

**CT26 - Tag presente só em rascunho**

- **Relacionamento:** RF#02, UC04 (FA01). **Tipo:** negativo. **Classes:** CE-B18, B24.
- **Entrada:** Tag = "Robótica".
- **Passos:** 1. Selecionar a tag. 2. Clicar em "Pesquisar".
- **Resultados esperados:** feed vazio e "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."; o TCC E não aparece.

**CT27 - Critérios válidos sem interseção e retorno ao passo 5**

- **Relacionamento:** RF#02, UC04 (FA01). **Tipo:** negativo / combinação. **Classes:** CE-B15, B22.
- **Entrada:** Orientador = Profª Ana Reis; Tag = "IA". (Sozinho, cada filtro tem resultado: Ana Reis → D; IA → B.)
- **Passos:** 1. Selecionar os dois filtros. 2. Clicar em "Pesquisar". 3. Remover o filtro Tag e clicar novamente em "Pesquisar".
- **Resultados esperados:**
  - No passo 2, feed vazio e mensagem do FA01, porque nenhum TCC atende às duas condições ao mesmo tempo.
  - No passo 3, o fluxo volta ao passo 5 do UC04 e o feed mostra só D.

**CT28 - Todos os critérios definidos ao mesmo tempo**

- **Relacionamento:** RF#02, UC04, US#04. **Tipo:** positivo e negativo / valor limite. **Classes:** CE-B04, B13, B21, B22. **Limites:** 5 critérios (todos os de `FiltroBusca`); "todos menos um" satisfeitos.
- **Entrada:** termo "Roteamento adaptativo em redes de sensores"; Ano = 2025; Autor = João Silva; Orientador = Profº Carlos Lima; Tag = "Redes".
- **Passos:** 1. Digitar o termo e selecionar os quatro filtros. 2. Clicar em "Pesquisar". 3. Trocar só o Autor para Maria Souza e clicar novamente em "Pesquisar".
- **Resultados esperados:**
  - No passo 2, o feed mostra só A.
  - No passo 3, feed vazio e mensagem do FA01 (A falha no autor; B, que é de Maria Souza, falha no termo e na tag).

**CT29 - Termo livre com nome de orientador e título**

- **Relacionamento:** RF#02, UC04, US#04. **Tipo:** positivo. **Classes:** CE-B04, B05, B09, B24.
- **Entrada e resultados esperados** (só o termo, sem filtros):

  | Execução | Termo | Resultado esperado |
  |---|---|---|
  | CT29a | Ana Reis | Só D (US#04: "somente os seus trabalhos aparecerão") |
  | CT29b | Carlos Lima | A, B e C; E não aparece (rascunho) |
  | CT29c | Balanceamento de carga em redes definidas por software | Só C |

- **Passos:** 1. Digitar o termo. 2. Clicar em "Pesquisar".
- **Observação:** os termos usam o nome do orientador sem o título "Profº/Profª", como no texto da US#04 e no passo 2 do CT03. Se o sistema exigir o nome exato do cadastro, ver L18.

**CT30 - Visitante busca, abre e baixa um TCC em DOCX**

- **Relacionamento:** RF#02, UC04, seção 2.1. **Tipo:** positivo. **Classes:** CE-B02, B26, B29.
- **Pré-condições:** base B2; usuário não autenticado (visitante); conexão estável.
- **Entrada:** Tag = "IA".
- **Passos:** 1. Selecionar "Buscar TCC". 2. Selecionar Tag = "IA" e clicar em "Pesquisar". 3. Abrir o TCC B. 4. Clicar em "Baixar Artigo".
- **Resultados esperados:**
  - O visitante consegue buscar sem se autenticar; o feed mostra só B.
  - Os detalhes de B são exibidos.
  - O download termina na primeira tentativa e o arquivo DOCX de B é salvo no dispositivo.

**CT31 - Download de TCC em EPUB**

- **Relacionamento:** RF#02, UC04. **Tipo:** positivo. **Classes:** CE-B01, B27, B29.
- **Pré-condições:** base B2; usuário autenticado como professor; conexão estável.
- **Entrada:** Ano = 2024.
- **Passos:** 1. Buscar com Ano = 2024. 2. Abrir o TCC C. 3. Clicar em "Baixar Artigo".
- **Resultados esperados:** o arquivo EPUB de C é salvo no dispositivo.

**CT32 - Falhas seguidas e em momentos diferentes da transferência**

- **Relacionamento:** RF#02, UC04 (FA02). **Tipo:** exceção / valor limite. **Classes:** CE-B30, B25. **Limites:** 2 falhas seguidas; falha logo após o início e perto do fim.
- **Pré-condições:** base B2; TCC A aberto; conexão controlada pelo ambiente de teste.
- **Passos:**
  1. Clicar em "Baixar Artigo" e interromper a conexão logo após o início da transferência.
  2. Restabelecer a conexão, clicar em "Baixar Artigo" e interromper a conexão perto do fim da transferência.
  3. Restabelecer a conexão e clicar em "Baixar Artigo".
- **Resultados esperados:**
  - Nos passos 1 e 2, o sistema exibe "Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente.", nenhum arquivo incompleto é salvo e a página de A continua aberta com "Baixar Artigo" disponível.
  - No passo 3, o download termina e o arquivo PDF de A é salvo no dispositivo.

### 2.7 Casos bloqueados por lacuna (UC04)

| ID | Classe / limite | Entrada sugerida | Pergunta a responder | Lacuna |
|---|---|---|---|---|
| B-B01 | CE-B08 | Termos "roteamento", "ROTEAMENTO ADAPTATIVO", "classificacao" (sem acento), "   ", "João Silva", trecho do resumo de A, "Robótica" | Que campos o termo pesquisa? A busca aceita trecho, ignora maiúsculas e acentos? Termo só com espaços conta como vazio? Há tamanho máximo? | L14 |
| B-B02 | CE-B12 | Filtrar por 2025/1; digitar "abc" ou "-1" no ano | O filtro é só por ano ou também por semestre? O ano é escolhido de lista ou digitado? | L16 |
| B-B03 | CE-B16 | Orientador = Profº Carlos Lima com um TCC em que ele é só coorientador; filtro com nome parcial; orientador sem TCC publicado | O filtro de orientador inclui coorientador? Aceita nome parcial? A lista mostra professores sem TCC publicado? | L18, L22 |
| B-B04 | CE-B19 | Tag = "Redes" e "IA" no mesmo filtro | Várias tags no mesmo filtro combinam por E ou por OU? | L17 |
| B-B05 | CE-B20 | Filtro Coleções com qualquer valor | O que é uma coleção? Ela corresponde à classe `Area`? Por que não está em `FiltroBusca`? | L13 |
| B-B06 | CE-B23; 0 critério | Clicar em "Pesquisar" sem termo e sem filtro | Lista todos os publicados, exige um critério ou cai no FA01? | L15 |
| B-B07 | CE-B28 | TCC publicado sem arquivo (como o do CT07) aberto na busca | O botão "Baixar Artigo" aparece? O que acontece ao clicar? | L20 |
| B-B08 | Ordem e quantidade de resultados | Busca que retorna A, B e D; base com muitos TCCs | Em que ordem o feed de resultados é apresentado? Há paginação ou limite? | L19 |
| B-B09 | Tentativas de download | 3 ou mais falhas seguidas | Há limite de novas tentativas? O download pode ser retomado de onde parou? | L21 |

---

## 3. Lacunas consolidadas

| ID | Funcionalidade | Lacuna | Onde aparece |
|---|---|---|---|
| L01 | UC01 | Mensagem exibida quando um visitante tenta cadastrar; sabe-se apenas que ele não tem permissão de escrita. | CT20 |
| L02 | UC01 | Professor autenticado pode cadastrar TCC? A seção 2.1 restringe a publicação a "usuários autenticados com credenciais institucionais", mas o diagrama de casos de uso liga o UC01 só ao Aluno Formando. | B-C01 |
| L03 | UC01 | Como o sistema verifica a pré-condição "TCC já defendido". | B-C03 |
| L04 | UC01 | Tamanho mínimo e máximo de Título e Resumo; tratamento de texto só com espaços. | CT11, B-C02 |
| L05 | UC01 | Obrigatoriedade de Ano/Semestre não é explícita (I-C01); valores válidos de ano e de semestre (I-C02) e tratamento de ano/semestre futuro. | CT13c, B-C03 |
| L06 | UC01 | Orientador e coorientador são escolhidos entre professores cadastrados ou digitados? (o modelo associa TCC a `Professor`, mas `TccDTO.orientador` é `String`). Coorientador pode ser igual ao orientador? | B-C04 |
| L07 | UC01 | Publicar sem link do LUME: segue o FA01 ou o FA02? Como salvar rascunho sem link fora do FA02? | CT19 |
| L08 | UC01 | Variações de URL aceitas (`http`, `www.`, página do LUME que não é item, item de outro trabalho, link repetido) e se o formato da URL é checado no FA01 ("preencha corretamente", atividades UC01) ou no FA02. | CT18c, B-C05 |
| L09 | UC01 | Tags repetidas, vazias, com maiúsculas diferentes e tamanho do nome. | B-C06 |
| L10 | UC01 | Texto exato do aviso de limite de tags e de imagens. | CT04, B-C09 |
| L11 | UC01 | Formatos e tamanho máximo das imagens de demonstração (os exemplos usam só PNG). | B-C07 |
| L12 | UC01 | Arquivo do trabalho: tamanho máximo, momento e mensagem de recusa de formato inválido, tentativa de anexar um segundo arquivo. | CT21, B-C08 |
| L13 | UC04 | O filtro "Coleções" aparece no RF#02 e no UC04, mas não em `FiltroBusca` nem no diagrama de atividades; o conceito não é definido (talvez corresponda a `Area`, citada em US#04 como "áreas de interesse"). | B-B05 |
| L14 | UC04 | Campos alcançados pelo termo além de título e orientador; correspondência parcial, maiúsculas, acentos, termo só com espaços e tamanho máximo. | B-B01 |
| L15 | UC04 | Resultado de "Pesquisar" sem termo e sem filtro. | B-B06 |
| L16 | UC04 | Filtro "Data/Ano": só ano ou também semestre; forma de entrada e valores inválidos. | B-B02 |
| L17 | UC04 | Vários valores no mesmo filtro (ex.: duas tags): E ou OU. `FiltroBusca.tags` é uma `String` única. | B-B04 |
| L18 | UC04 | Filtro e termo de orientador incluem coorientador? Aceitam nome parcial ou sem "Profº/Profª"? | CT29, B-B03 |
| L19 | UC04 | Ordem, paginação e limite dos resultados da busca. | B-B08 |
| L20 | UC04 | Download de TCC publicado sem arquivo (`ArquivoTcc` 0..1). | B-B07 |
| L21 | UC04 | Limite de novas tentativas de download e retomada de download parcial. | B-B09 |
| L22 | UC04 | As opções dos filtros (autores, orientadores, tags) incluem valores que só existem em rascunhos ou em nenhum TCC publicado? | B-B03 |


## 4. Resumo

| Funcionalidade | Classes (V / I / ?) | Casos da Etapa 1 | Casos novos | Casos bloqueados |
|---|---|---|---|---|
| Cadastrar TCC (UC01) | 44 classes: 19 V, 15 I, 10 ? | CT01, CT02, CT04 | CT07 a CT21 (15) | B-C01 a B-C09 (9) |
| Buscar e Filtrar TCCs (UC04) | 30 classes: 21 V (6 delas levam ao FA01), 2 I, 7 ? | CT03, CT05, CT06 | CT22 a CT32 (11) | B-B01 a B-B09 (9) |

Todas as classes válidas e inválidas têm pelo menos um caso que as cobre. As classes indefinidas (?) e os limites sem regra ficam nos casos bloqueados até o grupo resolver as lacunas da seção 3.
