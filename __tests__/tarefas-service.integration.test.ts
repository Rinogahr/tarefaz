import { buscarTarefas, criarTarefa, excluirTarefa } from '../src/services/tarefas-service';

describe('tarefas-service integração', () => {
  const fetchOriginal = globalThis.fetch;

  const definirFetchGlobal = ({ fetcher }: { fetcher: typeof fetch }): void => {
    Object.defineProperty(globalThis, 'fetch', {
      value: fetcher,
      writable: true,
      configurable: true,
    });
  };

  const criarResposta = ({ status, payload }: { status: number; payload: unknown }): Response =>
    ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => payload,
    }) as Response;

  afterAll(() => {
    if (fetchOriginal) {
      definirFetchGlobal({ fetcher: fetchOriginal });
      return;
    }

    Reflect.deleteProperty(globalThis, 'fetch');
  });

  test('usa fallback local quando API falha', async () => {
    const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>(async () => {
      throw new Error('offline');
    });
    definirFetchGlobal({ fetcher: fetchMock });

    const tarefas = await buscarTarefas();

    expect(fetchMock).toHaveBeenCalled();
    expect(tarefas.length).toBeGreaterThan(0);
    expect(tarefas[0]).toHaveProperty('titulo');
  });

  test('cria tarefa com próximo id', async () => {
    const payloadTarefas = [
      {
        id: 2,
        titulo: 'Tarefa antiga',
        descricao: 'Descrição',
        dataInicio: '2026-03-20T08:00:00',
        dataFim: '2026-03-20T09:00:00',
        feito: false,
        usuario: [{ id: 1, name: 'Admin', dados: 'admin@teste.com', photpth: 'foto.png' }],
      },
      {
        id: 5,
        titulo: 'Outra tarefa',
        descricao: 'Descrição 2',
        dataInicio: '2026-03-21T08:00:00',
        dataFim: '2026-03-21T09:00:00',
        feito: false,
        usuario: [{ id: 2, name: 'Maria', dados: 'maria@teste.com', photpth: 'foto2.png' }],
      },
    ];

    const responsePost = {
      id: 6,
      titulo: 'Nova tarefa',
      descricao: 'Nova descrição',
      dataInicio: '2026-03-22T08:00:00',
      dataFim: '2026-03-22T09:00:00',
      feito: false,
      usuario: [{ id: 1, name: 'Admin', dados: 'admin@teste.com', photpth: 'foto.png' }],
    };

    const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>(async (input, init) => {
      const url = String(input);
      if (init?.method === 'GET' && url.endsWith('/tarefasDiarias')) {
        return criarResposta({ status: 200, payload: payloadTarefas });
      }

      if (init?.method === 'POST' && url.endsWith('/tarefasDiarias')) {
        return criarResposta({ status: 201, payload: responsePost });
      }

      return criarResposta({ status: 404, payload: { message: 'not found' } });
    });
    definirFetchGlobal({ fetcher: fetchMock });

    const tarefaCriada = await criarTarefa({
      payload: {
        titulo: 'Nova tarefa',
        descricao: 'Nova descrição',
        dataInicio: '2026-03-22T08:00:00',
        dataFim: '2026-03-22T09:00:00',
        feito: false,
        usuario: [{ id: 1, name: 'Admin', dados: 'admin@teste.com', photpth: 'foto.png' }],
      },
    });

    const chamadasPost = fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST');
    const payloadPost = JSON.parse(String(chamadasPost[0]?.[1]?.body ?? '{}')) as { id: number };

    expect(payloadPost.id).toBe(6);
    expect(tarefaCriada.id).toBe(6);
  });

  test('envia exclusão para API', async () => {
    const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>(async (input, init) => {
      const url = String(input);
      if (init?.method === 'DELETE' && url.endsWith('/tarefasDiarias/9')) {
        return criarResposta({ status: 200, payload: {} });
      }

      return criarResposta({ status: 404, payload: {} });
    });
    definirFetchGlobal({ fetcher: fetchMock });

    await excluirTarefa({ tarefaId: 9 });

    expect(fetchMock).toHaveBeenCalled();
  });
});
