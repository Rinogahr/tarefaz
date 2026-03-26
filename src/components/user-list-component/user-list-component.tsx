import { Button } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { excluirUsuario } from '../../services/auth-service';
import { LoadingComponent } from '../loading-component/loading-component';
import { excluirPerfilUsuario, buscarPerfilPorLogin, buscarPerfisUsuarios } from '../../services/usuario-service';
import userListStyle from './user-list-component.module.css';

interface UsuarioTelaModel {
  id: number;
  login: string;
  nome: string;
  sobrenome: string;
  dataNascimento: string;
  telefone: string;
  email: string;
  tipoUsuario: 'admin' | 'regular';
  imgPerfil: string;
  imgPerfilPath?: string;
}

const normalizarCaminhoImagem = ({ caminhoImagem }: { caminhoImagem: string }): string => {
  const caminhoNormalizado = caminhoImagem.replace(/\\/g, '/');
  if (
    caminhoNormalizado.startsWith('data:image') ||
    caminhoNormalizado.startsWith('http://') ||
    caminhoNormalizado.startsWith('https://')
  ) {
    return caminhoNormalizado;
  }

  return caminhoNormalizado.startsWith('/') ? caminhoNormalizado : `/${caminhoNormalizado}`;
};

const ordenarPorId = ({ usuarios }: { usuarios: UsuarioTelaModel[] }): UsuarioTelaModel[] =>
  [...usuarios].sort((usuarioA, usuarioB) => usuarioA.id - usuarioB.id);

export const UserListComponent = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<UsuarioTelaModel[]>([]);
  const [usuarioSessao, setUsuarioSessao] = useState<UsuarioTelaModel | null>(null);
  const [isLoadingTela, setIsLoadingTela] = useState<boolean>(true);
  const [isLoadingAcao, setIsLoadingAcao] = useState<boolean>(false);
  const [mensagemErro, setMensagemErro] = useState<string>('');

  const carregarDados = useCallback(async (): Promise<void> => {
    setIsLoadingTela(true);
    setMensagemErro('');
    try {
      const loginSessao = localStorage.getItem('auth-user');
      if (!loginSessao) {
        throw new Error('Não foi possível identificar a sessão autenticada.');
      }

      const [perfilSessao, perfisUsuarios] = await Promise.all([
        buscarPerfilPorLogin({ login: loginSessao }),
        buscarPerfisUsuarios(),
      ]);

      if (!perfilSessao) {
        throw new Error('Não foi possível carregar o perfil do usuário logado.');
      }

      setUsuarioSessao(perfilSessao);
      setUsuarios(ordenarPorId({ usuarios: perfisUsuarios }));
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Falha ao carregar usuários.';
      setMensagemErro(mensagem);
    } finally {
      setIsLoadingTela(false);
    }
  }, []);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  const isAdministrador = useMemo<boolean>(() => usuarioSessao?.tipoUsuario === 'admin', [usuarioSessao]);

  const usuariosVisiveis = useMemo<UsuarioTelaModel[]>(() => {
    if (!usuarioSessao) {
      return [];
    }
    return usuarios;
  }, [usuarioSessao, usuarios]);

  const handleAtualizarUsuario = ({ usuarioId }: { usuarioId: number }): void => {
    navigate(`/home/edit-user/${usuarioId}?from=users`);
  };

  const handleExcluirUsuario = async ({ usuarioId }: { usuarioId: number }): Promise<void> => {
    if (!isAdministrador) {
      setMensagemErro('Somente administradores podem excluir usuários.');
      return;
    }

    const confirmarExclusao = globalThis.confirm('Deseja realmente excluir este usuário?');
    if (!confirmarExclusao) {
      return;
    }

    try {
      setIsLoadingAcao(true);
      await excluirPerfilUsuario({ usuarioId });
      await excluirUsuario({ usuarioId });
      await carregarDados();
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Não foi possível excluir o usuário.';
      setMensagemErro(mensagem);
    } finally {
      setIsLoadingAcao(false);
    }
  };

  const handleCriarUsuario = (): void => {
    navigate('/home/create-user?from=users');
  };

  const handleVoltarHome = (): void => {
    navigate('/home');
  };

  if (isLoadingTela || isLoadingAcao) {
    return <LoadingComponent texto="Carregando lista de usuários..." />;
  }

  return (
    <div className={userListStyle.screenContainer}>
      <div className={userListStyle.headerContainer}>
        <h1 className={userListStyle.title}>Lista de Usuários</h1>
        <div className={userListStyle.actionsHeader}>
          {isAdministrador && (
            <Button variant="contained" sx={{ textTransform: 'none' }} onClick={handleCriarUsuario}>
              Criar novo usuário
            </Button>
          )}
          <Button variant="outlined" color="inherit" sx={{ textTransform: 'none' }} onClick={handleVoltarHome}>
            Voltar para Home
          </Button>
        </div>
      </div>

      {mensagemErro && <p className={userListStyle.messageError}>{mensagemErro}</p>}

      <div className={userListStyle.listContainer}>
        {usuariosVisiveis.map((usuario) => {
          const podeAtualizar = isAdministrador || usuarioSessao?.id === usuario.id;
          const avatarSrc = normalizarCaminhoImagem({ caminhoImagem: usuario.imgPerfilPath ?? usuario.imgPerfil });

          return (
            <div className={userListStyle.card} key={usuario.id}>
              <div className={userListStyle.avatarContainer}>
                <img alt={`${usuario.nome} ${usuario.sobrenome}`} className={userListStyle.avatarImage} src={avatarSrc} />
              </div>

              <div className={userListStyle.cardContent}>
                <div className={userListStyle.cardHeader}>
                  <h2 className={userListStyle.cardTitle}>{`${usuario.id} - ${usuario.nome} ${usuario.sobrenome}`}</h2>
                  <span className={userListStyle.userType}>{usuario.tipoUsuario}</span>
                </div>
                <div className={userListStyle.cardBody}>
                  <p><strong>Login:</strong> {usuario.login}</p>
                  <p><strong>Nome:</strong> {usuario.nome}</p>
                  <p><strong>Sobrenome:</strong> {usuario.sobrenome}</p>
                  <p><strong>Data de Nascimento:</strong> {usuario.dataNascimento}</p>
                  <p><strong>Telefone:</strong> {usuario.telefone}</p>
                  <p><strong>Email:</strong> {usuario.email}</p>
                </div>
              </div>

              <div className={userListStyle.cardActions}>
                {isAdministrador && (
                  <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => handleAtualizarUsuario({ usuarioId: usuario.id })}>
                    Editar
                  </Button>
                )}
                {!isAdministrador && (
                  <Button
                    variant="contained"
                    sx={{ textTransform: 'none' }}
                    disabled={!podeAtualizar}
                    onClick={() => handleAtualizarUsuario({ usuarioId: usuario.id })}
                  >
                    Atualizar meus dados
                  </Button>
                )}
                {isAdministrador && (
                  <Button
                    variant="outlined"
                    color="error"
                    sx={{ textTransform: 'none' }}
                    onClick={() => {
                      void handleExcluirUsuario({ usuarioId: usuario.id });
                    }}
                  >
                    Deletar
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
