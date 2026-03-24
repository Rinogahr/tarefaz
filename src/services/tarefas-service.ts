import { CriarTarefaInput, TarefaModel, validarTarefa, validarTarefas } from '../models/tarefa-model';
import tarefasDiariasData from '../../data/tarefasDiarias.json';
import dayjs from 'dayjs';

const apiBaseUrl = 'http://localhost:5001';
const tarefasResourcePath = '/tarefasDiarias';

interface TarefasDiariasDataModel {
  tarefasDiarias: unknown;
}

const montarUrl = ({ path }: { path: string }): string => `${apiBaseUrl}${path}`;

const validarResposta = async ({ response }: { response: Response }): Promise<unknown> => {
  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }

  return response.json();
};

const extrairTarefasFallback = (): TarefaModel[] => {
  const tarefasDiarias = (tarefasDiariasData as TarefasDiariasDataModel).tarefasDiarias;
  return validarTarefas(tarefasDiarias);
};

export const buscarTarefas = async (): Promise<TarefaModel[]> => {
  try {
    const response = await fetch(montarUrl({ path: tarefasResourcePath }), {
      method: 'GET',
    });

    const payload = await validarResposta({ response });
    return validarTarefas(payload);
  } catch {
    return extrairTarefasFallback();
  }
};

export const buscarTarefasPorUsuario = async ({ usuarioId }: { usuarioId: number }): Promise<TarefaModel[]> => {
  const tarefas = await buscarTarefas();
  return tarefas.filter((tarefa) => tarefa.usuario.some((usuario) => usuario.id === usuarioId));
};

export const criarTarefa = async ({ payload }: { payload: CriarTarefaInput }): Promise<TarefaModel> => {
  const response = await fetch(montarUrl({ path: tarefasResourcePath }), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responsePayload = await validarResposta({ response });
  return validarTarefa(responsePayload);
};

export const atualizarTarefa = async ({
  tarefaId,
  payload,
}: {
  tarefaId: number;
  payload: Partial<CriarTarefaInput>;
}): Promise<TarefaModel> => {
  const response = await fetch(montarUrl({ path: `${tarefasResourcePath}/${tarefaId}` }), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responsePayload = await validarResposta({ response });
  return validarTarefa(responsePayload);
};

export const marcarComoConcluida = async ({
  tarefa,
}: {
  tarefa: TarefaModel;
}): Promise<TarefaModel> => {
  return atualizarTarefa({
    tarefaId: tarefa.id,
    payload: {
      ...tarefa,
      feito: true,
      dataFim: dayjs().toISOString(),
    },
  });
};

export const excluirTarefa = async ({ tarefaId }: { tarefaId: number }): Promise<void> => {
  const response = await fetch(montarUrl({ path: `${tarefasResourcePath}/${tarefaId}` }), {
    method: 'DELETE',
  });

  await validarResposta({ response });
};
