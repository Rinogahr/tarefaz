import { z } from 'zod';

export const usuarioAutenticacaoSchema = z.object({
  id: z.coerce.number().int().positive(),
  login: z.string().min(1),
  senha: z.string().min(1),
});

export const usuariosAutenticacaoSchema = z.array(usuarioAutenticacaoSchema);

export const registrarUsuarioInputSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  login: z.string().min(1),
  senha: z.string().min(1),
});

export const autenticarUsuarioInputSchema = z.object({
  login: z.string().min(1),
  senha: z.string().min(1),
});

export const atualizarSenhaUsuarioInputSchema = z.object({
  usuarioId: z.coerce.number().int().positive(),
  senha: z.string().min(1),
});

export const atualizarLoginUsuarioInputSchema = z.object({
  usuarioId: z.coerce.number().int().positive(),
  login: z.string().min(1),
});
