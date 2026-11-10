import { AlunoFormando } from '../model/AlunoFormando.js';
import { Professor } from '../model/Professor.js';
import { Area } from '../model/Area.js';
import { Tag } from '../model/Tag.js';
import { Midia } from '../model/Midia.js';
import { ArquivoTcc } from '../model/ArquivoTcc.js';
import { FormatoArquivo } from '../model/FormatoArquivo.js';
import { StatusTcc } from '../model/StatusTcc.js';
import { TCC } from '../model/TCC.js';

export function criarDadosIniciais() {
  const areaComputacao = new Area({ id: 1, nome: 'Computação' });

  const tagRedes = new Tag({ id: 1, nome: 'Redes', area: areaComputacao });
  const tagIA = new Tag({ id: 2, nome: 'IA', area: areaComputacao });
  const tagSeguranca = new Tag({ id: 3, nome: 'Segurança', area: areaComputacao });

  const profCarlosLima = new Professor({
    id: 201,
    nome: 'Profº Carlos Lima',
    email: 'carlos.lima@inf.ufrgs.br',
    loginInstitucional: 'carlos.lima',
    departamento: 'Departamento de Informática Aplicada',
  });

  const profAnaReis = new Professor({
    id: 202,
    nome: 'Profª Ana Reis',
    email: 'ana.reis@inf.ufrgs.br',
    loginInstitucional: 'ana.reis',
    departamento: 'Departamento de Informática Teórica',
  });

  const alunoA = new AlunoFormando({
    id: 101,
    nome: 'João Silva',
    email: 'joao.silva@ufrgs.br',
    loginInstitucional: '00310001',
    matricula: '00310001',
  });

  const alunoB = new AlunoFormando({
    id: 102,
    nome: 'Maria Souza',
    email: 'maria.souza@ufrgs.br',
    loginInstitucional: '00310002',
    matricula: '00310002',
  });

  const alunoC = new AlunoFormando({
    id: 103,
    nome: 'Pedro Santos',
    email: 'pedro.santos@ufrgs.br',
    loginInstitucional: '00310003',
    matricula: '00310003',
  });

  const alunoD = new AlunoFormando({
    id: 104,
    nome: 'Lucas Oliveira',
    email: 'lucas.oliveira@ufrgs.br',
    loginInstitucional: '00310004',
    matricula: '00310004',
  });

  const alunoE = new AlunoFormando({
    id: 105,
    nome: 'Carla Mendes',
    email: 'carla.mendes@ufrgs.br',
    loginInstitucional: '00310005',
    matricula: '00310005',
  });

  // TCC A: 2025/1 | Profº Carlos Lima | Redes | Publicado (CT03, CT05, CT06)
  const tccA = new TCC({
    id: 1,
    titulo: 'Detecção de anomalias em redes veiculares',
    resumoSimplificado:
      'Estudo e implementação de mecanismos para detecção de anomalias de tráfego em redes veiculares.',
    ano: 2025,
    semestre: 1,
    linkLume: 'https://lume.ufrgs.br/handle/10183/100001',
    status: StatusTcc.PUBLICADO,
    visualizacoes: 0,
    autor: alunoA,
    orientador: profCarlosLima,
    coorientador: profAnaReis,
    tags: [tagRedes, tagSeguranca],
    midias: [
      new Midia({
        id: 1,
        caminhoUrl: 'https://lume.ufrgs.br/midias/tcc-a-topologia.png',
        descricao: 'Topologia da rede veicular avaliada',
      }),
      new Midia({
        id: 2,
        caminhoUrl: 'https://lume.ufrgs.br/midias/tcc-a-resultados.png',
        descricao: 'Gráfico de precisão na detecção de anomalias',
      }),
    ],
    arquivo: new ArquivoTcc({
      nomeOriginal: 'tcc-a-deteccao-anomalias-redes-veiculares.pdf',
      formato: FormatoArquivo.PDF,
      caminho: '/acervo/2025-1/tcc-a-deteccao-anomalias-redes-veiculares.pdf',
      conteudo: '%PDF-1.7 Conteúdo integral do artigo do TCC A (Detecção de anomalias em redes veiculares)',
    }),
  });

  // TCC B: 2025/1 | Profº Carlos Lima | IA | Publicado (CT03, CT05)
  const tccB = new TCC({
    id: 2,
    titulo: 'Modelos preditivos aplicados à triagem clínica',
    resumoSimplificado:
      'Avaliação de algoritmos de inteligência artificial para apoio à triagem hospitalar.',
    ano: 2025,
    semestre: 1,
    linkLume: 'https://lume.ufrgs.br/handle/10183/100002',
    status: StatusTcc.PUBLICADO,
    visualizacoes: 0,
    autor: alunoB,
    orientador: profCarlosLima,
    coorientador: null,
    tags: [tagIA],
    midias: [],
    arquivo: new ArquivoTcc({
      nomeOriginal: 'tcc-b-modelos-preditivos-ia.pdf',
      formato: FormatoArquivo.PDF,
      caminho: '/acervo/2025-1/tcc-b-modelos-preditivos-ia.pdf',
      conteudo: '%PDF-1.7 Conteúdo integral do artigo do TCC B',
    }),
  });

  // TCC C: 2024/2 | Profº Carlos Lima | Redes | Publicado (CT03, CT05)
  const tccC = new TCC({
    id: 3,
    titulo: 'Análise de desempenho em redes definidas por software',
    resumoSimplificado:
      'Investigação experimental de latência e vazão em arquiteturas SDN para centros de dados.',
    ano: 2024,
    semestre: 2,
    linkLume: 'https://lume.ufrgs.br/handle/10183/100003',
    status: StatusTcc.PUBLICADO,
    visualizacoes: 0,
    autor: alunoC,
    orientador: profCarlosLima,
    coorientador: null,
    tags: [tagRedes],
    midias: [],
    arquivo: new ArquivoTcc({
      nomeOriginal: 'tcc-c-desempenho-sdn.pdf',
      formato: FormatoArquivo.PDF,
      caminho: '/acervo/2024-2/tcc-c-desempenho-sdn.pdf',
      conteudo: '%PDF-1.7 Conteúdo integral do artigo do TCC C',
    }),
  });

  // TCC D: 2025/1 | Profª Ana Reis | Redes | Publicado (CT03, CT05, e FR-009 sem arquivo próprio anexado)
  const tccD = new TCC({
    id: 4,
    titulo: 'Protocolos de roteamento para redes de sensores sem fio',
    resumoSimplificado:
      'Comparação de consumo energético entre protocolos de roteamento hierárquicos em IoT.',
    ano: 2025,
    semestre: 1,
    linkLume: 'https://lume.ufrgs.br/handle/10183/100004',
    status: StatusTcc.PUBLICADO,
    visualizacoes: 0,
    autor: alunoD,
    orientador: profAnaReis,
    coorientador: null,
    tags: [tagRedes],
    midias: [],
    arquivo: null,
  });

  // TCC E: 2025/1 | Profº Carlos Lima | Redes | Rascunho (CT03, CT05 e variação)
  const tccE = new TCC({
    id: 5,
    titulo: 'Segurança e consenso em redes locais corporativas',
    resumoSimplificado:
      'Rascunho de pesquisa sobre mecanismos de controle de acesso em redes locais.',
    ano: 2025,
    semestre: 1,
    linkLume: '',
    status: StatusTcc.RASCUNHO,
    visualizacoes: 0,
    autor: alunoE,
    orientador: profCarlosLima,
    coorientador: null,
    tags: [tagRedes],
    midias: [],
    arquivo: new ArquivoTcc({
      nomeOriginal: 'tcc-e-rascunho.pdf',
      formato: FormatoArquivo.PDF,
      caminho: '/acervo/2025-1/tcc-e-rascunho.pdf',
      conteudo: '%PDF-1.7 Conteúdo do rascunho TCC E',
    }),
  });

  return [tccA, tccB, tccC, tccD, tccE];
}

