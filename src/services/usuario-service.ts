import usuarioListData from '../../data/usuario-list.json';
import {
  AtualizarUsuarioPerfilInput,
  CriarUsuarioPerfilInput,
  UsuarioPerfilModel,
  validarUsuarioPerfil,
  validarUsuariosPerfil,
} from '../models/usuario-model';
import { buscarUsuarios, UsuarioAutenticacaoModel } from './auth-service';

const usuarioApiBaseUrl = 'http://localhost:5003';
const usuariosResourcePath = '/usuarios';

interface UsuarioListDataModel {
  usuarios: unknown;
}

const montarUrl = ({ path }: { path: string }): string => `${usuarioApiBaseUrl}${path}`;

const validarResposta = async ({ response }: { response: Response }): Promise<unknown> => {
  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }

  return response.json();
};

const extrairUsuariosFallback = (): UsuarioPerfilModel[] => {
  const payload = (usuarioListData as UsuarioListDataModel).usuarios;
  return validarUsuariosPerfil(payload);
};

const calcularProximoId = ({
  usuariosAuth,
  usuariosPerfil,
}: {
  usuariosAuth: UsuarioAutenticacaoModel[];
  usuariosPerfil: UsuarioPerfilModel[];
}): number => {
  const maiorIdAuth = usuariosAuth.reduce<number>((maiorId, usuario) => Math.max(maiorId, usuario.id), 0);
  const maiorIdPerfil = usuariosPerfil.reduce<number>((maiorId, usuario) => Math.max(maiorId, usuario.id), 0);
  return Math.max(maiorIdAuth, maiorIdPerfil) + 1;
};

export const buscarPerfisUsuarios = async (): Promise<UsuarioPerfilModel[]> => {
  try {
    const response = await fetch(montarUrl({ path: usuariosResourcePath }), {
      method: 'GET',
    });

    const payload = await validarResposta({ response });
    return validarUsuariosPerfil(payload);
  } catch {
    return extrairUsuariosFallback();
  }
};

export const buscarPerfilPorId = async ({ usuarioId }: { usuarioId: number }): Promise<UsuarioPerfilModel | null> => {
  const usuarios = await buscarPerfisUsuarios();
  return usuarios.find((usuario) => usuario.id === usuarioId) ?? null;
};

export const buscarPerfilPorLogin = async ({
  login,
}: {
  login: string;
}): Promise<UsuarioPerfilModel | null> => {
  const usuarios = await buscarPerfisUsuarios();
  return usuarios.find((usuario) => usuario.login === login) ?? null;
};

export const gerarProximoIdUsuario = async (): Promise<number> => {
  const [usuariosAuth, usuariosPerfil] = await Promise.all([buscarUsuarios(), buscarPerfisUsuarios()]);
  return calcularProximoId({ usuariosAuth, usuariosPerfil });
};

export const criarPerfilUsuario = async ({
  payload,
}: {
  payload: CriarUsuarioPerfilInput;
}): Promise<UsuarioPerfilModel> => {
  const response = await fetch(montarUrl({ path: usuariosResourcePath }), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responsePayload = await validarResposta({ response });
  return validarUsuarioPerfil(responsePayload);
};

export const atualizarPerfilUsuario = async ({
  usuarioId,
  payload,
}: {
  usuarioId: number;
  payload: AtualizarUsuarioPerfilInput;
}): Promise<UsuarioPerfilModel> => {
  const response = await fetch(montarUrl({ path: `${usuariosResourcePath}/${usuarioId}` }), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responsePayload = await validarResposta({ response });
  return validarUsuarioPerfil(responsePayload);
};
