import dayjs from 'dayjs';
import * as tarefasDiariasData from '../../../../data/tarefasDiarias.json';
import { CriarTarefaInput, TarefaModel, validarTarefa, validarTarefas } from './tarefa-model';

const apiBaseUrl = 'http://localhost:5001';
const tarefasResourcePath = '/tarefasDiarias';

interface TarefasDiariasDataModel {
  tarefasDiarias: unknown;
}

interface CriarTarefaRepositoryInput {
  fetcher?: typeof fetch;
}

export interface TarefaRepository {
  buscarTarefas: () => Promise<TarefaModel[]>;
  criarTarefa: ({ payload }: { payload: CriarTarefaInput }) => Promise<TarefaModel>;
  atualizarTarefa: ({ tarefaId, payload }: { tarefaId: number | string; payload: Partial<CriarTarefaInput> }) => Promise<TarefaModel>;
  excluirTarefa: ({ tarefaId }: { tarefaId: number | string }) => Promise<void>;
}

const montarUrl = ({ path }: { path: string }): string => `${apiBaseUrl}${path}`;

const validarResposta = async ({ response }: { response: Response }): Promise<unknown> => {
  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }

  return response.json();
};

const extrairTarefasFallback = (): TarefaModel[] => {
  const fonteDados = tarefasDiariasData as TarefasDiariasDataModel & { default?: TarefasDiariasDataModel };
  const payload = fonteDados.tarefasDiarias ?? fonteDados.default?.tarefasDiarias ?? [];
  return validarTarefas(payload);
};

const extrairNumeroId = ({ id }: { id: number | string }): number => {
  if (typeof id === 'number') {
    return id;
  }

  const numeroConvertido = Number(id);
  return Number.isInteger(numeroConvertido) ? numeroConvertido : 0;
};

const resolverFetcher = ({ fetcher }: CriarTarefaRepositoryInput): typeof fetch => {
  if (fetcher) {
    return fetcher;
  }

  if (typeof globalThis.fetch === 'function') {
    return globalThis.fetch.bind(globalThis);
  }

  return async (): Promise<Response> => {
    throw new Error('Fetch indisponível');
  };
};

const criarPayloadComId = ({
  tarefasExistentes,
  payload,
}: {
  tarefasExistentes: TarefaModel[];
  payload: CriarTarefaInput;
}): CriarTarefaInput & { id: number } => {
  const proximoId =
    tarefasExistentes.reduce<number>((maiorId, tarefa) => Math.max(maiorId, extrairNumeroId({ id: tarefa.id })), 0) + 1;

  return {
    id: proximoId,
    ...payload,
  };
};

export const criarTarefaRepository = (input: CriarTarefaRepositoryInput = {}): TarefaRepository => {
  const fetcher = resolverFetcher(input);

  const buscarTarefas = async (): Promise<TarefaModel[]> => {
    try {
      const response = await fetcher(montarUrl({ path: tarefasResourcePath }), {
        method: 'GET',
      });

      const payload = await validarResposta({ response });
      return validarTarefas(payload);
    } catch {
      return extrairTarefasFallback();
    }
  };

  const criarTarefa = async ({ payload }: { payload: CriarTarefaInput }): Promise<TarefaModel> => {
    const tarefasExistentes = await buscarTarefas();
    const payloadComId = criarPayloadComId({ tarefasExistentes, payload });
    const response = await fetcher(montarUrl({ path: tarefasResourcePath }), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadComId),
    });

    const responsePayload = await validarResposta({ response });
    return validarTarefa(responsePayload);
  };

  const atualizarTarefa = async ({
    tarefaId,
    payload,
  }: {
    tarefaId: number | string;
    payload: Partial<CriarTarefaInput>;
  }): Promise<TarefaModel> => {
    const caminhoRecurso = `${tarefasResourcePath}/${String(tarefaId)}`;

    try {
      const responsePatch = await fetcher(montarUrl({ path: caminhoRecurso }), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const payloadPatch = await validarResposta({ response: responsePatch });
      return validarTarefa(payloadPatch);
    } catch {
      const responseTarefaAtual = await fetcher(montarUrl({ path: caminhoRecurso }), {
        method: 'GET',
      });
      const payloadTarefaAtual = await validarResposta({ response: responseTarefaAtual });
      const payloadFinal = {
        ...(payloadTarefaAtual as Record<string, unknown>),
        ...payload,
      };

      const responsePut = await fetcher(montarUrl({ path: caminhoRecurso }), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadFinal),
      });

      const payloadPut = await validarResposta({ response: responsePut });
      return validarTarefa(payloadPut);
    }
  };

  const excluirTarefa = async ({ tarefaId }: { tarefaId: number | string }): Promise<void> => {
    const response = await fetcher(montarUrl({ path: `${tarefasResourcePath}/${tarefaId}` }), {
      method: 'DELETE',
    });

    await validarResposta({ response });
  };

  return {
    buscarTarefas,
    criarTarefa,
    atualizarTarefa,
    excluirTarefa,
  };
};

export const montarDataPersistenciaAtual = (): string => dayjs().format('YYYY-MM-DDTHH:mm:ss');
