import {
  AtualizarUsuarioPerfilInput,
  CriarUsuarioPerfilInput,
  UsuarioPerfilModel,
} from '../modules/usuario/model/usuario-model';
import { criarUsuarioController } from '../modules/usuario/controller/usuario-controller';
import { criarUsuarioRepository } from '../modules/usuario/model/usuario-repository';
import { buscarUsuarios } from './auth-service';

const usuarioController = criarUsuarioController({
  usuarioRepository: criarUsuarioRepository({
    fetcher: async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      if (typeof globalThis.fetch !== 'function') {
        throw new Error('Fetch indisponível');
      }

      return globalThis.fetch(input, init);
    },
  }),
  buscarUsuariosAuth: async () => buscarUsuarios(),
});

export const buscarPerfisUsuarios = async (): Promise<UsuarioPerfilModel[]> => usuarioController.buscarPerfisUsuarios();

export const buscarPerfilPorId = async ({ usuarioId }: { usuarioId: number }): Promise<UsuarioPerfilModel | null> =>
  usuarioController.buscarPerfilPorId({ usuarioId });

export const buscarPerfilPorLogin = async ({ login }: { login: string }): Promise<UsuarioPerfilModel | null> =>
  usuarioController.buscarPerfilPorLogin({ login });

export const gerarProximoIdUsuario = async (): Promise<number> => usuarioController.gerarProximoIdUsuario();

export const criarPerfilUsuario = async ({ payload }: { payload: CriarUsuarioPerfilInput }): Promise<UsuarioPerfilModel> =>
  usuarioController.criarPerfilUsuario({ payload });

export const atualizarPerfilUsuario = async ({
  usuarioId,
  payload,
}: {
  usuarioId: number;
  payload: AtualizarUsuarioPerfilInput;
}): Promise<UsuarioPerfilModel> => usuarioController.atualizarPerfilUsuario({ usuarioId, payload });

export const excluirPerfilUsuario = async ({ usuarioId }: { usuarioId: number }): Promise<void> =>
  usuarioController.excluirPerfilUsuario({ usuarioId });
