import * as usuarioListData from '../../../../data/usuario-list.json';
import {
  AtualizarUsuarioPerfilInput,
  CriarUsuarioPerfilInput,
  UsuarioPerfilModel,
  validarUsuarioPerfil,
  validarUsuariosPerfil,
} from './usuario-model';

const usuarioApiBaseUrl = 'http://localhost:5003';
const usuariosResourcePath = '/usuarios';

interface UsuarioListDataModel {
  usuarios: unknown;
}

interface CriarUsuarioRepositoryInput {
  fetcher?: typeof fetch;
}

export interface UsuarioRepository {
  buscarPerfisUsuarios: () => Promise<UsuarioPerfilModel[]>;
  criarPerfilUsuario: ({ payload }: { payload: CriarUsuarioPerfilInput }) => Promise<UsuarioPerfilModel>;
  atualizarPerfilUsuario: ({ usuarioId, payload }: { usuarioId: number; payload: AtualizarUsuarioPerfilInput }) => Promise<UsuarioPerfilModel>;
  excluirPerfilUsuario: ({ usuarioId }: { usuarioId: number }) => Promise<void>;
}

const montarUrl = ({ path }: { path: string }): string => `${usuarioApiBaseUrl}${path}`;

const validarResposta = async ({ response }: { response: Response }): Promise<unknown> => {
  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }

  return response.json();
};

const extrairUsuariosFallback = (): UsuarioPerfilModel[] => {
  const fonteDados = usuarioListData as UsuarioListDataModel & { default?: UsuarioListDataModel };
  const payload = fonteDados.usuarios ?? fonteDados.default?.usuarios ?? [];
  return validarUsuariosPerfil(payload);
};

const resolverFetcher = ({ fetcher }: CriarUsuarioRepositoryInput): typeof fetch => {
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

export const criarUsuarioRepository = (input: CriarUsuarioRepositoryInput = {}): UsuarioRepository => {
  const fetcher = resolverFetcher(input);

  const buscarPerfisUsuarios = async (): Promise<UsuarioPerfilModel[]> => {
    try {
      const response = await fetcher(montarUrl({ path: usuariosResourcePath }), {
        method: 'GET',
      });

      const payload = await validarResposta({ response });
      return validarUsuariosPerfil(payload);
    } catch {
      return extrairUsuariosFallback();
    }
  };

  const criarPerfilUsuario = async ({ payload }: { payload: CriarUsuarioPerfilInput }): Promise<UsuarioPerfilModel> => {
    const response = await fetcher(montarUrl({ path: usuariosResourcePath }), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responsePayload = await validarResposta({ response });
    return validarUsuarioPerfil(responsePayload);
  };

  const atualizarPerfilUsuario = async ({
    usuarioId,
    payload,
  }: {
    usuarioId: number;
    payload: AtualizarUsuarioPerfilInput;
  }): Promise<UsuarioPerfilModel> => {
    const recursoUsuarioPath = `${usuariosResourcePath}/${usuarioId}`;
    const urlRecursoUsuario = montarUrl({ path: recursoUsuarioPath });
    let response = await fetcher(urlRecursoUsuario, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 404) {
      const responsePerfilAtual = await fetcher(urlRecursoUsuario, {
        method: 'GET',
      });
      const payloadPerfilAtual = await validarResposta({ response: responsePerfilAtual });
      const perfilAtual = validarUsuarioPerfil(payloadPerfilAtual);
      const payloadPut = {
        ...perfilAtual,
        ...payload,
      };

      response = await fetcher(urlRecursoUsuario, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadPut),
      });
    }

    const responsePayload = await validarResposta({ response });
    return validarUsuarioPerfil(responsePayload);
  };

  const excluirPerfilUsuario = async ({ usuarioId }: { usuarioId: number }): Promise<void> => {
    const response = await fetcher(montarUrl({ path: `${usuariosResourcePath}/${usuarioId}` }), {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }
  };

  return {
    buscarPerfisUsuarios,
    criarPerfilUsuario,
    atualizarPerfilUsuario,
    excluirPerfilUsuario,
  };
};
