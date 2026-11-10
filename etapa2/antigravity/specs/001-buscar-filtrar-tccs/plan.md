# Plano de implementação: Buscar e Filtrar TCCs

**Pasta:** `specs/001-buscar-filtrar-tccs` | **Data:** 2026-11-10 | **Especificação:** `spec.md`

## Resumo

Implementação da funcionalidade **RF#02 / UC04 — Buscar e Filtrar TCCs** (incluindo visualização de detalhes com trabalhos conexos de UC05/UC06 e download de arquivo com tratamento de falhas de FA01/FA02) em JavaScript (ES Modules) para Node.js 20+, sem dependências externas e sem interface gráfica. A solução segue a arquitetura em quatro camadas definida nos diagramas da Etapa 1 (`controller` → `service` → `repository` → `model`, apoiada por `dto`), com persistência em memória pré-populada com os TCCs A a E dos casos de teste (`CT03`, `CT05` e `CT06`), ponto de entrada configurável em `src/app.js` com injeção de dependências (permitindo simular falhas de transferência no download) e suíte de testes automatizados com o executor nativo `node --test`.

## Contexto técnico

- **Linguagem/versão:** JavaScript (ES Modules, `"type": "module"`), Node.js 20 ou superior.
- **Dependências:** Nenhuma dependência externa (`dependencies` e `devDependencies` ausentes; não é necessário executar `npm install`). Utiliza apenas módulos nativos do Node.js (`node:test`, `node:assert/strict`).
- **Armazenamento:** Persistência em memória (`TccRepository` em memória e serviço de armazenamento de arquivos `ArmazenamentoArquivo` em memória), inicializada com a semente de dados dos TCCs A a E (`CT03`, `CT05`, `CT06`).
- **Testes:** Executor nativo do Node.js (`node --test`).
- **Plataforma:** Ambiente de execução Node.js multiplataforma (Windows/Linux/macOS).
- **Restrições:** Sem interface gráfica (a fronteira com o usuário é a API pública de `TccController`); código-fonte em `src/` com ponto de entrada em `src/app.js` e testes em `tests/` na raiz do projeto; fidelidade estrita aos nomes de classes/métodos dos diagramas e às mensagens literais dos casos de uso.

## Verificação da constituição

<!-- Para cada princípio (I a VI), diga se o plano cumpre e como. Violações precisam de justificativa. -->

| Princípio | Cumpre? | Como |
|---|---|---|
| **I. Rastreabilidade** | Sim | Todos os requisitos (`FR-001` a `FR-010`) são mapeados na tabela de rastreabilidade para os métodos das camadas (`controller`, `service`, `repository`, `model`, `dto`) e para os testes automatizados derivados de `CT03`, `CT05`, `CT06` e cenários de `spec.md`. |
| **II. Testes derivados dos casos de teste, escritos antes do código** | Sim | A suíte em `tests/` será implementada antes do código de produção na Fase 5 (TDD), cobrindo integralmente `CT03`, `CT05` e `CT06` (além dos cenários esclarecidos em `FR-001` a `FR-010`) e falhando antes da implementação. |
| **III. Fidelidade ao domínio** | Sim | Nomes de pacotes, classes, atributos e métodos seguem os diagramas de classes e de pacotes (`TccController`, `TccService`, `TccRepository`, `TccDTO`, `FiltroBusca`, `TCC`, `Usuario`, `Professor`, `AlunoFormando`, `Tag`, `Area`, `Midia`, `ArquivoTcc`, `StatusTcc`, `FormatoArquivo`). As mensagens de `UC04-FA01` e `UC04-FA02` são reproduzidas literalmente. As divergências entre os diagramas e a especificação esclarecida estão registradas neste plano. |
| **IV. Arquitetura em camadas** | Sim | O código respeita o fluxo unidirecional `controller` → `service` → `repository` → `model` (com `dto` para entrada e saída). O armazenamento de arquivos (raia *Armazenamento de Arquivos* do diagrama de atividades do `UC04`) fica isolado atrás de uma dependência injetável (`ArmazenamentoArquivo`), substituível/configurável nos testes via `src/app.js`. |
| **V. Simplicidade** | Sim | Zero pacotes externos, sem interface gráfica, persistência em memória com estruturas nativas do JavaScript (`Map`/`Array`) e implementação restrita aos componentes necessários para `Buscar e Filtrar TCCs` (sem implementar cadastro/edição de TCC nem validação externa do LUME). |
| **VI. Ambiguidade é explicitada, não suposta** | Sim | Todas as 5 ambiguidades identificadas na Fase 1 foram esclarecidas com o usuário na Fase 2 (`spec.md` seção *Esclarecimentos*) e suas decisões estão refletidas diretamente nos contratos e regras deste plano. |

## Estrutura do projeto

```text
.
├── package.json
├── src/
│   ├── app.js
│   ├── controller/
│   │   └── TccController.js
│   ├── dto/
│   │   ├── FiltroBusca.js
│   │   └── TccDTO.js
│   ├── service/
│   │   ├── TccService.js
│   │   └── ArmazenamentoArquivo.js
│   ├── repository/
│   │   ├── TccRepository.js
│   │   └── dadosIniciais.js
│   └── model/
│       ├── Usuario.js
│       ├── Professor.js
│       ├── AlunoFormando.js
│       ├── TCC.js
│       ├── Tag.js
│       ├── Area.js
│       ├── Midia.js
│       ├── ArquivoTcc.js
│       ├── StatusTcc.js
│       └── FormatoArquivo.js
└── tests/
    └── buscar-filtrar-tccs.test.js
```

## Modelo de dados

### 1. Enumerações (`src/model/`)

- **`StatusTcc`** (`Object.freeze`):
  - `RASCUNHO: 'RASCUNHO'`
  - `PUBLICADO: 'PUBLICADO'`
- **`FormatoArquivo`** (`Object.freeze`):
  - `DOCX: 'DOCX'`
  - `PDF: 'PDF'`
  - `EPUB: 'EPUB'`

### 2. Entidades de domínio (`src/model/`)

- **`Usuario`** (classe base conceitualmente abstrata):
  - `id: number`
  - `nome: string`
  - `email: string`
  - `loginInstitucional: string`
- **`Professor` (estende `Usuario`)**:
  - `departamento: string`
- **`AlunoFormando` (estende `Usuario`)**:
  - `matricula: string`
- **`Area`**:
  - `id: number`
  - `nome: string`
- **`Tag`**:
  - `id: number`
  - `nome: string`
  - `area: Area | null` (multiplicidade `0..1`)
- **`Midia`**:
  - `id: number`
  - `caminhoUrl: string`
  - `descricao: string`
- **`ArquivoTcc`**:
  - `nomeOriginal: string`
  - `formato: string` (valor de `FormatoArquivo`: `'DOCX' | 'PDF' | 'EPUB'`)
  - `caminho: string`
  - `conteudo: string | Uint8Array` (conteúdo binário/textual em memória associado ao arquivo para transferência)
- **`TCC`**:
  - **Atributos:**
    - `id: number`
    - `titulo: string`
    - `resumoSimplificado: string`
    - `ano: number`
    - `semestre: number` (`1` ou `2`)
    - `linkLume: string`
    - `status: string` (`StatusTcc.RASCUNHO` ou `StatusTcc.PUBLICADO`)
    - `visualizacoes: number` (inicia em `0`)
  - **Associações (conforme `classes.png`):**
    - `autor: AlunoFormando` (obrigatoriamente `1`)
    - `orientador: Professor` (obrigatoriamente `1`, parte da relação `1..2 Professor`)
    - `coorientador: Professor | null` (opcional `0..1`, parte da relação `1..2 Professor`)
    - `tags: Tag[]` (`1..5` tags temáticas)
    - `midias: Midia[]` (`0..3` mídias ilustrativas)
    - `arquivo: ArquivoTcc | null` (`0..1` arquivo anexado)
  - **Métodos de domínio (conforme `classes.png`):**
    - `registrarVisualizacao(): void` — incrementa `this.visualizacoes` em `1`.
    - `publicar(): void` — altera `this.status` para `StatusTcc.PUBLICADO`.
    - `salvarRascunho(): void` — altera `this.status` para `StatusTcc.RASCUNHO`.
    - `validarCamposObrigatorios(): boolean` — verifica presença de título, resumoSimplificado, ano, semestre, autor, orientador e entre 1 e 5 tags.

### 3. Objetos de Transferência de Dados — DTOs (`src/dto/`)

- **`FiltroBusca`**:
  - `termo: string` (padrão `''`)
  - `ano: number | null` (padrão `null`)
  - `autor: string` (padrão `''`)
  - `orientador: string` (padrão `''`)
  - `tags: string | string[]` (padrão `''`; aceita uma tag única como `'Redes'`, múltiplas tags separadas por vírgula como `'Redes, IA'` ou lista `['Redes', 'IA']`)
- **`TccDTO`**:
  - Atributos previstos em `classes.png`:
    - `id: number`
    - `titulo: string`
    - `resumoSimplificado: string`
    - `ano: number`
    - `semestre: number`
    - `autor: string` (nome do `AlunoFormando`)
    - `orientador: string` (nome do `Professor` orientador)
    - `tags: string[]` (nomes das tags associadas, além de representação textual se necessário)
  - Atributos adicionais para atender integralmente ao `FR-008` (esclarecido na Fase 2):
    - `coorientador: string | null` (nome do coorientador ou `null`)
    - `linkLume: string`
    - `midias: Array<{ id: number, caminhoUrl: string, descricao: string }>`
    - `possuiArquivo: boolean`
    - `arquivo: { nomeOriginal: string, formato: string, caminho: string } | null`
    - `visualizacoes: number`
    - `trabalhosConexos: TccDTO[]` (preenchido ao visualizar detalhes, com os resumos dos TCCs publicados que compartilham ao menos uma tag)

### 4. Dados iniciais em memória (`src/repository/dadosIniciais.js`)

A carga padrão em memória inclui os 5 TCCs (A a E) especificados em `CT03`, `CT05` e `CT06`:

| Código / ID | Título | Ano/Semestre | Autor | Orientador | Tags | Status | Arquivo anexado | Papel nos testes |
|---|---|---|---|---|---|---|---|---|
| **TCC A** (`id: 1`) | `"Detecção de anomalias em redes veiculares"` | `2025/1` | João Silva | `Profº Carlos Lima` | `["Redes"]` | `PUBLICADO` | `tcc-a-redes-veiculares.pdf` (`PDF`) | Retornado em `CT03` e `CT05` (passo 4); alvo de detalhes e download em `CT03` e `CT06`. |
| **TCC B** (`id: 2`) | `"Modelos preditivos aplicados à triagem clínica"` | `2025/1` | Maria Souza | `Profº Carlos Lima` | `["IA"]` | `PUBLICADO` | `tcc-b-ia.pdf` (`PDF`) | Excluído em `CT03` e `CT05` quando filtrado por tag `"Redes"`. |
| **TCC C** (`id: 3`) | `"Análise de desempenho em redes definidas por software"` | `2024/2` | Pedro Santos | `Profº Carlos Lima` | `["Redes"]` | `PUBLICADO` | `tcc-c-sdn.pdf` (`PDF`) | Excluído em `CT03` por ano (`2024 != 2025`); retornado em `CT05` (passo 4) e conexo ao TCC A (`FR-008`). |
| **TCC D** (`id: 4`) | `"Protocolos de roteamento para redes de sensores sem fio"` | `2025/1` | Lucas Oliveira | `Profª Ana Reis` | `["Redes"]` | `PUBLICADO` | `null` (sem arquivo anexado, apenas `linkLume`) | Excluído em `CT03` por orientador; retornado em `CT05` (passo 4); exercita `FR-009` (TCC publicado sem arquivo próprio). |
| **TCC E** (`id: 5`) | `"Segurança e consenso em redes locais corporativas"` | `2025/1` | Carla Mendes | `Profº Carlos Lima` | `["Redes"]` | `RASCUNHO` | `tcc-e-rascunho.pdf` (`PDF`) | Deve permanecer sempre invisível na busca (`CT03`, `CT05` e variação de `CT05`), nos detalhes (`História 2`) e nos trabalhos conexos (`FR-008`). |

## Contratos

### 1. Ponto de entrada (`src/app.js`)

- **`criarApp(opcoes = {})`**:
  - **Parâmetros (`opcoes`):**
    - `tccsIniciais?: TCC[]` — lista opcional de TCCs para substituir a semente padrão (`dadosIniciais.js`).
    - `repository?: TccRepository` — instância opcional de repositório.
    - `armazenamentoArquivo?: ArmazenamentoArquivo` — dependência opcional para transferência de arquivos (permite injetar *mock*/*stub* ou usar o controlador de falha de conexão nos testes de `CT06`).
    - `service?: TccService` — instância opcional de serviço.
  - **Retorno:** `{ controller, service, repository, armazenamentoArquivo }`.

### 2. Camada de Apresentação (`src/controller/TccController.js`)

- **`buscarTccs(filtro = new FiltroBusca())`**:
  - **Parâmetros:** `filtro: FiltroBusca | Object` (`{ termo?, ano?, autor?, orientador?, tags? }`).
  - **Comportamento:** Converte a entrada em `FiltroBusca`, delega a `tccService.buscarPorFiltros(filtro)` e converte cada `TCC` retornado para `TccDTO`.
  - **Retorno:** Objeto `{ resultados: TccDTO[], mensagem: string | null }`:
    - Se houver 1 ou mais TCCs compatíveis: `{ resultados: [...], mensagem: null }`.
    - Se nenhum TCC publicado atender aos critérios (`UC04 - FA01`): `{ resultados: [], mensagem: "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros." }`.
- **`visualizarDetalhes(id)`**:
  - **Parâmetros:** `id: number`.
  - **Comportamento:** Solicita o TCC publicado a `tccService.buscarPorId(id)` (que incrementa `visualizacoes`) e os trabalhos conexos a `tccService.mapearTrabalhosConexos(id)`, atualiza o estado de visualização aberta do controller (`detalheAtual`) e retorna o `TccDTO` completo.
  - **Retorno:** `TccDTO` contendo todos os dados preenchidos pelo autor (`id`, `titulo`, `resumoSimplificado`, `ano`, `semestre`, `autor`, `orientador`, `coorientador`, `linkLume`, `tags`, `midias`, `possuiArquivo`, `arquivo`, `visualizacoes`) e `trabalhosConexos: TccDTO[]`.
  - **Erros:** Lança `Error("TCC não encontrado ou não está publicado.")` caso o `id` não exista ou pertença a um TCC com status `RASCUNHO` (`FR-004`, `História 2 Cenário 2`).
- **`listarTrabalhosConexos(id)`**:
  - **Parâmetros:** `id: number`.
  - **Comportamento:** Delega a `tccService.mapearTrabalhosConexos(id)` e converte os resultados para `TccDTO[]`.
  - **Retorno:** `TccDTO[]`.
- **`baixarArquivo(id)`**:
  - **Parâmetros:** `id: number`.
  - **Comportamento:** Solicita o download a `tccService.obterArquivo(id)`.
  - **Retorno em caso de sucesso (`UC04` passo 9 / `CT06` passo 4):**
    - Salva o arquivo íntegro na coleção de arquivos baixados no dispositivo simulado (`this.arquivosSalvosNoDispositivo`) e retorna:
      `{ sucesso: true, arquivo: { nomeOriginal, formato, caminho, conteudo }, mensagem: null, linkLume: tcc.linkLume, paginaDetalhesAberta: true, botaoBaixarDisponivel: true }`.
  - **Retorno em caso de falha na transferência (`UC04 - FA02` / `CT06` passo 3):**
    - Garante que nenhum arquivo parcial/incompleto seja adicionado a `this.arquivosSalvosNoDispositivo`, preserva `this.detalheAtual` aberto com o botão disponível e retorna:
      `{ sucesso: false, arquivo: null, mensagem: "Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente.", linkLume: tcc.linkLume, paginaDetalhesAberta: true, botaoBaixarDisponivel: true }`.
  - **Retorno quando o TCC publicado não possui arquivo anexado (`FR-009`):**
    - Impede a transferência e retorna:
      `{ sucesso: false, arquivo: null, mensagem: "Arquivo para download direto não está disponível. Consulte o trabalho pelo link oficial do LUME: <linkLume>", linkLume: tcc.linkLume, paginaDetalhesAberta: true, botaoBaixarDisponivel: false }`.
  - **Erros:** Lança `Error("TCC não encontrado ou não está publicado.")` se o TCC não existir ou estiver em `RASCUNHO`.

### 3. Camada de Negócio (`src/service/TccService.js` e `src/service/ArmazenamentoArquivo.js`)

- **`TccService`**:
  - **`buscarPorFiltros(filtro: FiltroBusca): TCC[]`**:
    - Delega ao repositório e garante que:
      1. Apenas TCCs com `status === StatusTcc.PUBLICADO` sejam considerados (`FR-004`).
      2. Todos os critérios preenchidos sejam satisfeitos simultaneamente (`FR-003`).
      3. `termo` livre faça correspondência parcial (*substring*) *case-insensitive* em `titulo`, `resumoSimplificado`, `autor.nome`, `orientador.nome`, `coorientador?.nome` e `tags[].nome` (`FR-005`).
      4. `ano` corresponda exatamente a `tcc.ano` quando informado (`Premissas`).
      5. `autor` e `orientador` façam correspondência parcial (*substring*) *case-insensitive* em `tcc.autor.nome` e `tcc.orientador.nome` (`FR-005`, `CT03`).
      6. `tags` exija que o TCC possua **todas** as tags informadas no filtro (conjunção lógica `E`), com comparação *case-insensitive* (`FR-005`).
      7. Os resultados sejam ordenados por `(ano DESC, semestre DESC, id ASC)` (`FR-006`).
  - **`buscarPorId(id: number): TCC`**:
    - Busca o TCC no repositório; se não existir ou `status !== StatusTcc.PUBLICADO`, lança `Error("TCC não encontrado ou não está publicado.")`.
    - Chama `tcc.registrarVisualizacao()` (`FR-008`) e retorna a instância de `TCC`.
  - **`mapearTrabalhosConexos(id: number): TCC[]`**:
    - Obtém o TCC publicado de referência e utiliza `tccRepository.buscarPorTags(tcc.tags)` para retornar os demais TCCs com `status === StatusTcc.PUBLICADO` (`tccConexo.id !== id`) que compartilhem ao menos uma tag (comparação *case-insensitive*), ordenados por `(ano DESC, semestre DESC, id ASC)` (`FR-008`).
  - **`obterArquivo(id: number): { nomeOriginal: string, formato: string, caminho: string, conteudo: string | Uint8Array }`**:
    - Verifica se o TCC existe e está `PUBLICADO`.
    - Se `tcc.arquivo === null`, lança erro com `codigo = 'ARQUIVO_INDISPONIVEL'`, `linkLume = tcc.linkLume` e mensagem indicando consulta pelo link oficial do LUME (`FR-009`).
    - Solicita a transferência a `armazenamentoArquivo.transferirArquivo(tcc.arquivo)`. Se a transferência falhar, lança erro com `codigo = 'FALHA_DOWNLOAD'` e a mensagem literal `"Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente."` (`FR-010`, `UC04 - FA02`, `CT06`).
- **`ArmazenamentoArquivo` (`src/service/ArmazenamentoArquivo.js`)**:
  - Representa a raia externa *Armazenamento de Arquivos* do diagrama de atividades do `UC04`.
  - Métodos:
    - `definirConexaoAtiva(ativa: boolean): void` — permite simular queda e restabelecimento de conexão nos testes (`CT06`).
    - `transferirArquivo(arquivo: ArquivoTcc): { nomeOriginal, formato, caminho, conteudo }` — simula a leitura/transferência em blocos; se a conexão estiver inativa (`! this.conexaoAtiva`) ou for interrompida durante a transferência, descarta imediatamente qualquer buffer parcial em memória e lança erro de transferência.

### 4. Camada de Dados (`src/repository/TccRepository.js`)

- **`TccRepository`**:
  - `salvarTcc(tcc: TCC): void` — armazena ou atualiza um TCC na coleção em memória.
  - `buscarPorId(id: number): TCC | null` — retorna o TCC pelo identificador ou `null`.
  - `buscarPorFiltros(filtros: FiltroBusca): TCC[]` — filtra os TCCs armazenados em memória conforme os critérios de `FiltroBusca` (somente `StatusTcc.PUBLICADO`).
  - `buscarPorTags(tags: Tag[]): TCC[]` — retorna os TCCs `PUBLICADO` que possuam ao menos uma das tags informadas.

### 5. Como a falha de download será simulada (`CT06` / `FA02`)

1. A classe `ArmazenamentoArquivo` é injetada em `TccService` através da fábrica `criarApp({ armazenamentoArquivo })` em `src/app.js`.
2. Durante o teste do `CT06`:
   - Passo 1: O teste busca e abre os detalhes do TCC A (`controller.visualizarDetalhes(1)`).
   - Passo 2 e 3: O teste interrompe a conexão chamando `armazenamentoArquivo.definirConexaoAtiva(false)` (ou injetando um *stub* que falha na primeira chamada) e aciona `controller.baixarArquivo(1)`.
   - O `ArmazenamentoArquivo` inicia a simulação de transferência, detecta a interrupção de conexão, descarta o buffer parcial e lança erro de transferência.
   - O `TccController` captura a falha, **não** adiciona nenhum arquivo a `controller.arquivosSalvosNoDispositivo` (garantindo ausência de arquivo incompleto), preserva `controller.detalheAtual` aberto com `botaoBaixarDisponivel: true` e retorna a mensagem literal `"Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente."`.
   - Passo 4: O teste restabelece a conexão com `armazenamentoArquivo.definirConexaoAtiva(true)` e chama novamente `controller.baixarArquivo(1)`. A transferência é concluída com sucesso e o PDF do TCC A é registrado integralmente em `controller.arquivosSalvosNoDispositivo`.

### 6. Divergências entre a especificação e os diagramas e decisões tomadas

| Ponto | O que diz o diagrama | O que diz a especificação (`spec.md`) | Decisão técnica tomada |
|---|---|---|---|
| **Retorno de `TccController.buscarTccs`** | `classes.png`: `+ buscarTccs(filtro: FiltroBusca): List<TccDTO>` | `FR-007` e `UC04-FA01`: quando a busca retorna lista vazia, o sistema deve exibir literalmente `"Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."` | Como não há interface gráfica e a fronteira com o usuário é `TccController`, `buscarTccs` retorna `{ resultados: TccDTO[], mensagem: string \| null }`, enquanto `TccService.buscarPorFiltros` mantém o retorno `TCC[]` do diagrama. |
| **Atributos de `TccDTO` em `visualizarDetalhes`** | `classes.png`: `TccDTO` possui apenas `id`, `titulo`, `resumoSimplificado`, `ano`, `semestre`, `autor`, `orientador`, `tags`. | `FR-008` (esclarecido na Fase 2): a visualização de detalhes deve exibir todos os dados preenchidos pelo autor (incluindo `coorientador`, `linkLume`, `midias`, `arquivo`), `visualizacoes` e `trabalhosConexos`. | `TccDTO` mantém todos os 8 campos do diagrama de classes e inclui os campos complementares exigidos por `FR-008`. |
| **Tipo do campo `tags` em `TccDTO` e `FiltroBusca`** | `classes.png`: `+ tags: String` em ambos. | `TCC` agrega `1..5 Tag` e `FR-005` permite filtrar por uma ou múltiplas tags (conjunção `E`). | `FiltroBusca.tags` aceita tanto `string` (ex.: `'Redes'` ou `'Redes, IA'`) quanto `string[]`, e `TccDTO.tags` expõe `string[]` com os nomes das tags do TCC. |
| **Retorno de `TccController.baixarArquivo`** | `classes.png`: `+ baixarArquivo(id: int): File` | `FR-009`, `FR-010`, `UC04-FA02` e `CT06`: deve informar literalmente a mensagem de erro de conexão sem salvar arquivo incompleto, manter a página aberta para nova tentativa e tratar ausência de arquivo indicando o `linkLume`. | `TccController.baixarArquivo(id)` retorna um objeto estruturado `{ sucesso, arquivo, mensagem, linkLume, paginaDetalhesAberta, botaoBaixarDisponivel }` e controla a lista `arquivosSalvosNoDispositivo` para comprovar nos testes que arquivos parciais nunca são salvos. |
| **Grafia de `ArquivoTcc` vs `ArquivoTCC`** | `classes.png`: `ArquivoTcc`; `pacotes.png`: `ArquivoTCC`. | `Entidades-chave`: Arquivo do TCC. | Adota-se `ArquivoTcc` (conforme `classes.png` e enunciado da Fase 3), exportando também o alias `ArquivoTCC` no módulo `src/model/ArquivoTcc.js`. |
| **Ordenação no passo 4 do `CT05`** | `CT05` menciona os TCCs compatíveis como "A, C e D" (ordem da tabela de pré-condições). | `FR-006` (esclarecido na Fase 2): ordenar resultados por ano/semestre decrescente e, em caso de empate, por identificador/ordem de cadastro. | Os TCCs retornados no passo 4 do `CT05` são exatamente os três trabalhos `{A, C, D}`, ordenados como `[A (2025/1, id 1), D (2025/1, id 4), C (2024/2, id 3)]`. |

## Decisões técnicas

| Decisão | Justificativa | Alternativas descartadas |
|---|---|---|
| **JavaScript ES Modules puro com `node:test` e `node:assert/strict`** | Cumpre a restrição de zero dependências externas (`npm install` desnecessário) e o Princípio V da Constituição. | Jest, Vitest ou Mocha (descartados por exigirem pacotes externos via `node_modules`). |
| **Injeção de dependências via fábrica `criarApp` em `src/app.js`** | Permite instanciar toda a árvore (`repository` → `service` → `controller`) com os dados iniciais padrão ou injetar *stubs*/configurações de falha de download nos testes automatizados sem acoplamento global. | Singletons estáticos importados diretamente entre módulos (descartados por dificultarem o isolamento entre testes e a simulação determinística de falha em `CT06`). |
| **Abstração `ArmazenamentoArquivo` para transferência de arquivos** | Atende ao Princípio IV da Constituição (*"Dependências externas (armazenamento de arquivos, LUME) ficam atrás de interfaces que podem ser substituídas nos testes"*) e modela fielmente a raia *Armazenamento de Arquivos* do diagrama de atividades do `UC04`. | Ler arquivos reais do disco local com `node:fs` sem abstração (descartado por criar efeitos colaterais no sistema de arquivos e dificultar a simulação de queda de conexão durante a transferência). |
| **Normalização de strings sem diferenciar maiúsculas/minúsculas nas buscas** | Atende ao `FR-005` esclarecido na Fase 2 e garante que `"Carlos Lima"` encontre `"Profº Carlos Lima"` (`CT03`) e `"redes"` encontre `"Redes"`. | Comparação exata com `===` (descartada por falhar no `CT03` passo 2). |
| **Escopo enxuto focado nas operações de `UC04`, `UC05` e `UC06`** | O Princípio V da Constituição determina não implementar nada além do necessário para cumprir a especificação. Métodos de escrita (`cadastrarTcc`, `editarTcc`) e de feed inicial (`obterFeedDestaques`) estão explícitos como fora de escopo em `spec.md`. | Implementar `UC01` (`ValidadorLumeService`, `FeedDTO`, `TagRepository`) completos (descartado por violar o recorte de escopo da funcionalidade e o Princípio V). |

## Rastreabilidade

| Requisito (FR) | Componente(s) responsável(is) | Teste(s) |
|---|---|---|
| **FR-001** (Acesso público de leitura sem autenticação) | `src/app.js` (`criarApp`), `TccController.buscarTccs`, `TccController.visualizarDetalhes`, `TccController.baixarArquivo` | `tests/buscar-filtrar-tccs.test.js` — *FR-001: Acesso às operações de busca, detalhes e download sem autenticação* |
| **FR-002** (Busca por termo livre e filtros Ano, Autor, Orientador e Tags) | `FiltroBusca`, `TccController.buscarTccs`, `TccService.buscarPorFiltros`, `TccRepository.buscarPorFiltros` | `tests/buscar-filtrar-tccs.test.js` — *CT03: Buscar TCCs com filtros combinados*; *FR-002 / FR-005: Filtros individuais por termo, ano, autor, orientador e tags* |
| **FR-003** (Aplicação simultânea / interseção lógica de todos os filtros) | `TccService.buscarPorFiltros`, `TccRepository.buscarPorFiltros` | `tests/buscar-filtrar-tccs.test.js` — *CT03: Buscar TCCs com filtros combinados*; *CT05: Buscar TCCs sem correspondência* |
| **FR-004** (Exclusividade de TCCs `PUBLICADO` e ocultação total de `RASCUNHO`) | `StatusTcc`, `TccRepository.buscarPorFiltros`, `TccService.buscarPorFiltros`, `TccService.buscarPorId`, `TccService.mapearTrabalhosConexos` | `tests/buscar-filtrar-tccs.test.js` — *CT03 (exclusão do TCC E)*; *CT05 e variação (busca pelo título exato do rascunho TCC E)*; *FR-004: Bloqueio de visualização e download de TCC em rascunho* |
| **FR-005** (Correspondência parcial *case-insensitive* para termo/autor/orientador e conjunção `E` para múltiplas tags) | `TccService.buscarPorFiltros`, `TccRepository.buscarPorFiltros` | `tests/buscar-filtrar-tccs.test.js` — *CT03 ("Carlos Lima" encontra "Profº Carlos Lima")*; *US#04 / FR-005: Busca por termo livre em título, resumo, autor, orientador e tags e filtro com múltiplas tags (conjunção E)* |
| **FR-006** (Ordenação por ano/semestre decrescente e id crescente; busca vazia retorna todos os publicados) | `TccService.buscarPorFiltros` | `tests/buscar-filtrar-tccs.test.js` — *CT05 passo 4 (retorno dos TCCs A, D e C ordenados)*; *FR-006: Pesquisa sem filtros retorna todos os TCCs publicados ordenados do mais recente ao mais antigo* |
| **FR-007** (Mensagem literal de busca sem resultados e nova pesquisa após ajuste de filtros) | `TccController.buscarTccs` | `tests/buscar-filtrar-tccs.test.js` — *CT03 variação (Ano = 2023 e Tag = "Redes")*; *CT05 passos 3 e 4 (FA01: termo "blockchain" + Tag = "Redes" e redefinição de filtros)* |
| **FR-008** (Visualização de detalhes completos, incremento de visualizações e trabalhos conexos `UC06`) | `TCC.registrarVisualizacao`, `TccDTO`, `TccController.visualizarDetalhes`, `TccController.listarTrabalhosConexos`, `TccService.buscarPorId`, `TccService.mapearTrabalhosConexos`, `TccRepository.buscarPorTags` | `tests/buscar-filtrar-tccs.test.js` — *CT03 passo 4 / FR-008: Visualizar detalhes completos do TCC A, incrementar visualizações e listar trabalhos conexos publicados* |
| **FR-009** (Download de arquivo PDF/DOCX/EPUB e tratamento de TCC publicado sem arquivo anexado indicando link do LUME) | `ArquivoTcc`, `FormatoArquivo`, `TccController.baixarArquivo`, `TccService.obterArquivo`, `ArmazenamentoArquivo.transferirArquivo` | `tests/buscar-filtrar-tccs.test.js` — *CT06 passo 4: Download concluído com sucesso*; *FR-009: Tentativa de download de TCC publicado sem arquivo anexado (TCC D) informa link do LUME* |
| **FR-010** (Tratamento de falha de transferência com mensagem literal do `FA02`, sem salvar arquivo incompleto e mantendo página disponível para nova tentativa) | `ArmazenamentoArquivo`, `TccService.obterArquivo`, `TccController.baixarArquivo` | `tests/buscar-filtrar-tccs.test.js` — *CT06 passos 1 a 4: Falha durante o download do artigo (FA02) e repetição com sucesso após restabelecer conexão* |

## Riscos e pontos em aberto

- **Nenhum ponto funcional em aberto:** Todas as dúvidas de escopo e regras de negócio foram sanadas na Fase 2 (Clarify).
- **Cuidado de implementação com mutação de estado nos testes:** Como a persistência é em memória e `visualizarDetalhes` incrementa o contador `visualizacoes` do TCC, cada teste automatizado deve criar sua própria instância isolada da aplicação via `criarApp()` para evitar interferência entre testes.

## Quickstart

### 1. Pré-requisitos

- Node.js 20 ou superior instalado (`node --version`).
- Não é necessário instalar pacotes (`npm install` não é utilizado).

### 2. Executar a suíte de testes automatizados

Na raiz do projeto, execute:

```bash
node --test
```

### 3. Exercitar os cenários da especificação via `src/app.js`

```js
import { criarApp } from './src/app.js';

const { controller, armazenamentoArquivo } = criarApp();

// 1. CT03: Busca combinada (Ano = 2025, Orientador = "Carlos Lima", Tag = "Redes")
const buscaCt03 = controller.buscarTccs({
  ano: 2025,
  orientador: 'Carlos Lima',
  tags: 'Redes',
});
console.log('CT03 resultados:', buscaCt03.resultados.map((t) => t.titulo));

// 2. CT03 passo 4 / FR-008: Visualizar detalhes completos e trabalhos conexos do TCC A (id = 1)
const detalhesTccA = controller.visualizarDetalhes(1);
console.log('Detalhes TCC A:', detalhesTccA);

// 3. CT05 (FA01): Busca sem correspondência ("blockchain" + Tag = "Redes")
const buscaVazia = controller.buscarTccs({
  termo: 'blockchain',
  tags: 'Redes',
});
console.log('CT05 mensagem FA01:', buscaVazia.mensagem);

// 4. CT06 (FA02): Simular falha de conexão no download e repetir após restabelecimento
armazenamentoArquivo.definirConexaoAtiva(false);
const downloadFalho = controller.baixarArquivo(1);
console.log('CT06 erro FA02:', downloadFalho.mensagem);

armazenamentoArquivo.definirConexaoAtiva(true);
const downloadSucesso = controller.baixarArquivo(1);
console.log('CT06 arquivo baixado:', downloadSucesso.arquivo.nomeOriginal);
```

