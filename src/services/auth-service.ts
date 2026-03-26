import { criarAuthController } from '../modules/auth/controller/auth-controller';
import { RegistrarUsuarioInput, UsuarioAutenticacaoModel } from '../modules/auth/model/auth-model';
import { criarAuthRepository } from '../modules/auth/model/auth-repository';
import { criarAuthSessionView } from '../modules/auth/view/auth-session-view';

const authController = criarAuthController({
  authRepository: criarAuthRepository({
    fetcher: async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      if (typeof globalThis.fetch !== 'function') {
        throw new Error('Fetch indisponível');
      }

      return globalThis.fetch(input, init);
    },
  }),
});

const authSessionView = criarAuthSessionView();

export type { UsuarioAutenticacaoModel };

export const buscarUsuarios = async (): Promise<UsuarioAutenticacaoModel[]> => authController.buscarUsuarios();

export const registrarUsuario = async (input: RegistrarUsuarioInput): Promise<UsuarioAutenticacaoModel> =>
  authController.registrarUsuario(input);

export const autenticarUsuario = async ({
  login,
  senha,
}: {
  login: string;
  senha: string;
}): Promise<boolean> => authController.autenticarUsuario({ login, senha });

export const buscarUsuarioPorLogin = async ({ login }: { login: string }): Promise<UsuarioAutenticacaoModel | null> =>
  authController.buscarUsuarioPorLogin({ login });

export const atualizarSenhaUsuario = async ({
  usuarioId,
  senha,
}: {
  usuarioId: number;
  senha: string;
}): Promise<UsuarioAutenticacaoModel> => authController.atualizarSenhaUsuario({ usuarioId, senha });

export const atualizarLoginUsuario = async ({
  usuarioId,
  login,
}: {
  usuarioId: number;
  login: string;
}): Promise<UsuarioAutenticacaoModel> => authController.atualizarLoginUsuario({ usuarioId, login });

export const excluirUsuario = async ({ usuarioId }: { usuarioId: number }): Promise<void> =>
  authController.excluirUsuario({ usuarioId });

export const salvarSessaoAutenticada = ({ login }: { login: string }): void =>
  authSessionView.salvarSessaoAutenticada({ login });

export const limparSessaoAutenticada = (): void => authSessionView.limparSessaoAutenticada();

export const possuiSessaoAutenticada = (): boolean => authSessionView.possuiSessaoAutenticada();
