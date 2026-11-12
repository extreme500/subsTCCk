# Transcrição textual dos diagramas UML (Etapa 1)

Transcrição fiel das imagens desta pasta, para leitura sem depender da imagem. Nada foi corrigido: o que estiver inconsistente nas imagens também está aqui.

## Diagrama de Casos de Uso (`casos-de-uso.png`)

Sistema: "Plataforma Mobile de TCCs".

- Atores: Usuário Leitor, Aluno Formando, Professor, Aluno Pesquisador; ator externo «Serviço Externo» Sistema LUME.
- Professor e Aluno Pesquisador generalizam Usuário Leitor (herança).
- Usuário Leitor → UC04: Buscar e Filtrar TCCs; Usuário Leitor → UC05: Visualizar Detalhes do TCC.
- UC06: Mapear Trabalhos Conexos «extend» UC05.
- Aluno Formando → UC01: Cadastrar TCC; Aluno Formando → UC02: Editar TCC.
- UC01 «include» UC03: Validar Link do LUME; UC02 «include» UC03.
- UC03 → Sistema LUME.

## Diagrama de Classes (`classes.png`)

Domínio (model):

- `Usuario` «abstract»: `- id: int`, `- nome: String`, `- email: String`, `- loginInstitucional: String`.
- `Professor` (herda de Usuario): `- departamento: String`.
- `AlunoFormando` (herda de Usuario): `- matricula: String`.
- `TCC`: `- id: int`, `- titulo: String`, `- resumoSimplificado: String`, `- ano: int`, `- semestre: int`, `- linkLume: String`, `- status: StatusTcc`, `- visualizacoes: int`; métodos `+ publicar(): void`, `+ salvarRascunho(): void`, `+ validarCamposObrigatorios(): bool`, `+ registrarVisualizacao(): void`.
- `Tag`: `- id: int`, `- nome: String`.
- `Area`: `- id: int`, `- nome: String`.
- `Midia`: `- id: int`, `- caminhoUrl: String`, `- descricao: String`.
- `ArquivoTcc`: `- nomeOriginal: String`, `- formato: FormatoArquivo`, `- caminho: String`.
- `FormatoArquivo` «Enumeration»: DOCX, PDF, EPUB.
- `StatusTcc` «Enumeration»: RASCUNHO, PUBLICADO.

Relações do domínio:

- TCC (0..n) — Professor (1..2), associação "Relation" (orientador e coorientador).
- TCC (0..n) — AlunoFormando (1), associação "Relation" (autor).
- TCC ◇— Tag (1..5), agregação "Relation".
- Tag (0..n) ◇— Area (0..1), agregação.
- TCC ◆— Midia (0..3), composição.
- TCC ◆— ArquivoTcc (0..1), composição.

DTOs:

- `TccDTO`: `+ id: int`, `+ titulo: String`, `+ resumoSimplificado`, `+ ano: int`, `+ semestre: int`, `+ autor: String`, `+ orientador: String`, `+ tags: String`.
- `FeedDTO`: `+ tccsRecentes: TccDTO`, `+ tagsEmAlta: String`.
- `FiltroBusca`: `+ termo: String`, `+ ano: int`, `+ autor: String`, `+ orientador: String`, `+ tags: String`.

Controller e serviços:

- `TccController`: `+ buscarTccs(filtro: FiltroBusca): List<TccDTO>`, `+ visualizarDetalhes(id: int): TccDTO`, `+ baixarArquivo(id: int): File`, `+ obterFeedDestaques(): FeedDTO`, `+ listarTrabalhosConexos(id: int): List<TccDTO>`, `+ cadastrarTcc(dados: TccDTO): TccDTO`, `+ editarTcc(id: int, dados: TccDTO): TccDTO`.
- `TccService`: `+ cadastrarTCC(tcc: TCC): TCC`, `+ salvarRascunho(tcc: TCC): TCC`, `+ editarTCC(id: int, dados: TCC): TCC`, `+ buscarPorFiltros(filtro: FiltroBusca): List<TCC>`, `+ buscarPorId(id: int): TCC`, `+ obterArquivo(id: int): ArquivoTcc`, `+ listarMaisRecentes(limite: int): List<TCC>`, `+ listarTagsMaisExploradas(dias: int): List<Tag>`, `+ mapearTrabalhosConexos(id: int): List<TCC>`.
- `ValidadorLumeService`: `+ validarIntegridadeLink(link: Url): bool`.

Repositórios («interface»):

- `TccRepository`: `+ salvarTcc(tcc: TCC): void`, `+ buscarPorId(id: int): TCC`, `+ buscarPorFiltros(filtros: FiltroBusca): List<TCC>`, `+ buscarMaisRecentes(limite: int): List<TCC>`, `+ buscarPorTags(tags: List<Tag>): List<TCC>`.
- `TagRepository`: `+ buscarMaisExploradas(dias: int): List<Tag>`.

Dependências ("Use", tracejadas):

- TccController → TccService; TccController → FiltroBusca.
- TccService → TCC; TccService → TccRepository; TccService → TagRepository; TccService → ValidadorLumeService.
- TccRepository → FiltroBusca.

## Diagrama de Pacotes (`pacotes.png`)

Legenda de camadas: Apresentação (amarelo), Negócio (azul), Dados (roxo), Domínio (verde), component.

- `controller` (Apresentação): TccController.
- `dto` (Apresentação): TccDTO, FeedDTO, FiltroBusca.
- `service` (Negócio): TccService, ValidadorLumeService.
- `repository` (Dados): TccRepository, TagRepository.
- `model` (Domínio): Usuario, Professor, AlunoFormando, TCC, Tag, Area, Midia, ArquivoTCC, StatusTcc, FormatoArquivo.
- Componente «sistema externo» LUME.
- Dependências "use": controller → service; controller → dto; service → repository; service → dto; service → model; service → LUME; repository → model; repository → dto.

## Diagrama de Sequência (`sequencia-uc01.png`), interação do UC01 (Cadastrar TCC)

Linhas de vida: AlunoFormando, TccController, TccService, ValidadorLumeService, LUME, TccRepository.

1. AlunoFormando → TccController: `cadastrarTcc(dados)`.
2. TccController → TccService: `cadastrarTcc(tcc)`.
3. TccService → TccService: `validarCamposObrigatorios()`.
4. TccService → ValidadorLumeService: `validarIntegridadeLink(link)`.
5. ValidadorLumeService → LUME: `checaURL`.
6. TccRepository - - > LUME: `status` (retorno tracejado).
7. LUME - - > ValidadorLumeService: `return`.
8. ValidadorLumeService - - > TccService: `bool`.
9. Fragmento `alt [válido]`: TccService → TccService: `publicar()`; TccService → TccRepository: `salvarTcc(tcc)`; TccService - - > TccController: `TCC`; TccController - - > AlunoFormando: `TccDTO (sucesso)`.
10. Fragmento `alt [inválido]`: TccService - - > TccController: `erro de link`; TccController - - > AlunoFormando: `oferece rascunho`.

## Diagramas de Atividades

- `atividades-uc01.png` (UC01 - Cadastrar TCC). Raias: Visitante Externo, Aluno Graduando, Sistema, Professor, Repositório LUME. O fluxo: solicitar login, autenticação, exibir tela de cadastro, abrir formulário "Novo TCC", preencher dados/tags/mídias/URL do LUME, clicar em "Publicar TCC". Depois vem a decisão "Preenchimento correto?": se não, o sistema exibe "Preencha todos os campos obrigatórios corretamente" e volta ao preenchimento; se sim, segue para "Requisitar checagem de URL", que leva a "Checar existência e status do link" (LUME) e à decisão "LUME válido?". Se não, aparece "A URL informada não pertence ao domínio do LUME" e a decisão "Deseja salvar como rascunho?" (não volta ao preenchimento; sim vai ao fim). Se sim, o fluxo segue "Retornar status da validação", "Indexar TCC e publicar no feed" e um fork para "Consultar TCCs" nas raias Visitante, Aluno, Professor e LUME, até o fim.
- `atividades-uc04.png` (UC04 - Buscar e Filtrar TCCs). Raias: Usuário Leitor (Aluno Pesquisador, Professor ou Visitante), Sistema, Armazenamento de Arquivos. O fluxo: selecionar "Buscar TCC", exibir barra e filtros, inserir termos/filtros (Ano, Autor, Orientador, Tags), clicar em "Pesquisar" e aplicar todos os filtros simultaneamente (somente TCCs PUBLICADOS). Na decisão "Há trabalhos compatíveis?", se não, o sistema exibe "Nenhum trabalho encontrado para os critérios informados" e volta à inserção de termos; se sim, exibe os resultados em forma de feed. Em seguida: selecionar trabalho, exibir detalhes (resumo, imagens, tags e trabalhos conexos), clicar em "Baixar Artigo", requisitar arquivo e transferir arquivo (DOCX, PDF ou EPUB). Na decisão "Transferência concluída?", se não, o sistema exibe "Ocorreu um erro durante o download, verifique a sua conexão" e volta a "Baixar Artigo"; se sim, salva o arquivo no dispositivo e chega ao fim.
