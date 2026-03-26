import { z } from 'zod';

export const tipoUsuarioSchema = z.enum(['admin', 'regular']);

export const usuarioPerfilSchema = z.object({
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

export const usuariosPerfilSchema = z.array(usuarioPerfilSchema);

export const criarUsuarioPerfilInputSchema = usuarioPerfilSchema;

export const atualizarUsuarioPerfilInputSchema = z
  .object({
    login: z.string().min(1).optional(),
    nome: z.string().min(1).optional(),
    sobrenome: z.string().min(1).optional(),
    dataNascimento: z.iso.date().optional(),
    telefone: z.string().min(8).optional(),
    email: z.email().optional(),
    tipoUsuario: tipoUsuarioSchema.optional(),
    imgPerfil: z.string().min(1).optional(),
    imgPerfilPath: z.string().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    error: 'Informe ao menos um campo para atualizar',
  });
