# subsTCCk

Protótipo de alta fidelidade do trabalho prático de **INF01127 – Engenharia de Software** (Instituto de Informática, UFRGS):
**Tornar TCCs de computação visíveis, relacionados e úteis**.

**Protótipo online:** https://extreme500.github.io/subsTCCk/

Grupo: Andriele Joras dos Santos, Gabriel Pieruccini Knopp e Vitor Feijó. Professora: Leticia Santos Machado.

## Funcionalidades prototipadas

| Funcionalidade | Requisito / caso de uso | Onde está no protótipo |
|---|---|---|
| Cadastro e edição de TCC | RF#01, US#01, UC01, UC02, UC03 | Entrar como aluno → **Cadastrar TCC** / **Meu perfil** |
| Busca, filtragem e feed de descoberta | RF#02, US#04, UC04, UC05, UC06 | **Descobrir** (feed), **Buscar TCC**, página do TCC |

Os dados são fictícios e ficam salvos no navegador (`localStorage`). Não há servidor: a validação do link do LUME e o download são simulados.

## Como demonstrar os casos de teste

O botão **Demonstração** (canto inferior esquerdo) simula o LUME indisponível e a falha de download, restaura os dados iniciais e mostra o roteiro abaixo. A base inicial já contém os TCCs A a E usados no CT03.

| Caso | Como executar |
|---|---|
| CT01 | Entrar como Aluno Formando → Cadastrar TCC com link `https://lume.ufrgs.br/handle/10183/299999` → "TCC publicado com sucesso!" |
| CT02 | Mesmo cadastro com o link `http://exemplo.com/tcc-123` → aviso do LUME → "Salvar como rascunho" |
| CT03 | Buscar TCC → Ano 2025 + Orientador Prof. Carlos Lima + Tag Redes → apenas o TCC A |
| CT04 | No cadastro, tentar a 6ª tag e a 4ª imagem; deixar o Resumo vazio e publicar |
| CT05 | Buscar `blockchain` com a tag Redes → mensagem de nenhum resultado |
| CT06 | Ligar "Simular falha no download" → abrir um TCC → Baixar Artigo |

Contas de demonstração (senha `demo`): Aluno Formando `00312345`, Professor `00012345`. Também é possível navegar como visitante, sem login.

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:5173/subsTCCk/
npm run build    # gera dist/
```

O deploy no GitHub Pages é feito automaticamente pelo workflow `.github/workflows/deploy.yml` a cada push na `main`.

## Estrutura

```
src/
  data.js            dados fictícios (TCCs, orientadores, tags, contas)
  lib.js             regras de negócio: busca, validações, LUME, download (≈ TccService)
  App.jsx            rotas, cabeçalho, navegação e painel de demonstração
  views/             Feed, Busca, Detalhe, Formulario (cadastro/edição), Perfil, Entrar
  components/        cartões, modal, ícones e ilustrações geradas
docs/diagramas/      diagrama de atividades do UC04 (.drawio editável, .png e .svg)
```

O relatório está em `Desafio Engenharia Software.docx` (versão do grupo) e `Desafio Engenharia Software (revisado).docx` (com as revisões da etapa 1).
