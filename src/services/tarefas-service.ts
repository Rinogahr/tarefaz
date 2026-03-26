import { criarTarefaController } from '../modules/tarefa/controller/tarefa-controller';
import { CriarTarefaInput, TarefaModel, UsuarioModel } from '../modules/tarefa/model/tarefa-model';
import { criarTarefaRepository } from '../modules/tarefa/model/tarefa-repository';

const tarefaController = criarTarefaController({
  tarefaRepository: criarTarefaRepository({
    fetcher: async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      if (typeof globalThis.fetch !== 'function') {
        throw new Error('Fetch indisponível');
      }

      return globalThis.fetch(input, init);
    },
  }),
});

export const buscarTarefas = async (): Promise<TarefaModel[]> => tarefaController.buscarTarefas();

export const buscarTarefasPorUsuario = async ({ usuarioId }: { usuarioId: number }): Promise<TarefaModel[]> =>
  tarefaController.buscarTarefasPorUsuario({ usuarioId });

export const buscarUsuariosRegistrados = async (): Promise<UsuarioModel[]> => tarefaController.buscarUsuariosRegistrados();

export const criarTarefa = async ({ payload }: { payload: CriarTarefaInput }): Promise<TarefaModel> =>
  tarefaController.criarTarefa({ payload });

export const atualizarTarefa = async ({
  tarefaId,
  payload,
}: {
  tarefaId: number | string;
  payload: Partial<CriarTarefaInput>;
}): Promise<TarefaModel> => tarefaController.atualizarTarefa({ tarefaId, payload });

export const marcarComoConcluida = async ({ tarefa }: { tarefa: TarefaModel }): Promise<TarefaModel> =>
  tarefaController.marcarComoConcluida({ tarefa });

export const marcarComoPendente = async ({ tarefa }: { tarefa: TarefaModel }): Promise<TarefaModel> =>
  tarefaController.marcarComoPendente({ tarefa });

export const excluirTarefa = async ({ tarefaId }: { tarefaId: number | string }): Promise<void> =>
  tarefaController.excluirTarefa({ tarefaId });
