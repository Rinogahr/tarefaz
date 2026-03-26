import {
  atualizarUsuarioPerfilInputSchema,
  criarUsuarioPerfilInputSchema,
  usuarioPerfilSchema,
  usuariosPerfilSchema,
} from '../../../../schemas/usuario-schemas';

export interface UsuarioPerfilModel {
  id: number;
  login: string;
  nome: string;
  sobrenome: string;
  dataNascimento: string;
  telefone: string;
  email: string;
  tipoUsuario: 'admin' | 'regular';
  imgPerfil: string;
  imgPerfilPath?: string;
}

export interface CriarUsuarioPerfilInput {
  id: number;
  login: string;
  nome: string;
  sobrenome: string;
  dataNascimento: string;
  telefone: string;
  email: string;
  tipoUsuario: 'admin' | 'regular';
  imgPerfil: string;
  imgPerfilPath?: string;
}

export interface AtualizarUsuarioPerfilInput {
  login?: string;
  nome?: string;
  sobrenome?: string;
  dataNascimento?: string;
  telefone?: string;
  email?: string;
  tipoUsuario?: 'admin' | 'regular';
  imgPerfil?: string;
  imgPerfilPath?: string;
}

export const validarUsuarioPerfil = (payload: unknown): UsuarioPerfilModel => usuarioPerfilSchema.parse(payload);

export const validarUsuariosPerfil = (payload: unknown): UsuarioPerfilModel[] => usuariosPerfilSchema.parse(payload);

export const validarCriarUsuarioPerfilInput = (payload: unknown): CriarUsuarioPerfilInput =>
  criarUsuarioPerfilInputSchema.parse(payload);

export const validarAtualizarUsuarioPerfilInput = (payload: unknown): AtualizarUsuarioPerfilInput =>
  atualizarUsuarioPerfilInputSchema.parse(payload);
