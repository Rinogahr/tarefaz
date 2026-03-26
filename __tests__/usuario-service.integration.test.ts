import {
  buscarPerfilPorLogin,
  buscarPerfisUsuarios,
  criarPerfilUsuario,
  gerarProximoIdUsuario,
} from '../src/services/usuario-service';

describe('usuario-service integração', () => {
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

  test('usa fallback local quando API de usuários falha', async () => {
    const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>(async (input) => {
      const url = String(input);
      if (url.includes('/usuarios')) {
        throw new Error('offline');
      }

      return criarResposta({ status: 200, payload: [] });
    });
    definirFetchGlobal({ fetcher: fetchMock });

    const usuarios = await buscarPerfisUsuarios();

    expect(fetchMock).toHaveBeenCalled();
    expect(usuarios.length).toBeGreaterThan(0);
    expect(usuarios[0]).toHaveProperty('login');
  });

  test('calcula próximo id considerando auth e perfil', async () => {
    const usuariosAuth = [
      { id: 1, login: 'admin', senha: '123' },
      { id: 7, login: 'joao', senha: '456' },
    ];

    const usuariosPerfil = [
      {
        id: 2,
        login: 'ana',
        nome: 'Ana',
        sobrenome: 'Silva',
        dataNascimento: '1990-01-01',
        telefone: '81999999999',
        email: 'ana@email.com',
        tipoUsuario: 'regular',
        imgPerfil: 'ana.png',
      },
    ];

    const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>(async (input) => {
      const url = String(input);
      if (url.endsWith('/users')) {
        return criarResposta({ status: 200, payload: usuariosAuth });
      }

      if (url.endsWith('/usuarios')) {
        return criarResposta({ status: 200, payload: usuariosPerfil });
      }

      return criarResposta({ status: 404, payload: {} });
    });
    definirFetchGlobal({ fetcher: fetchMock });

    const proximoId = await gerarProximoIdUsuario();

    expect(proximoId).toBe(8);
  });

  test('cria e consulta perfil por login', async () => {
    const payloadPerfil = {
      id: 10,
      login: 'carol',
      nome: 'Carol',
      sobrenome: 'Costa',
      dataNascimento: '1992-02-02',
      telefone: '81977777777',
      email: 'carol@email.com',
      tipoUsuario: 'regular',
      imgPerfil: 'carol.png',
    };

    const usuariosPerfil = [payloadPerfil];

    const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>(async (input, init) => {
      const url = String(input);
      if (init?.method === 'POST' && url.endsWith('/usuarios')) {
        return criarResposta({ status: 201, payload: payloadPerfil });
      }

      if ((!init?.method || init.method === 'GET') && url.endsWith('/usuarios')) {
        return criarResposta({ status: 200, payload: usuariosPerfil });
      }

      if (url.endsWith('/users')) {
        return criarResposta({ status: 200, payload: [] });
      }

      return criarResposta({ status: 404, payload: {} });
    });
    definirFetchGlobal({ fetcher: fetchMock });

    const usuarioCriado = await criarPerfilUsuario({ payload: payloadPerfil });
    const usuarioEncontrado = await buscarPerfilPorLogin({ login: 'carol' });

    expect(usuarioCriado.login).toBe('carol');
    expect(usuarioEncontrado?.id).toBe(10);
  });
});
