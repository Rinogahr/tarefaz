import { UsuarioAutenticacaoModel } from '../../auth/model/auth-model';
import {
  AtualizarUsuarioPerfilInput,
  CriarUsuarioPerfilInput,
  UsuarioPerfilModel,
  validarAtualizarUsuarioPerfilInput,
  validarCriarUsuarioPerfilInput,
} from '../model/usuario-model';
import { UsuarioRepository } from '../model/usuario-repository';

export interface UsuarioController {
  buscarPerfisUsuarios: () => Promise<UsuarioPerfilModel[]>;
  buscarPerfilPorId: ({ usuarioId }: { usuarioId: number }) => Promise<UsuarioPerfilModel | null>;
  buscarPerfilPorLogin: ({ login }: { login: string }) => Promise<UsuarioPerfilModel | null>;
  gerarProximoIdUsuario: () => Promise<number>;
  criarPerfilUsuario: ({ payload }: { payload: CriarUsuarioPerfilInput }) => Promise<UsuarioPerfilModel>;
  atualizarPerfilUsuario: ({ usuarioId, payload }: { usuarioId: number; payload: AtualizarUsuarioPerfilInput }) => Promise<UsuarioPerfilModel>;
  excluirPerfilUsuario: ({ usuarioId }: { usuarioId: number }) => Promise<void>;
}

const calcularProximoId = ({
  usuariosAuth,
  usuariosPerfil,
}: {
  usuariosAuth: UsuarioAutenticacaoModel[];
  usuariosPerfil: UsuarioPerfilModel[];
}): number => {
  const maiorIdAuth = usuariosAuth.reduce<number>((maiorId, usuario) => Math.max(maiorId, usuario.id), 0);
  const maiorIdPerfil = usuariosPerfil.reduce<number>((maiorId, usuario) => Math.max(maiorId, usuario.id), 0);
  return Math.max(maiorIdAuth, maiorIdPerfil) + 1;
};

export const criarUsuarioController = ({
  usuarioRepository,
  buscarUsuariosAuth,
}: {
  usuarioRepository: UsuarioRepository;
  buscarUsuariosAuth: () => Promise<UsuarioAutenticacaoModel[]>;
}): UsuarioController => ({
  buscarPerfisUsuarios: async (): Promise<UsuarioPerfilModel[]> => usuarioRepository.buscarPerfisUsuarios(),

  buscarPerfilPorId: async ({ usuarioId }: { usuarioId: number }): Promise<UsuarioPerfilModel | null> => {
    const usuarios = await usuarioRepository.buscarPerfisUsuarios();
    return usuarios.find((usuario) => usuario.id === usuarioId) ?? null;
  },

  buscarPerfilPorLogin: async ({ login }: { login: string }): Promise<UsuarioPerfilModel | null> => {
    const usuarios = await usuarioRepository.buscarPerfisUsuarios();
    return usuarios.find((usuario) => usuario.login === login) ?? null;
  },

  gerarProximoIdUsuario: async (): Promise<number> => {
    const [usuariosAuth, usuariosPerfil] = await Promise.all([buscarUsuariosAuth(), usuarioRepository.buscarPerfisUsuarios()]);
    return calcularProximoId({ usuariosAuth, usuariosPerfil });
  },

  criarPerfilUsuario: async ({ payload }: { payload: CriarUsuarioPerfilInput }): Promise<UsuarioPerfilModel> => {
    const payloadValidado = validarCriarUsuarioPerfilInput(payload);
    return usuarioRepository.criarPerfilUsuario({ payload: payloadValidado });
  },

  atualizarPerfilUsuario: async ({
    usuarioId,
    payload,
  }: {
    usuarioId: number;
    payload: AtualizarUsuarioPerfilInput;
  }): Promise<UsuarioPerfilModel> => {
    const payloadValidado = validarAtualizarUsuarioPerfilInput(payload);
    return usuarioRepository.atualizarPerfilUsuario({
      usuarioId,
      payload: payloadValidado,
    });
  },

  excluirPerfilUsuario: async ({ usuarioId }: { usuarioId: number }): Promise<void> => {
    await usuarioRepository.excluirPerfilUsuario({ usuarioId });
  },
});
