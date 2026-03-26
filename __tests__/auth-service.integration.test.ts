import { buscarUsuarios, registrarUsuario, salvarSessaoAutenticada, possuiSessaoAutenticada, limparSessaoAutenticada } from '../src/services/auth-service';

describe('auth-service integração', () => {
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

  beforeEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

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

    const usuarios = await buscarUsuarios();

    expect(fetchMock).toHaveBeenCalled();
    expect(usuarios.length).toBeGreaterThan(0);
    expect(usuarios[0]).toHaveProperty('login');
  });

  test('registra usuário com próximo id', async () => {
    const payloadUsuarios = [
      { id: 1, login: 'admin', senha: '123' },
      { id: 3, login: 'joao', senha: '456' },
    ];
    const responsePost = { id: 4, login: 'ana', senha: '999999' };

    const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>(async (input, init) => {
      const url = String(input);
      if (init?.method === 'GET' && url.endsWith('/users')) {
        return criarResposta({ status: 200, payload: payloadUsuarios });
      }

      if (init?.method === 'POST' && url.endsWith('/users')) {
        return criarResposta({ status: 201, payload: responsePost });
      }

      return criarResposta({ status: 404, payload: { message: 'not found' } });
    });
    definirFetchGlobal({ fetcher: fetchMock });

    const usuarioCriado = await registrarUsuario({
      login: 'ana',
      senha: '999999',
    });

    const chamadasPost = fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST');
    const payloadPost = JSON.parse(String(chamadasPost[0]?.[1]?.body ?? '{}')) as {
      id: number;
      login: string;
      senha: string;
    };

    expect(payloadPost.id).toBe(4);
    expect(usuarioCriado.login).toBe('ana');
  });

  test('gerencia sessão autenticada no storage', () => {
    salvarSessaoAutenticada({ login: 'admin' });
    expect(possuiSessaoAutenticada()).toBe(true);
    limparSessaoAutenticada();
    expect(possuiSessaoAutenticada()).toBe(false);
  });
});
