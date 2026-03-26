import * as usersData from '../../../../data/users.json';
import { RegistrarUsuarioInput, UsuarioAutenticacaoModel, validarUsuarioAutenticacao, validarUsuariosAutenticacao } from './auth-model';

const authApiBaseUrl = 'http://localhost:5002';
const usersResourcePath = '/users';

interface UsersDataModel {
  users: unknown;
}

interface CriarAuthRepositoryInput {
  fetcher?: typeof fetch;
}

export interface AuthRepository {
  buscarUsuarios: () => Promise<UsuarioAutenticacaoModel[]>;
  registrarUsuario: (input: RegistrarUsuarioInput) => Promise<UsuarioAutenticacaoModel>;
  atualizarSenhaUsuario: ({ usuarioId, senha }: { usuarioId: number; senha: string }) => Promise<UsuarioAutenticacaoModel>;
  atualizarLoginUsuario: ({ usuarioId, login }: { usuarioId: number; login: string }) => Promise<UsuarioAutenticacaoModel>;
  excluirUsuario: ({ usuarioId }: { usuarioId: number }) => Promise<void>;
}

const montarUrl = ({ path }: { path: string }): string => `${authApiBaseUrl}${path}`;

const extrairUsuariosFallback = (): UsuarioAutenticacaoModel[] => {
  const fonteDados = usersData as UsersDataModel & { default?: UsersDataModel };
  const payload = fonteDados.users ?? fonteDados.default?.users ?? [];
  return validarUsuariosAutenticacao(payload);
};

const validarResposta = async ({ response }: { response: Response }): Promise<unknown> => {
  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }

  return response.json();
};

const calcularProximoId = ({ usuarios }: { usuarios: UsuarioAutenticacaoModel[] }): number =>
  usuarios.reduce<number>((maiorId, usuario) => Math.max(maiorId, usuario.id), 0) + 1;

const criarFetcherIndisponivel = (): typeof fetch => async (): Promise<Response> => {
  throw new Error('Fetch indisponível');
};

const resolverFetcher = ({ fetcher }: CriarAuthRepositoryInput): typeof fetch => {
  if (fetcher) {
    return fetcher;
  }

  if (typeof globalThis.fetch === 'function') {
    return globalThis.fetch.bind(globalThis);
  }

  return criarFetcherIndisponivel();
};

export const criarAuthRepository = (input: CriarAuthRepositoryInput = {}): AuthRepository => {
  const fetcher = resolverFetcher(input);

  const buscarUsuarios = async (): Promise<UsuarioAutenticacaoModel[]> => {
    try {
      const response = await fetcher(montarUrl({ path: usersResourcePath }), {
        method: 'GET',
      });
      const payload = await validarResposta({ response });
      return validarUsuariosAutenticacao(payload);
    } catch {
      return extrairUsuariosFallback();
    }
  };

  const registrarUsuario = async ({ id, login, senha }: RegistrarUsuarioInput): Promise<UsuarioAutenticacaoModel> => {
    const usuarios = await buscarUsuarios();
    const proximoId = calcularProximoId({ usuarios });
    const payloadComId = { id: id ?? proximoId, login, senha };

    const response = await fetcher(montarUrl({ path: usersResourcePath }), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadComId),
    });

    const payload = await validarResposta({ response });
    return validarUsuarioAutenticacao(payload);
  };

  const atualizarSenhaUsuario = async ({
    usuarioId,
    senha,
  }: {
    usuarioId: number;
    senha: string;
  }): Promise<UsuarioAutenticacaoModel> => {
    const response = await fetcher(montarUrl({ path: `${usersResourcePath}/${usuarioId}` }), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ senha }),
    });

    const payload = await validarResposta({ response });
    return validarUsuarioAutenticacao(payload);
  };

  const atualizarLoginUsuario = async ({
    usuarioId,
    login,
  }: {
    usuarioId: number;
    login: string;
  }): Promise<UsuarioAutenticacaoModel> => {
    const response = await fetcher(montarUrl({ path: `${usersResourcePath}/${usuarioId}` }), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ login }),
    });

    const payload = await validarResposta({ response });
    return validarUsuarioAutenticacao(payload);
  };

  const excluirUsuario = async ({ usuarioId }: { usuarioId: number }): Promise<void> => {
    const response = await fetcher(montarUrl({ path: `${usersResourcePath}/${usuarioId}` }), {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }
  };

  return {
    buscarUsuarios,
    registrarUsuario,
    atualizarSenhaUsuario,
    atualizarLoginUsuario,
    excluirUsuario,
  };
};
