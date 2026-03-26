import {
  autenticarUsuarioInputSchema,
  atualizarLoginUsuarioInputSchema,
  atualizarSenhaUsuarioInputSchema,
  registrarUsuarioInputSchema,
  usuarioAutenticacaoSchema,
  usuariosAutenticacaoSchema,
} from '../../../../schemas/auth-schemas';

export interface UsuarioAutenticacaoModel {
  id: number;
  login: string;
  senha: string;
}

export interface RegistrarUsuarioInput {
  id?: number;
  login: string;
  senha: string;
}

export interface AutenticarUsuarioInput {
  login: string;
  senha: string;
}

export interface AtualizarSenhaUsuarioInput {
  usuarioId: number;
  senha: string;
}

export interface AtualizarLoginUsuarioInput {
  usuarioId: number;
  login: string;
}

export const validarUsuarioAutenticacao = (payload: unknown): UsuarioAutenticacaoModel =>
  usuarioAutenticacaoSchema.parse(payload);

export const validarUsuariosAutenticacao = (payload: unknown): UsuarioAutenticacaoModel[] =>
  usuariosAutenticacaoSchema.parse(payload);

export const validarRegistrarUsuarioInput = (payload: unknown): RegistrarUsuarioInput =>
  registrarUsuarioInputSchema.parse(payload);

export const validarAutenticarUsuarioInput = (payload: unknown): AutenticarUsuarioInput =>
  autenticarUsuarioInputSchema.parse(payload);

export const validarAtualizarSenhaUsuarioInput = (payload: unknown): AtualizarSenhaUsuarioInput =>
  atualizarSenhaUsuarioInputSchema.parse(payload);

export const validarAtualizarLoginUsuarioInput = (payload: unknown): AtualizarLoginUsuarioInput =>
  atualizarLoginUsuarioInputSchema.parse(payload);
