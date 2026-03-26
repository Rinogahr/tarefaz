import {
  AutenticarUsuarioInput,
  AtualizarLoginUsuarioInput,
  AtualizarSenhaUsuarioInput,
  RegistrarUsuarioInput,
  UsuarioAutenticacaoModel,
  validarAutenticarUsuarioInput,
  validarAtualizarLoginUsuarioInput,
  validarAtualizarSenhaUsuarioInput,
  validarRegistrarUsuarioInput,
} from '../model/auth-model';
import { AuthRepository } from '../model/auth-repository';

export interface AuthController {
  buscarUsuarios: () => Promise<UsuarioAutenticacaoModel[]>;
  registrarUsuario: (input: RegistrarUsuarioInput) => Promise<UsuarioAutenticacaoModel>;
  autenticarUsuario: (input: AutenticarUsuarioInput) => Promise<boolean>;
  buscarUsuarioPorLogin: ({ login }: { login: string }) => Promise<UsuarioAutenticacaoModel | null>;
  atualizarSenhaUsuario: (input: AtualizarSenhaUsuarioInput) => Promise<UsuarioAutenticacaoModel>;
  atualizarLoginUsuario: (input: AtualizarLoginUsuarioInput) => Promise<UsuarioAutenticacaoModel>;
  excluirUsuario: ({ usuarioId }: { usuarioId: number }) => Promise<void>;
}

export const criarAuthController = ({ authRepository }: { authRepository: AuthRepository }): AuthController => ({
  buscarUsuarios: async (): Promise<UsuarioAutenticacaoModel[]> => authRepository.buscarUsuarios(),

  registrarUsuario: async (input: RegistrarUsuarioInput): Promise<UsuarioAutenticacaoModel> => {
    const payload = validarRegistrarUsuarioInput(input);
    const usuarios = await authRepository.buscarUsuarios();
    const usuarioExistente = usuarios.find((usuario) => usuario.login === payload.login);
    if (usuarioExistente) {
      throw new Error('Usuário já cadastrado');
    }

    return authRepository.registrarUsuario(payload);
  },

  autenticarUsuario: async (input: AutenticarUsuarioInput): Promise<boolean> => {
    const payload = validarAutenticarUsuarioInput(input);
    const usuarios = await authRepository.buscarUsuarios();
    return usuarios.some((usuario) => usuario.login === payload.login && usuario.senha === payload.senha);
  },

  buscarUsuarioPorLogin: async ({ login }: { login: string }): Promise<UsuarioAutenticacaoModel | null> => {
    const usuarios = await authRepository.buscarUsuarios();
    return usuarios.find((usuario) => usuario.login === login) ?? null;
  },

  atualizarSenhaUsuario: async (input: AtualizarSenhaUsuarioInput): Promise<UsuarioAutenticacaoModel> => {
    const payload = validarAtualizarSenhaUsuarioInput(input);
    return authRepository.atualizarSenhaUsuario(payload);
  },

  atualizarLoginUsuario: async (input: AtualizarLoginUsuarioInput): Promise<UsuarioAutenticacaoModel> => {
    const payload = validarAtualizarLoginUsuarioInput(input);
    const usuarios = await authRepository.buscarUsuarios();
    const loginJaExiste = usuarios.some((usuario) => usuario.login === payload.login && usuario.id !== payload.usuarioId);
    if (loginJaExiste) {
      throw new Error('Login já cadastrado');
    }

    return authRepository.atualizarLoginUsuario(payload);
  },

  excluirUsuario: async ({ usuarioId }: { usuarioId: number }): Promise<void> => {
    await authRepository.excluirUsuario({ usuarioId });
  },
});
