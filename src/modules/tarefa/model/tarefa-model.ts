import { criarTarefaInputSchema, tarefaSchema, tarefasSchema, usuarioTarefaSchema } from '../../../../schemas/tarefa-schemas';

export interface UsuarioModel {
  id: number;
  name: string;
  dados: string;
  photpth: string;
}

export interface TarefaModel {
  id: number | string;
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

export interface AtualizarTarefaInput {
  tarefaId: number | string;
  payload: Partial<CriarTarefaInput>;
}

export const validarUsuarioTarefa = (payload: unknown): UsuarioModel => usuarioTarefaSchema.parse(payload);

export const validarTarefa = (payload: unknown): TarefaModel => tarefaSchema.parse(payload);

export const validarTarefas = (payload: unknown): TarefaModel[] => tarefasSchema.parse(payload);

export const validarCriarTarefaInput = (payload: unknown): CriarTarefaInput => criarTarefaInputSchema.parse(payload);

export const validarAtualizarTarefaPayload = (payload: unknown): Partial<CriarTarefaInput> =>
  criarTarefaInputSchema.partial().parse(payload);
