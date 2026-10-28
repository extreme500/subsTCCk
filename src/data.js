// Dados fictícios usados pelo protótipo.
// Os TCCs "a" a "e" reproduzem exatamente a base de pré-condição do CT03/CT05/CT06.

export const TAGS_SUGERIDAS = [
  'Redes', 'IA', 'Segurança', 'Engenharia de Software', 'Banco de Dados',
  'Computação Gráfica', 'IHC', 'Sistemas Distribuídos', 'Robótica', 'Educação',
  'Visão Computacional', 'Teoria da Computação',
]

export const ORIENTADORES = [
  'Prof. Carlos Lima', 'Profª Ana Reis', 'Prof. Ricardo Mello',
  'Profª Juliana Prates', 'Prof. Eduardo Brandão',
]

export const COLECOES = ['Ciência da Computação', 'Engenharia de Computação']

export const SEMESTRES = ['2026/1', '2025/2', '2025/1', '2024/2', '2024/1', '2023/2', '2023/1']

export const LIMITE_TAGS = 5
export const LIMITE_MIDIAS = 3

export const CONTAS_DEMO = [
  {
    cartao: '00312345', senha: 'demo', papel: 'ALUNO_FORMANDO',
    nome: 'Marina Souza', curso: 'Ciência da Computação', matricula: '00312345',
  },
  {
    cartao: '00012345', senha: 'demo', papel: 'PROFESSOR',
    nome: 'Prof. Carlos Lima', departamento: 'Departamento de Informática Aplicada',
  },
]

const lume = (n) => `https://lume.ufrgs.br/handle/10183/${n}`

export const TCCS_INICIAIS = [
  {
    id: 'a', titulo: 'Detecção de intrusão em redes definidas por software com aprendizado federado',
    autor: 'Lucas Ferreira', autorId: null, orientador: 'Prof. Carlos Lima', coorientador: '',
    ano: 2025, semestre: 1, colecao: 'Ciência da Computação', tags: ['Redes', 'Segurança'],
    status: 'PUBLICADO', visualizacoes: 412, publicadoEm: '2025-07-18', linkLume: lume(290114),
    arquivo: { nome: 'tcc-lucas-ferreira.pdf', formato: 'PDF' },
    resumo: 'Redes definidas por software (SDN) centralizam o controle da rede, o que facilita o monitoramento, mas também cria um alvo atraente para ataques. Este trabalho treina detectores de intrusão diretamente nos switches, sem enviar o tráfego bruto para um servidor central: cada switch aprende localmente e só compartilha os pesos do modelo. Nos experimentos, a detecção ficou 4% abaixo de um modelo centralizado, mas o volume de dados trafegados caiu 92%.',
    midias: [
      { tipo: 'grafo', descricao: 'Topologia SDN usada nos experimentos (12 switches)' },
      { tipo: 'linha', descricao: 'Taxa de detecção por rodada de treinamento federado' },
    ],
  },
  {
    id: 'b', titulo: 'Classificação de sinais de trânsito com redes neurais leves para dispositivos embarcados',
    autor: 'Beatriz Nunes', autorId: null, orientador: 'Prof. Carlos Lima', coorientador: '',
    ano: 2025, semestre: 1, colecao: 'Engenharia de Computação', tags: ['IA', 'Visão Computacional'],
    status: 'PUBLICADO', visualizacoes: 655, publicadoEm: '2025-07-22', linkLume: lume(290377),
    arquivo: { nome: 'tcc-beatriz-nunes.pdf', formato: 'PDF' },
    resumo: 'Como reconhecer placas de trânsito em tempo real num processador de baixo custo? O trabalho compara três arquiteturas de redes neurais compactas e aplica quantização para que o modelo rode em uma placa de 35 dólares a 24 quadros por segundo, mantendo 96% de acurácia no conjunto de testes brasileiro.',
    midias: [
      { tipo: 'barras', descricao: 'Acurácia x latência das três arquiteturas avaliadas' },
      { tipo: 'tela', descricao: 'Protótipo embarcado detectando placas em vídeo' },
    ],
  },
  {
    id: 'c', titulo: 'Roteamento adaptativo em redes veiculares com previsão de mobilidade',
    autor: 'Pedro Antunes', autorId: null, orientador: 'Prof. Carlos Lima', coorientador: 'Profª Ana Reis',
    ano: 2024, semestre: 2, colecao: 'Ciência da Computação', tags: ['Redes', 'IA'],
    status: 'PUBLICADO', visualizacoes: 298, publicadoEm: '2025-01-15', linkLume: lume(285901),
    arquivo: { nome: 'tcc-pedro-antunes.pdf', formato: 'PDF' },
    resumo: 'Em redes veiculares os nós se movem rápido e as rotas quebram com frequência. Este trabalho usa a trajetória recente dos veículos para prever para onde cada um vai e escolher rotas mais estáveis. Em simulações com o mapa de Porto Alegre, a entrega de pacotes aumentou 18%.',
    midias: [
      { tipo: 'grafo', descricao: 'Grafo de conectividade entre veículos em um cruzamento' },
      { tipo: 'linha', descricao: 'Taxa de entrega de pacotes por densidade de veículos' },
    ],
  },
  {
    id: 'd', titulo: 'Medição de latência em redes 5G privadas para aplicações industriais',
    autor: 'Camila Rocha', autorId: null, orientador: 'Profª Ana Reis', coorientador: '',
    ano: 2025, semestre: 1, colecao: 'Engenharia de Computação', tags: ['Redes', 'Sistemas Distribuídos'],
    status: 'PUBLICADO', visualizacoes: 187, publicadoEm: '2025-07-30', linkLume: lume(290512),
    arquivo: { nome: 'tcc-camila-rocha.pdf', formato: 'PDF' },
    resumo: 'Fábricas querem usar 5G privado para controlar robôs sem fio, mas a latência real dessas redes raramente é medida fora do laboratório. O trabalho propõe uma metodologia de medição e a aplica em uma rede piloto, mostrando onde estão os gargalos entre o rádio e o núcleo da rede.',
    midias: [{ tipo: 'barras', descricao: 'Latência média por segmento da rede piloto' }],
  },
  {
    id: 'e', titulo: 'Balanceamento de carga em data centers com planos de dados programáveis',
    autor: 'Rafael Dias', autorId: null, orientador: 'Prof. Carlos Lima', coorientador: '',
    ano: 2025, semestre: 1, colecao: 'Ciência da Computação', tags: ['Redes'],
    status: 'RASCUNHO', visualizacoes: 0, publicadoEm: null, linkLume: 'http://exemplo.com/tcc-123',
    arquivo: null,
    resumo: 'Rascunho: proposta de balanceador de carga implementado diretamente nos switches do data center, aguardando homologação no LUME.',
    midias: [],
  },
  {
    id: 'f', titulo: 'Acessibilidade em ambientes virtuais de aprendizagem: avaliação com usuários cegos',
    autor: 'Isabela Martins', autorId: null, orientador: 'Profª Juliana Prates', coorientador: '',
    ano: 2025, semestre: 2, colecao: 'Ciência da Computação', tags: ['IHC', 'Educação'],
    status: 'PUBLICADO', visualizacoes: 534, publicadoEm: '2026-01-20', linkLume: lume(301245),
    arquivo: { nome: 'tcc-isabela-martins.pdf', formato: 'PDF' },
    resumo: 'Oito estudantes cegos realizaram tarefas comuns no ambiente virtual da universidade usando leitores de tela. O trabalho registra onde cada um travou, classifica 41 problemas de acessibilidade e propõe correções priorizadas, que já foram repassadas à equipe responsável pelo sistema.',
    midias: [
      { tipo: 'barras', descricao: 'Problemas encontrados por categoria (WCAG)' },
      { tipo: 'tela', descricao: 'Tela do AVA com os pontos de falha destacados' },
      { tipo: 'linha', descricao: 'Tempo para concluir cada tarefa, antes e depois das correções' },
    ],
  },
  {
    id: 'g', titulo: 'Geração automática de casos de teste a partir de user stories com modelos de linguagem',
    autor: 'Thiago Becker', autorId: null, orientador: 'Prof. Ricardo Mello', coorientador: '',
    ano: 2025, semestre: 2, colecao: 'Ciência da Computação', tags: ['Engenharia de Software', 'IA'],
    status: 'PUBLICADO', visualizacoes: 801, publicadoEm: '2026-01-28', linkLume: lume(301390),
    arquivo: { nome: 'tcc-thiago-becker.pdf', formato: 'PDF' },
    resumo: 'Modelos de linguagem conseguem escrever casos de teste a partir de uma user story, mas eles cobrem os cenários certos? O trabalho compara testes gerados por três modelos com testes escritos por desenvolvedores em 60 histórias reais e mostra que a IA cobre bem o caminho feliz, mas esquece metade das situações-limite.',
    midias: [
      { tipo: 'barras', descricao: 'Cobertura de critérios de aceitação por modelo' },
      { tipo: 'grafo', descricao: 'Pipeline: user story → prompt → casos de teste → revisão humana' },
    ],
  },
  {
    id: 'h', titulo: 'Consenso tolerante a falhas bizantinas em blockchains permissionadas',
    autor: 'Gustavo Pinheiro', autorId: null, orientador: 'Profª Ana Reis', coorientador: '',
    ano: 2024, semestre: 1, colecao: 'Ciência da Computação', tags: ['Sistemas Distribuídos', 'Segurança'],
    status: 'PUBLICADO', visualizacoes: 366, publicadoEm: '2024-08-02', linkLume: lume(279044),
    arquivo: { nome: 'tcc-gustavo-pinheiro.pdf', formato: 'PDF' },
    resumo: 'Blockchains permissionadas, usadas entre empresas conhecidas, não precisam de mineração, mas ainda precisam que os participantes concordem mesmo com alguns deles agindo de má-fé. O trabalho implementa e compara dois protocolos de consenso e mede quanto cada um degrada quando até um terço dos nós falha.',
    midias: [{ tipo: 'linha', descricao: 'Vazão do protocolo conforme aumenta o número de nós faltosos' }],
  },
  {
    id: 'i', titulo: 'Renderização neural de cenas urbanas a partir de imagens de drone',
    autor: 'Larissa Teixeira', autorId: null, orientador: 'Prof. Eduardo Brandão', coorientador: '',
    ano: 2025, semestre: 2, colecao: 'Ciência da Computação', tags: ['Computação Gráfica', 'Visão Computacional'],
    status: 'PUBLICADO', visualizacoes: 479, publicadoEm: '2026-02-05', linkLume: lume(301702),
    arquivo: { nome: 'tcc-larissa-teixeira.pdf', formato: 'PDF' },
    resumo: 'Com cerca de 200 fotos tiradas por um drone, é possível reconstruir um quarteirão em 3D e navegar por ele. O trabalho adapta uma técnica de renderização neural para cenas grandes e ao ar livre e reduz o tempo de treinamento de 9 horas para 50 minutos.',
    midias: [
      { tipo: 'tela', descricao: 'Vista reconstruída do Campus do Vale' },
      { tipo: 'linha', descricao: 'Qualidade da imagem (PSNR) por tempo de treinamento' },
    ],
  },
  {
    id: 'j', titulo: 'Otimização de consultas em bancos de grafos para redes de colaboração acadêmica',
    autor: 'Felipe Moraes', autorId: null, orientador: 'Profª Juliana Prates', coorientador: 'Prof. Ricardo Mello',
    ano: 2024, semestre: 2, colecao: 'Ciência da Computação', tags: ['Banco de Dados'],
    status: 'PUBLICADO', visualizacoes: 221, publicadoEm: '2025-01-27', linkLume: lume(286033),
    arquivo: { nome: 'tcc-felipe-moraes.pdf', formato: 'PDF' },
    resumo: 'Quem já trabalhou com quem? Perguntas assim ficam lentas em bancos relacionais quando a rede de coautoria cresce. O trabalho modela publicações do instituto como um grafo e propõe índices que tornam as consultas de caminho até 30 vezes mais rápidas.',
    midias: [{ tipo: 'grafo', descricao: 'Rede de coautoria do instituto (amostra)' }],
  },
  {
    id: 'k', titulo: 'Navegação autônoma de robôs em ambientes internos com SLAM visual',
    autor: 'Vinícius Kunz', autorId: null, orientador: 'Prof. Ricardo Mello', coorientador: '',
    ano: 2023, semestre: 2, colecao: 'Engenharia de Computação', tags: ['Robótica', 'IA'],
    status: 'PUBLICADO', visualizacoes: 342, publicadoEm: '2024-01-19', linkLume: lume(271880),
    arquivo: { nome: 'tcc-vinicius-kunz.pdf', formato: 'PDF' },
    resumo: 'Um robô de serviço precisa saber onde está e montar o mapa do prédio ao mesmo tempo. O trabalho integra uma câmera de profundidade a um algoritmo de SLAM visual e testa o robô nos corredores do instituto, com erro médio de posição de 7 cm.',
    midias: [
      { tipo: 'grafo', descricao: 'Mapa gerado do 2º andar do prédio 43424' },
      { tipo: 'linha', descricao: 'Erro de posição ao longo do percurso' },
    ],
  },
  {
    id: 'l', titulo: 'Análise de vulnerabilidades em contratos inteligentes com execução simbólica',
    autor: 'Júlia Castro', autorId: null, orientador: 'Prof. Carlos Lima', coorientador: '',
    ano: 2025, semestre: 2, colecao: 'Ciência da Computação', tags: ['Segurança', 'Engenharia de Software'],
    status: 'PUBLICADO', visualizacoes: 590, publicadoEm: '2026-02-11', linkLume: lume(301815),
    arquivo: { nome: 'tcc-julia-castro.pdf', formato: 'PDF' },
    resumo: 'Contratos inteligentes não podem ser corrigidos depois de publicados, então um erro pode custar caro. A ferramenta desenvolvida explora automaticamente os caminhos de execução de um contrato e encontrou 23 vulnerabilidades conhecidas em 500 contratos públicos, com 4 falsos positivos.',
    midias: [{ tipo: 'barras', descricao: 'Vulnerabilidades encontradas por categoria' }],
  },
]
