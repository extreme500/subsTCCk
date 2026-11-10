import { TCC } from '../model/TCC.js';
import { Tag } from '../model/Tag.js';
import { Midia } from '../model/Midia.js';
import { ArquivoTcc } from '../model/ArquivoTcc.js';
import { Professor } from '../model/Professor.js';
import { AlunoFormando } from '../model/AlunoFormando.js';
import { StatusTcc } from '../model/StatusTcc.js';
import { FormatoArquivo } from '../model/FormatoArquivo.js';

// Dados iniciais: TCCs A a E do CT03 (ano/semestre, orientador, tag e status literais do
// relatório). Títulos, autores, resumos e conteúdos são fictícios; nenhum TCC contém
// "blockchain" (pré-condição do CT05). A tem PDF (CT06); D não tem arquivo (FR-015a).
// Origem: CT03, CT05, CT06.

export const IDS_CT03 = Object.freeze({ A: 1, B: 2, C: 3, D: 4, E: 5 });

export const COLECAO_PADRAO = 'Ciência da Computação';

const codificador = new TextEncoder();

function conteudoFicticio(cabecalho, descricao) {
  return codificador.encode(
    `${cabecalho}\n% Arquivo fictício do ${descricao} para o experimento de SDD.\n` +
      '% Conteúdo com vários blocos de transferência.\n%%FIM\n',
  );
}

export function criarDadosIniciais() {
  const carlosLima = new Professor({
    id: 101, nome: 'Profº Carlos Lima', email: 'carlos.lima@inf.ufrgs.br',
    loginInstitucional: 'clima', departamento: 'Informática Aplicada',
  });
  const anaReis = new Professor({
    id: 102, nome: 'Profª Ana Reis', email: 'ana.reis@inf.ufrgs.br',
    loginInstitucional: 'areis', departamento: 'Informática Teórica',
  });

  const aluno = (id, nome, matricula) =>
    new AlunoFormando({ id, nome, email: `${matricula}@inf.ufrgs.br`, loginInstitucional: matricula, matricula });

  const redes = () => new Tag({ id: 1, nome: 'Redes' });
  const ia = () => new Tag({ id: 2, nome: 'IA' });

  const arquivos = new Map([
    ['arquivos/tcc-a.pdf', conteudoFicticio('%PDF-1.4', 'TCC A')],
    ['arquivos/tcc-b.docx', conteudoFicticio('PK DOCX', 'TCC B')],
    ['arquivos/tcc-c.epub', conteudoFicticio('PK EPUB', 'TCC C')],
    ['arquivos/tcc-e.pdf', conteudoFicticio('%PDF-1.4', 'TCC E')],
  ]);

  const tccs = [
    new TCC({
      id: IDS_CT03.A,
      titulo: 'Detecção de anomalias em redes veiculares',
      resumoSimplificado: 'Identifica comportamentos anômalos na comunicação entre veículos conectados.',
      ano: 2025, semestre: 1,
      linkLume: 'https://lume.ufrgs.br/handle/10183/900001',
      status: StatusTcc.PUBLICADO,
      colecao: COLECAO_PADRAO,
      autor: aluno(201, 'Mariana Souza', '00300001'),
      orientador: carlosLima,
      tags: [redes()],
      midias: [
        new Midia({ id: 1, caminhoUrl: 'midias/tcc-a-arquitetura.png', descricao: 'Arquitetura da solução' }),
        new Midia({ id: 2, caminhoUrl: 'midias/tcc-a-resultados.png', descricao: 'Resultados dos experimentos' }),
      ],
      arquivo: new ArquivoTcc({ nomeOriginal: 'tcc-a.pdf', formato: FormatoArquivo.PDF, caminho: 'arquivos/tcc-a.pdf' }),
    }),
    new TCC({
      id: IDS_CT03.B,
      titulo: 'Aprendizado de máquina para triagem de chamados',
      resumoSimplificado: 'Classifica automaticamente chamados de suporte técnico por prioridade.',
      ano: 2025, semestre: 1,
      linkLume: 'https://lume.ufrgs.br/handle/10183/900002',
      status: StatusTcc.PUBLICADO,
      colecao: COLECAO_PADRAO,
      autor: aluno(202, 'Pedro Alves', '00300002'),
      orientador: carlosLima,
      tags: [ia()],
      arquivo: new ArquivoTcc({ nomeOriginal: 'tcc-b.docx', formato: FormatoArquivo.DOCX, caminho: 'arquivos/tcc-b.docx' }),
    }),
    new TCC({
      id: IDS_CT03.C,
      titulo: 'Roteamento em redes definidas por software',
      resumoSimplificado: 'Avalia estratégias de roteamento programável em redes de campus.',
      ano: 2024, semestre: 2,
      linkLume: 'https://lume.ufrgs.br/handle/10183/900003',
      status: StatusTcc.PUBLICADO,
      colecao: COLECAO_PADRAO,
      autor: aluno(203, 'Juliana Costa', '00300003'),
      orientador: carlosLima,
      tags: [redes()],
      arquivo: new ArquivoTcc({ nomeOriginal: 'tcc-c.epub', formato: FormatoArquivo.EPUB, caminho: 'arquivos/tcc-c.epub' }),
    }),
    new TCC({
      id: IDS_CT03.D,
      titulo: 'Protocolos de comunicação para Internet das Coisas',
      resumoSimplificado: 'Compara protocolos leves de comunicação para dispositivos com poucos recursos.',
      ano: 2025, semestre: 1,
      linkLume: 'https://lume.ufrgs.br/handle/10183/900004',
      status: StatusTcc.PUBLICADO,
      colecao: COLECAO_PADRAO,
      autor: aluno(204, 'Rafael Mendes', '00300004'),
      orientador: anaReis,
      tags: [redes()],
      arquivo: null,
    }),
    new TCC({
      id: IDS_CT03.E,
      titulo: 'Monitoramento de tráfego em redes 5G',
      resumoSimplificado: 'Propõe métricas para acompanhar o tráfego em redes móveis de quinta geração.',
      ano: 2025, semestre: 1,
      linkLume: 'https://lume.ufrgs.br/handle/10183/900005',
      status: StatusTcc.RASCUNHO,
      colecao: COLECAO_PADRAO,
      autor: aluno(205, 'Lucas Ferreira', '00300005'),
      orientador: carlosLima,
      tags: [redes()],
      arquivo: new ArquivoTcc({ nomeOriginal: 'tcc-e.pdf', formato: FormatoArquivo.PDF, caminho: 'arquivos/tcc-e.pdf' }),
    }),
  ];

  return { tccs, arquivos };
}
