import dayjs from 'dayjs';
import { z } from 'zod';

const usuarioSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  dados: z.string().min(1),
  photpth: z.string().min(1),
});

const tarefaSchema = z
  .object({
    id: z.number().int().positive(),
    usuario: z.array(usuarioSchema).min(1),
    titulo: z.string().min(1),
    descricao: z.string().min(1),
    dataInicio: z.iso.datetime({ local: true }),
    dataFim: z.iso.datetime({ local: true }),
    feito: z.boolean(),
  })
  .refine(
    ({ dataInicio, dataFim }) =>
      dayjs(dataFim).isAfter(dayjs(dataInicio)) || dayjs(dataFim).isSame(dayjs(dataInicio)),
    {
      message: 'dataFim precisa ser igual ou posterior a dataInicio',
      path: ['dataFim'],
    },
  );

const tarefasSchema = z.array(tarefaSchema);

export interface UsuarioModel {
  id: number;
  name: string;
  dados: string;
  photpth: string;
}

export interface TarefaModel {
  id: number;
  usuario: UsuarioModel[];
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  feito: boolean;
}

export interface CriarTarefaInput {
  usuario: UsuarioModel[];
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  feito: boolean;
}

export const validarTarefas = (payload: unknown): TarefaModel[] => tarefasSchema.parse(payload);

export const validarTarefa = (payload: unknown): TarefaModel => tarefaSchema.parse(payload);
