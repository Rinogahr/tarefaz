import { criarAuthController } from '../src/modules/auth/controller/auth-controller';
import { AuthRepository } from '../src/modules/auth/model/auth-repository';

describe('auth-controller', () => {
  const usuariosBase = [
    { id: 1, login: 'admin', senha: '123456' },
    { id: 2, login: 'maria', senha: 'abcdef' },
  ];

  const criarRepositoryMock = (): jest.Mocked<AuthRepository> => ({
    buscarUsuarios: jest.fn(async () => usuariosBase),
    registrarUsuario: jest.fn(async ({ id, login, senha }) => ({
      id: id ?? 3,
      login,
      senha,
    })),
    atualizarSenhaUsuario: jest.fn(async ({ usuarioId, senha }) => ({
      id: usuarioId,
      login: 'admin',
      senha,
    })),
  });

  test('autentica usuário válido', async () => {
    const authController = criarAuthController({ authRepository: criarRepositoryMock() });

    const autenticado = await authController.autenticarUsuario({
      login: 'admin',
      senha: '123456',
    });

    expect(autenticado).toBe(true);
  });

  test('impede cadastro de login já existente', async () => {
    const authController = criarAuthController({ authRepository: criarRepositoryMock() });

    await expect(
      authController.registrarUsuario({
        login: 'admin',
        senha: 'nova-senha',
      }),
    ).rejects.toThrow('Usuário já cadastrado');
  });

  test('encaminha atualização de senha para o repositório', async () => {
    const authRepository = criarRepositoryMock();
    const authController = criarAuthController({ authRepository });

    const response = await authController.atualizarSenhaUsuario({
      usuarioId: 1,
      senha: 'nova-senha',
    });

    expect(authRepository.atualizarSenhaUsuario).toHaveBeenCalledWith({
      usuarioId: 1,
      senha: 'nova-senha',
    });
    expect(response.senha).toBe('nova-senha');
  });
});
