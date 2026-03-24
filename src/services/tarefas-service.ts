import { CriarTarefaInput, TarefaModel, UsuarioModel, validarTarefa, validarTarefas } from '../models/tarefa-model';
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

const montarDataPersistenciaAtual = (): string => dayjs().format('YYYY-MM-DDTHH:mm:ss');

const extrairNumeroId = ({ id }: { id: number | string }): number => {
  if (typeof id === 'number') {
    return id;
  }

  const numeroConvertido = Number(id);
  return Number.isInteger(numeroConvertido) ? numeroConvertido : 0;
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

export const buscarUsuariosRegistrados = async (): Promise<UsuarioModel[]> => {
  const tarefas = await buscarTarefas();
  const usuariosMap = tarefas.reduce<Map<number, UsuarioModel>>((mapa, tarefa) => {
    tarefa.usuario.forEach((usuario) => {
      mapa.set(usuario.id, usuario);
    });
    return mapa;
  }, new Map<number, UsuarioModel>());

  return Array.from(usuariosMap.values());
};

export const criarTarefa = async ({ payload }: { payload: CriarTarefaInput }): Promise<TarefaModel> => {
  const tarefasExistentes = await buscarTarefas();
  const proximoId =
    tarefasExistentes.reduce<number>((maiorId, tarefa) => Math.max(maiorId, extrairNumeroId({ id: tarefa.id })), 0) + 1;
  const payloadComId = {
    id: proximoId,
    ...payload,
  };

  const response = await fetch(montarUrl({ path: tarefasResourcePath }), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payloadComId),
  });

  const responsePayload = await validarResposta({ response });
  return validarTarefa(responsePayload);
};

export const atualizarTarefa = async ({
  tarefaId,
  payload,
}: {
  tarefaId: number | string;
  payload: Partial<CriarTarefaInput>;
}): Promise<TarefaModel> => {
  const response = await fetch(montarUrl({ path: `${tarefasResourcePath}/${tarefaId}` }), {
    method: 'PATCH',
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
      dataFim: montarDataPersistenciaAtual(),
    },
  });
};

export const marcarComoPendente = async ({
  tarefa,
}: {
  tarefa: TarefaModel;
}): Promise<TarefaModel> => {
  return atualizarTarefa({
    tarefaId: tarefa.id,
    payload: {
      ...tarefa,
      feito: false,
    },
  });
};

export const excluirTarefa = async ({ tarefaId }: { tarefaId: number | string }): Promise<void> => {
  const response = await fetch(montarUrl({ path: `${tarefasResourcePath}/${tarefaId}` }), {
    method: 'DELETE',
  });

  await validarResposta({ response });
};
