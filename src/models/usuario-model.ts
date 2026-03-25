import { z } from 'zod';

const tipoUsuarioSchema = z.enum(['admin', 'regular']);

const usuarioSchema = z.object({
  id: z.coerce.number().int().positive(),
  login: z.string().min(1),
  nome: z.string().min(1),
  sobrenome: z.string().min(1),
  dataNascimento: z.iso.date(),
  telefone: z.string().min(8),
  email: z.email(),
  tipoUsuario: tipoUsuarioSchema,
  imgPerfil: z.string().min(1),
  imgPerfilPath: z.string().optional(),
});

const usuariosSchema = z.array(usuarioSchema);

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
  nome?: string;
  sobrenome?: string;
  dataNascimento?: string;
  telefone?: string;
  email?: string;
  tipoUsuario?: 'admin' | 'regular';
  imgPerfil?: string;
  imgPerfilPath?: string;
}

export const validarUsuarioPerfil = (payload: unknown): UsuarioPerfilModel => usuarioSchema.parse(payload);

export const validarUsuariosPerfil = (payload: unknown): UsuarioPerfilModel[] => usuariosSchema.parse(payload);
