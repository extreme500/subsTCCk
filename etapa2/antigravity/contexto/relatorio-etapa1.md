# Relatório da Etapa 1: Tornar TCCs de computação visíveis, relacionados e úteis

Trabalho prático de INF01127 (Engenharia de Software), Instituto de Informática da UFRGS. Este texto reproduz as seções 1 a 3.2.3 do relatório entregue pelo grupo. Os diagramas citados estão em `diagramas/`, com transcrição textual em `diagramas/transcricao-diagramas.md`.

## 1. Escopo

Dentre as opções do enunciado, o grupo escolheu "TCCs e trabalhos acadêmicos: busca, relacionamento, divulgação e acompanhamento".

## 2. Problema

No Instituto de Informática da UFRGS, a divulgação de TCCs ocorre de forma estática por e-mail, ocultando o conteúdo real e a correlação entre as pesquisas existentes. Esta abordagem dificulta o entendimento das propostas, provocando um desengajamento na comunidade acadêmica e dificultando a descoberta e o aproveitamento de novos trabalhos.

Pesquisa com alunos do INF (6 respostas). Pergunta: "Lembre-se do último e-mail de divulgação de banca de TCC que você leu. Qual foi a sua ação imediata?"

| Resposta | Respostas |
|---|---|
| Ignorei ou apaguei sem ler o tema | 2 (33,3%) |
| Li o tema no assunto do e-mail, mas não abri o arquivo/resumo | 2 (33,3%) |
| Abri para ver o resumo, mas não participei da banca | 2 (33,3%) |
| Salvei o e-mail/arquivo para ler depois (e acabei esquecendo) | 0 |
| Li o resumo e fui assistir à banca | 0 |

### 2.1 Stakeholders (atores)

- **Internos e diretos**
  - **Aluno de graduação (Formando/Autor):** cadastra o próprio TCC, seleciona tags, faz upload de imagens de demonstração e acompanha a visibilidade do trabalho.
  - **Professores:** consultam trabalhos de orientandos e colegas, validam informações, identificam trabalhos relacionados, analisam o alcance do grupo de pesquisa, correlações e parcerias.
- **Internos e indiretos**
  - **Direção do INF:** beneficia-se da valorização institucional sem operar o aplicativo.
  - **Biblioteca/Repositório LUME UFRGS:** tem seu próprio sistema de catalogação formal; é impactado indiretamente pelo aumento da busca pelos trabalhos sob sua custódia.
- **Externos e diretos**
  - **Comunidade externa e pesquisadores independentes (Visitantes):** usam o aplicativo em modo visitante/leitura. Buscam, consultam resumos, veem imagens e exploram correlações entre temas.
  - **Restrição de acesso:** visitantes não têm permissão de escrita; publicação e edição de TCCs são restritas a usuários autenticados com credenciais institucionais da UFRGS.
- **Externos e indiretos**
  - **Comunidade científica e tecnológica nacional:** ganha com a visibilidade das pesquisas do INF.
  - **Sociedade em geral:** beneficiária final das soluções concebidas nos TCCs.

### 2.2 Benchmark de sistemas

| Nome | Funcionalidades/problema | Defeitos/críticas | Informações relevantes | Usado como referência | Não usado e por quê |
|---|---|---|---|---|---|
| LUME (UFRGS), TCC (lume.ufrgs.br/handle/10183/26428) | Navegar por Ano, Autor, Título, Assunto e Tipo; busca com filtros por Orientador, Curso, Assunto e Ano; página do item com resumo, assuntos e PDF | Listagens só em texto, sem imagens; resumos truncados; não sugere trabalhos relacionados; o curso vem do cadastro do autor, não do tema | Sistema da própria universidade e fonte oficial dos TCCs; cada item tem URL permanente no formato lume.ufrgs.br/handle/10183/NNNNNN | Os metadados (orientador, ano, assuntos) e o link permanente do LUME, que é validado no cadastro | A catalogação formal e o armazenamento oficial: a plataforma não substitui o LUME, apenas divulga e relaciona os trabalhos |
| Biblioteca Digital de TCC (UFSM) | Filtrar/navegar por data, autores, orientadores, títulos, assuntos | Não permite mais de um filtro ao mesmo tempo | Funcionalidades intuitivas e com destaque | As opções de filtragem | A interface em lista contínua, que dificulta separar um TCC do outro |
| Substack | Pesquisa por tópicos e rolagem vertical | Difícil separar o post de um trabalho de um apenas relacionado à área | Parece uma rede social, o que facilita o acesso | O modelo de rede social de posts com imagens | O chat |
| TCCs (UCS) | Filtrar/navegar por subcomunidades e coleções, data, autor, título, assunto | Visualização muito "formal" | Permite filtragens simultâneas | A visualização e a filtragem | O modelo de filtros como "blocos" |
| Medium | Engajamento (palmas, respostas, repostagem) e leitura de artigos longos | Não é acadêmico; paywall bloqueante | Página minimalista, leitura com foco | A página de leitura e as ações de interação | O paywall |

## 3. Solução

Plataforma mobile/web interativa focada em busca e leitura inteligente, mapeamento por tags e rápida identificação de temas e autores.

**Objetivo:** tornar a leitura acessível a partir de recursos visuais, fomentando o interesse científico, facilitando a conexão de ideias e ampliando o impacto do conhecimento gerado.

**Features:** Cadastro e Edição de TCC; Classificação por Tags e Áreas; Busca Multifacetada e Semântica; Mapeamento e Sugestão de Trabalhos Conexos; Feed de Destaques e Descoberta.

### 3.2.1 Requisitos (as duas features escolhidas)

| ID | Descrição |
|---|---|
| RF#01 | **Cadastro e Edição de TCC:** O sistema deve permitir que o aluno formando cadastre e edite as informações de seu TCC, incluindo título, resumo simplificado, orientador, coorientador, ano/semestre, link do documento oficial no LUME, arquivo docx, pdf ou epub e até 3 imagens/figuras de demonstração. |
| RF#02 | **Feed de Destaques e Descoberta:** O sistema deve exibir um feed inicial interativo contendo os TCCs defendidos mais recentemente e os tópicos mais explorados no período, além de permitir buscar e filtrar os TCCs publicados (por ano, autor, orientador, tags e coleção) e baixar o arquivo do trabalho. |

**Problemas que motivam os requisitos:**

- **RF#1:** os TCCs ficam restritos a repositórios institucionais tradicionais, sem forma ágil e visual de o aluno destacar seu trabalho.
- **RF#2:** a busca por trabalhos anteriores é burocrática e baseada apenas em palavras-chave, o que gera baixo engajamento.

**Benchmark das funcionalidades:**

- **RF#1:** Substack e Medium têm escrita direta em tela limpa.
- **RF#2:** Substack tem um feed diário personalizado; Medium destaca os tópicos mais quentes e lista os artigos de forma visual.

### 3.2.1.2 User Stories

**US#01:** "Como aluno formando, quero cadastrar meu TCC com tags, resumo acessível e imagens ilustrativas, para dar visibilidade à minha pesquisa e ser facilmente encontrado por colegas e grupos de pesquisa."

- "Dado que eu quero cadastrar meu TCC, quando eu preencher as informações e clicar na opção de publicar, então ele deve ser divulgado no sistema para outras pessoas."
- "Dado que eu quero categorizar meu TCC em uma área específica, quando eu selecionar as tags apropriadas, então ele deverá ser atribuído àquela classificação."
- "Dado que eu quero ilustrar melhor meu trabalho, quando eu inserir uma imagem no sistema, então ela será atribuída ao TCC."

**US#04:** "Como aluno ingressante ou pesquisador, quero filtrar TCCs por áreas de interesse e tags temáticas, para encontrar referências bibliográficas relevantes e identificar potenciais orientadores."

- "Dado que eu quero visualizar um trabalho de TCC desejado, quando eu clicar nele, então o seu conteúdo e o projeto deverão ser abertos e apresentados pelo sistema."
- "Dado que eu quero acessar um trabalho especificamente da área da computação, quando eu selecionar o filtro respectivo, então todos os trabalhos que não são da categoria não deverão ficar visíveis."
- "Dado que eu quero pesquisar os TCCs associados a um orientador específico, quando eu digitar seu nome na barra de pesquisa, então somente os seus trabalhos aparecerão."

### 3.2.1.3 Casos de uso

Diagrama de casos de uso: `diagramas/casos-de-uso.png`.

#### UC01: Cadastrar TCC (RF#01)

Objetivo: permitir que o aluno formando cadastre os metadados, links e anexos visuais de sua pesquisa para publicação no catálogo.

- **Ator principal:** Aluno Formando (Autor).
- **Pré-condições:** usuário autenticado com credenciais institucionais válidas; TCC já defendido. A URL do LUME é exigida apenas para publicar; sem ela, o trabalho pode ser salvo como rascunho.
- **Pós-condição:** trabalho indexado, aparecendo no feed e nos resultados de busca com suas tags.

**Fluxo principal**

1. O aluno acessa o menu do seu perfil e seleciona "Cadastrar Novo TCC".
2. O sistema exibe o formulário com os campos: Título, Resumo, Ano/Semestre, Orientador, Coorientador (opcional), Link do LUME, Tags e Mídias.
3. O aluno preenche os campos textuais obrigatórios.
4. O aluno seleciona até 5 tags temáticas da lista sugerida ou digita novas tags.
5. O aluno anexa até 3 imagens/gráficos de demonstração.
6. O aluno insere a URL do repositório LUME e o arquivo com as informações (caso existente).
7. O aluno clica em "Publicar TCC".
8. O sistema valida os campos obrigatórios e a integridade do link do LUME.
9. O sistema salva os dados, indexa o trabalho para o mecanismo de busca e exibe: "TCC publicado com sucesso!".
10. O caso de uso se encerra.

**FA01 - Campos obrigatórios incompletos**

- No passo 8, o sistema identifica que um ou mais campos obrigatórios (como Título, Resumo ou Tags) não foram preenchidos.
- O sistema impede a publicação, mantém os dados digitados e destaca em vermelho os campos pendentes com a mensagem: "Preencha todos os campos obrigatórios".
- O aluno preenche e clica novamente em "Publicar TCC".
- O fluxo retorna ao passo 8.

**FA02 - Link do LUME inexistente ou inacessível**

- No passo 8, a verificação da URL falha (link quebrado, domínio incorreto ou servidor indisponível).
- O sistema exibe: "A URL informada não pertence ao domínio do LUME ou está inacessível. Deseja salvar como rascunho até que a publicação no LUME esteja homologada?".
- Se o aluno selecionar "Salvar como rascunho", o sistema armazena os dados sem disponibilizá-los no feed de busca e confirma: "Rascunho salvo com sucesso".
- O caso de uso se encerra.

#### UC04: Buscar e Filtrar TCCs (RF#02)

Objetivo: permitir que o aluno pesquisador ou professor (usuário leitor) explore os trabalhos de interesse realizados por alunos formandos.

- **Ator principal:** Usuário Leitor (Aluno Pesquisador, Professor ou Visitante).
- **Pré-condição:** o TCC já possui registro prévio no sistema (status "PUBLICADO").
- **Pós-condição:** os resultados compatíveis com os critérios foram apresentados e o documento selecionado foi disponibilizado para download.

**Fluxo principal**

1. O usuário acessa o menu e seleciona "Buscar TCC".
2. O sistema exibe uma barra de pesquisa ao lado de botões de filtro com os campos: Data/Ano, Autores, Orientadores, Assuntos/Tags e Coleções.
3. O usuário insere termos na barra de busca e/ou seleciona os filtros desejados.
4. O usuário confirma as seleções e aperta no símbolo de "Pesquisar".
5. O sistema mostra todos os trabalhos que se encaixam em todas as condições, simultaneamente, na forma de feed.
6. O usuário seleciona o trabalho listado desejado.
7. O sistema mostra as características e a descrição do trabalho, como preenchidas pelo autor.
8. O usuário aperta no botão "Baixar Artigo".
9. O sistema realiza o download do arquivo do trabalho para o dispositivo do usuário.
10. O caso de uso se encerra.

**FA01 - Nenhum trabalho atende ao filtro**

- No passo 5, o sistema devolve um feed vazio.
- O sistema exibe: "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."
- O usuário redefine filtros ou termos e clica novamente em "Pesquisar".
- O fluxo retorna ao passo 5.

**FA02 - Falha durante o download**

- No passo 9, a transferência do artigo falha.
- O sistema exibe: "Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente.".
- O usuário espera a conexão voltar e clica novamente em "Baixar Artigo".
- O fluxo retorna ao passo 9.

#### Diagramas de atividades

`diagramas/atividades-uc01.png` (UC01) e `diagramas/atividades-uc04.png` (UC04).

### 3.2.2 Infraestrutura

- Diagrama de Classes: `diagramas/classes.png`.
- Diagrama de Pacotes: `diagramas/pacotes.png`.
- Diagrama de Sequência (interação do UC01): `diagramas/sequencia-uc01.png`.

### 3.2.3 Casos de teste

**CT01 - Cadastrar TCC com dados válidos**

- **Relacionamento:** RF#01, UC01, US#01. **Tipo:** positivo.
- **Pré-condições:** aluno autenticado com credenciais institucionais; base com o link do TCC ativo no LUME.
- **Entrada:**
  - Título: "Detecção de anomalias em redes veiculares"
  - Resumo: texto simplificado preenchido
  - Ano/Semestre: 2025/2
  - Orientador: Prof. Carlos Lima (coorientador em branco)
  - Link do LUME: URL válida do repositório
  - Tags: Redes, IA, Segurança
  - Mídias: 2 imagens PNG
- **Passos:**
  1. Acessar o menu do perfil e selecionar "Cadastrar Novo TCC".
  2. Preencher os campos com os dados acima.
  3. Clicar em "Publicar TCC".
- **Resultados esperados:**
  - O sistema valida os campos e o link e exibe "TCC publicado com sucesso!".
  - O TCC fica com status PUBLICADO e aparece no feed.
  - Uma busca pela tag "Redes" retorna o TCC.

**CT02 - Cadastrar TCC com link fora do LUME (FA02)**

- **Relacionamento:** RF#01, UC01 (FA02). **Tipo:** negativo.
- **Pré-condições:** aluno autenticado com credenciais institucionais.
- **Entrada:** mesmos dados de CT01, exceto o link do LUME: http://exemplo.com/tcc-123.
- **Passos:**
  1. Abrir o formulário "Cadastrar Novo TCC" e preencher os dados.
  2. Clicar em "Publicar TCC".
  3. Na mensagem exibida, selecionar "Salvar como rascunho".
- **Resultados esperados:**
  - O sistema não publica e exibe o aviso: "A URL informada não pertence ao domínio do LUME ou está inacessível. Deseja salvar como rascunho até que a publicação no LUME esteja homologada?".
  - Após a confirmação, aparece "Rascunho salvo com sucesso".
  - O TCC fica com status RASCUNHO, com todos os dados preservados, e não aparece no feed nem nos resultados de busca.
  - Variação: se o aluno recusar o rascunho, o formulário volta com os dados mantidos.

**CT03 - Buscar TCCs com filtros combinados**

- **Relacionamento:** RF#02, UC04, US#04. **Tipo:** positivo.
- **Pré-condições:** base com os seguintes TCCs:

  | TCC | Ano/Semestre | Orientador | Tag | Status |
  |---|---|---|---|---|
  | A | 2025/1 | Profº Carlos Lima | Redes | Publicado |
  | B | 2025/1 | Profº Carlos Lima | IA | Publicado |
  | C | 2024/2 | Profº Carlos Lima | Redes | Publicado |
  | D | 2025/1 | Profª Ana Reis | Redes | Publicado |
  | E | 2025/1 | Profº Carlos Lima | Redes | Rascunho |

- **Entrada:** Ano: 2025; Orientador: Profº Carlos Lima; Tag: Redes.
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Selecionar os filtros Ano = 2025, Orientador = "Carlos Lima" e Tag = "Redes".
  3. Clicar em "Pesquisar".
  4. Selecionar o trabalho listado.
- **Resultados esperados:**
  - O feed mostra apenas o TCC A, porque os filtros são aplicados simultaneamente. B, C e D não atendem a todas as condições, e E está em rascunho.
  - Ao abrir o TCC A, o sistema exibe as informações preenchidas pelo autor.
  - Variação: com Ano = 2023 e Tag = "Redes", o sistema exibe "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros".

**CT04 - Cadastrar TCC no limite de tags e imagens (FA01)**

- **Relacionamento:** RF#01, UC01 (FA01), US#01. **Tipo:** limite/exceção.
- **Pré-condições:** aluno autenticado.
- **Entrada:** mesmos dados de CT01, exceto:
  - Tags: Redes, IA, Segurança, Sistemas Distribuídos e Engenharia de Software (5 tags), mais uma 6ª tag "Robótica"
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
  - Ao publicar sem Resumo, o sistema não publica, destaca o campo em vermelho e exibe "Preencha todos os campos obrigatórios", mantendo os demais dados.
  - Após preencher o Resumo, o TCC é publicado com exatamente 5 tags e 3 imagens e o sistema exibe "TCC publicado com sucesso!".

**CT05 - Buscar TCCs sem correspondência (FA01)**

- **Relacionamento:** RF#02, UC04 (FA01), US#04. **Tipo:** negativo.
- **Pré-condições:** base com os mesmos TCCs de CT03 (A a E); nenhum TCC publicado contém o termo "blockchain" e possui a tag "Redes".
- **Entrada:** Termo: "blockchain"; Tag: Redes.
- **Passos:**
  1. Acessar o menu e selecionar "Buscar TCC".
  2. Digitar "blockchain" e selecionar o filtro Tag = "Redes".
  3. Clicar em "Pesquisar".
  4. Remover o termo "blockchain", manter Tag = "Redes" e clicar novamente em "Pesquisar".
- **Resultados esperados:**
  - No passo 3, o feed fica vazio e o sistema exibe "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."
  - No passo 4, o fluxo retorna ao passo 5 do UC04 e o feed mostra os TCCs A, C e D; o TCC E continua oculto por estar em rascunho.
  - Variação: buscar pelo título do TCC E retorna a mesma mensagem, pois rascunhos não aparecem na busca.

**CT06 - Falha durante o download do artigo (FA02)**

- **Relacionamento:** RF#02, UC04 (FA02), US#04. **Tipo:** exceção.
- **Pré-condições:** TCC A publicado com arquivo PDF anexado; conexão com a internet interrompida durante a transferência.
- **Entrada:** TCC A - 2025/1 - Profº Carlos Lima - Redes.
- **Passos:**
  1. Buscar e abrir o TCC A.
  2. Clicar em "Baixar Artigo".
  3. Interromper a conexão durante a transferência.
  4. Restabelecer a conexão e clicar novamente em "Baixar Artigo".
- **Resultados esperados:**
  - No passo 3, o sistema exibe "Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente." e nenhum arquivo incompleto é salvo no dispositivo.
  - A página do TCC continua aberta, com o botão "Baixar Artigo" disponível.
  - No passo 4, o download é concluído e o arquivo PDF do TCC A é salvo no dispositivo.
