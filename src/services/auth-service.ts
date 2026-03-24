import { z } from 'zod';
import usersData from '../../data/users.json';

const authApiBaseUrl = 'http://localhost:5002';
const usersResourcePath = '/users';
const authStorageKey = 'auth-user';

const usuarioAutenticacaoSchema = z.object({
  id: z.number().int().positive(),
  login: z.string().min(1),
  senha: z.string().min(1),
});

const usuariosAutenticacaoSchema = z.array(usuarioAutenticacaoSchema);

interface UsersDataModel {
  users: unknown;
}

export interface UsuarioAutenticacaoModel {
  id: number;
  login: string;
  senha: string;
}

const montarUrl = ({ path }: { path: string }): string => `${authApiBaseUrl}${path}`;

const validarUsuarios = (payload: unknown): UsuarioAutenticacaoModel[] => usuariosAutenticacaoSchema.parse(payload);

const extrairUsuariosFallback = (): UsuarioAutenticacaoModel[] => {
  const payload = (usersData as UsersDataModel).users;
  return validarUsuarios(payload);
};

export const buscarUsuarios = async (): Promise<UsuarioAutenticacaoModel[]> => {
  try {
    const response = await fetch(montarUrl({ path: usersResourcePath }), {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const payload = await response.json();
    return validarUsuarios(payload);
  } catch {
    return extrairUsuariosFallback();
  }
};

export const registrarUsuario = async ({
  login,
  senha,
}: {
  login: string;
  senha: string;
}): Promise<UsuarioAutenticacaoModel> => {
  const usuarios = await buscarUsuarios();
  const usuarioExistente = usuarios.find((usuario) => usuario.login === login);
  if (usuarioExistente) {
    throw new Error('Usuário já cadastrado');
  }

  const proximoId = usuarios.reduce<number>((maiorId, usuario) => Math.max(maiorId, usuario.id), 0) + 1;
  const payload = { id: proximoId, login, senha };

  const response = await fetch(montarUrl({ path: usersResourcePath }), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Não foi possível cadastrar usuário');
  }

  const responsePayload = await response.json();
  return usuarioAutenticacaoSchema.parse(responsePayload);
};

export const autenticarUsuario = async ({
  login,
  senha,
}: {
  login: string;
  senha: string;
}): Promise<boolean> => {
  const usuarios = await buscarUsuarios();
  return usuarios.some((usuario) => usuario.login === login && usuario.senha === senha);
};

export const salvarSessaoAutenticada = ({ login }: { login: string }): void => {
  localStorage.setItem(authStorageKey, login);
};

export const limparSessaoAutenticada = (): void => {
  localStorage.removeItem(authStorageKey);
};

export const possuiSessaoAutenticada = (): boolean => Boolean(localStorage.getItem(authStorageKey));
