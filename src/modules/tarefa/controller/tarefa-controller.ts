import {
  AtualizarTarefaInput,
  CriarTarefaInput,
  TarefaModel,
  UsuarioModel,
  validarAtualizarTarefaPayload,
  validarCriarTarefaInput,
} from '../model/tarefa-model';
import { montarDataPersistenciaAtual, TarefaRepository } from '../model/tarefa-repository';

export interface TarefaController {
  buscarTarefas: () => Promise<TarefaModel[]>;
  buscarTarefasPorUsuario: ({ usuarioId }: { usuarioId: number }) => Promise<TarefaModel[]>;
  buscarUsuariosRegistrados: () => Promise<UsuarioModel[]>;
  criarTarefa: ({ payload }: { payload: CriarTarefaInput }) => Promise<TarefaModel>;
  atualizarTarefa: (input: AtualizarTarefaInput) => Promise<TarefaModel>;
  marcarComoConcluida: ({ tarefa }: { tarefa: TarefaModel }) => Promise<TarefaModel>;
  marcarComoPendente: ({ tarefa }: { tarefa: TarefaModel }) => Promise<TarefaModel>;
  excluirTarefa: ({ tarefaId }: { tarefaId: number | string }) => Promise<void>;
}

export const criarTarefaController = ({ tarefaRepository }: { tarefaRepository: TarefaRepository }): TarefaController => ({
  buscarTarefas: async (): Promise<TarefaModel[]> => tarefaRepository.buscarTarefas(),

  buscarTarefasPorUsuario: async ({ usuarioId }: { usuarioId: number }): Promise<TarefaModel[]> => {
    const tarefas = await tarefaRepository.buscarTarefas();
    return tarefas.filter((tarefa) => tarefa.usuario.some((usuario) => usuario.id === usuarioId));
  },

  buscarUsuariosRegistrados: async (): Promise<UsuarioModel[]> => {
    const tarefas = await tarefaRepository.buscarTarefas();
    const usuariosMap = tarefas.reduce<Map<number, UsuarioModel>>((mapa, tarefa) => {
      tarefa.usuario.forEach((usuario) => {
        mapa.set(usuario.id, usuario);
      });
      return mapa;
    }, new Map<number, UsuarioModel>());

    return Array.from(usuariosMap.values());
  },

  criarTarefa: async ({ payload }: { payload: CriarTarefaInput }): Promise<TarefaModel> => {
    const payloadValidado = validarCriarTarefaInput(payload);
    return tarefaRepository.criarTarefa({ payload: payloadValidado });
  },

  atualizarTarefa: async ({ tarefaId, payload }: AtualizarTarefaInput): Promise<TarefaModel> => {
    const payloadValidado = validarAtualizarTarefaPayload(payload);
    return tarefaRepository.atualizarTarefa({
      tarefaId,
      payload: payloadValidado,
    });
  },

  marcarComoConcluida: async ({ tarefa }: { tarefa: TarefaModel }): Promise<TarefaModel> =>
    tarefaRepository.atualizarTarefa({
      tarefaId: tarefa.id,
      payload: {
        ...tarefa,
        feito: true,
        dataFim: montarDataPersistenciaAtual(),
      },
    }),

  marcarComoPendente: async ({ tarefa }: { tarefa: TarefaModel }): Promise<TarefaModel> =>
    tarefaRepository.atualizarTarefa({
      tarefaId: tarefa.id,
      payload: {
        ...tarefa,
        feito: false,
      },
    }),

  excluirTarefa: async ({ tarefaId }: { tarefaId: number | string }): Promise<void> => tarefaRepository.excluirTarefa({ tarefaId }),
});
