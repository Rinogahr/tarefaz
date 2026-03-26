import { criarTarefaController } from '../src/modules/tarefa/controller/tarefa-controller';
import { TarefaRepository } from '../src/modules/tarefa/model/tarefa-repository';

describe('tarefa-controller', () => {
  const tarefasBase = [
    {
      id: 1,
      titulo: 'Academia',
      descricao: 'Treino de perna',
      dataInicio: '2026-03-20T08:00:00',
      dataFim: '2026-03-20T09:00:00',
      feito: false,
      usuario: [{ id: 1, name: 'Admin', dados: 'admin@teste.com', photpth: 'foto.png' }],
    },
    {
      id: 2,
      titulo: 'Revisar PR',
      descricao: 'Analisar merge request',
      dataInicio: '2026-03-21T10:00:00',
      dataFim: '2026-03-21T12:00:00',
      feito: false,
      usuario: [{ id: 2, name: 'Maria', dados: 'maria@teste.com', photpth: 'foto2.png' }],
    },
  ];

  const criarRepositoryMock = (): jest.Mocked<TarefaRepository> => ({
    buscarTarefas: jest.fn(async () => tarefasBase),
    criarTarefa: jest.fn(async ({ payload }) => ({ id: 3, ...payload })),
    atualizarTarefa: jest.fn(async ({ tarefaId, payload }) => ({
      ...(tarefasBase.find((tarefa) => String(tarefa.id) === String(tarefaId)) ?? tarefasBase[0]),
      ...payload,
    })),
    excluirTarefa: jest.fn(async () => undefined),
  });

  test('filtra tarefas por usuário', async () => {
    const tarefaController = criarTarefaController({
      tarefaRepository: criarRepositoryMock(),
    });

    const tarefasUsuario = await tarefaController.buscarTarefasPorUsuario({ usuarioId: 1 });

    expect(tarefasUsuario).toHaveLength(1);
    expect(tarefasUsuario[0]?.id).toBe(1);
  });

  test('retorna usuários registrados sem duplicidade', async () => {
    const tarefaController = criarTarefaController({
      tarefaRepository: criarRepositoryMock(),
    });

    const usuarios = await tarefaController.buscarUsuariosRegistrados();

    expect(usuarios).toHaveLength(2);
    expect(usuarios.map((usuario) => usuario.id)).toEqual([1, 2]);
  });

  test('marca tarefa como concluída', async () => {
    const tarefaRepository = criarRepositoryMock();
    const tarefaController = criarTarefaController({
      tarefaRepository,
    });

    const response = await tarefaController.marcarComoConcluida({
      tarefa: tarefasBase[0],
    });

    const chamadaAtualizacao = tarefaRepository.atualizarTarefa.mock.calls[0]?.[0];
    expect(chamadaAtualizacao?.payload.feito).toBe(true);
    expect(response.feito).toBe(true);
  });
});
