import { criarUsuarioController } from '../src/modules/usuario/controller/usuario-controller';
import { UsuarioRepository } from '../src/modules/usuario/model/usuario-repository';

describe('usuario-controller', () => {
  const usuariosPerfilBase = [
    {
      id: 3,
      login: 'ana',
      nome: 'Ana',
      sobrenome: 'Silva',
      dataNascimento: '1990-01-01',
      telefone: '81999999999',
      email: 'ana@email.com',
      tipoUsuario: 'regular' as const,
      imgPerfil: 'ana.png',
    },
    {
      id: 4,
      login: 'bruno',
      nome: 'Bruno',
      sobrenome: 'Souza',
      dataNascimento: '1991-01-01',
      telefone: '81988888888',
      email: 'bruno@email.com',
      tipoUsuario: 'admin' as const,
      imgPerfil: 'bruno.png',
    },
  ];

  const criarRepositoryMock = (): jest.Mocked<UsuarioRepository> => ({
    buscarPerfisUsuarios: jest.fn(async () => usuariosPerfilBase),
    criarPerfilUsuario: jest.fn(async ({ payload }) => payload),
    atualizarPerfilUsuario: jest.fn(async ({ usuarioId, payload }) => ({
      ...(usuariosPerfilBase.find((usuario) => usuario.id === usuarioId) ?? usuariosPerfilBase[0]),
      ...payload,
    })),
  });

  test('busca perfil por login', async () => {
    const usuarioController = criarUsuarioController({
      usuarioRepository: criarRepositoryMock(),
      buscarUsuariosAuth: jest.fn(async () => []),
    });

    const usuario = await usuarioController.buscarPerfilPorLogin({ login: 'bruno' });

    expect(usuario?.id).toBe(4);
  });

  test('calcula próximo id com base em auth e perfil', async () => {
    const usuarioController = criarUsuarioController({
      usuarioRepository: criarRepositoryMock(),
      buscarUsuariosAuth: jest.fn(async () => [
        { id: 1, login: 'admin', senha: '123' },
        { id: 9, login: 'jose', senha: '456' },
      ]),
    });

    const proximoId = await usuarioController.gerarProximoIdUsuario();

    expect(proximoId).toBe(10);
  });

  test('atualiza perfil com payload válido', async () => {
    const usuarioRepository = criarRepositoryMock();
    const usuarioController = criarUsuarioController({
      usuarioRepository,
      buscarUsuariosAuth: jest.fn(async () => []),
    });

    const response = await usuarioController.atualizarPerfilUsuario({
      usuarioId: 3,
      payload: {
        nome: 'Ana Clara',
      },
    });

    expect(usuarioRepository.atualizarPerfilUsuario).toHaveBeenCalledWith({
      usuarioId: 3,
      payload: {
        nome: 'Ana Clara',
      },
    });
    expect(response.nome).toBe('Ana Clara');
  });
});
