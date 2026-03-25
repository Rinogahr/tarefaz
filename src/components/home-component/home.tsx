import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Atalho } from '../atalho-component/atalho';
import { UserDados } from '../user-dados-component/user-dados';
import { UsuarioModel } from '../../models/tarefa-model';
import { buscarTarefas } from '../../services/tarefas-service';
import homeStyle from './home.module.css';
import { TaskFormComponent } from '../task-form-component/task-form-component';
import { LoadingComponent } from '../loading-component/loading-component';
import { buscarPerfilPorLogin, buscarPerfisUsuarios } from '../../services/usuario-service';
import { limparSessaoAutenticada } from '../../services/auth-service';

interface UsuarioResumo {
  usuario: UsuarioModel;
  totalTarefas: number;
  tarefasConcluidas: number;
  tarefasPendentes: number;
}

const buscarPrimeiroUsuario = ({ usuarios }: { usuarios: UsuarioResumo[] }): UsuarioResumo | null =>
  usuarios.length > 0 ? usuarios[0] : null;

const aguardarTresSegundos = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });

export const Home = () => {
  const navigate = useNavigate();
  const [usuarioResumo, setUsuarioResumo] = useState<UsuarioResumo | null>(null);
  const [totalGeral, setTotalGeral] = useState(0);
  const [mensagemErro, setMensagemErro] = useState<string>('');
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [isLoadingTela, setIsLoadingTela] = useState<boolean>(true);
  const [isLoadingAberturaForm, setIsLoadingAberturaForm] = useState<boolean>(false);
  const [usuariosRegistrados, setUsuariosRegistrados] = useState<UsuarioModel[]>([]);
  const [usuarioLogadoId, setUsuarioLogadoId] = useState<number | null>(null);

  const handleEditPerfil = (): void => {
    const idDestino = usuarioLogadoId ?? usuarioResumo?.usuario.id;
    if (!idDestino) {
      setMensagemErro('Não foi possível identificar o usuário logado para edição.');
      return;
    }

    navigate(`/home/edit-user/${idDestino}`);
  };

  const carregarDados = useCallback(async (): Promise<void> => {
    setIsLoadingTela(true);
    try {
      const loginLogado = localStorage.getItem('auth-user');
      const perfilUsuarioLogado = loginLogado ? await buscarPerfilPorLogin({ login: loginLogado }) : null;
      const perfisUsuarios = await buscarPerfisUsuarios();
      const perfilPorId = new Map(perfisUsuarios.map((perfil) => [perfil.id, perfil]));
      const idUsuarioLogado = perfilUsuarioLogado?.id ?? null;
      setUsuarioLogadoId(idUsuarioLogado);
      const tarefas = await buscarTarefas();
      setTotalGeral(tarefas.length);

      const usuariosMap = tarefas.reduce<Map<number, UsuarioResumo>>((mapa, tarefa) => {
        tarefa.usuario.forEach((usuario) => {
          const usuarioExistente = mapa.get(usuario.id);

          if (!usuarioExistente) {
            mapa.set(usuario.id, {
              usuario,
              totalTarefas: 1,
              tarefasConcluidas: tarefa.feito ? 1 : 0,
              tarefasPendentes: tarefa.feito ? 0 : 1,
            });
          } else {
            mapa.set(usuario.id, {
              usuario: usuarioExistente.usuario,
              totalTarefas: usuarioExistente.totalTarefas + 1,
              tarefasConcluidas: usuarioExistente.tarefasConcluidas + (tarefa.feito ? 1 : 0),
              tarefasPendentes: usuarioExistente.tarefasPendentes + (tarefa.feito ? 0 : 1),
            });
          }
        });

        return mapa;
      }, new Map<number, UsuarioResumo>());
      const usuariosRegistradosComPerfil = Array.from(usuariosMap.values()).map((usuarioResumoMap) => {
        const perfil = perfilPorId.get(usuarioResumoMap.usuario.id);
        if (!perfil) {
          return usuarioResumoMap.usuario;
        }

        return {
          ...usuarioResumoMap.usuario,
          name: `${perfil.nome} ${perfil.sobrenome}`,
          dados: perfil.email,
          photpth: perfil.imgPerfilPath ?? perfil.imgPerfil,
        };
      });
      setUsuariosRegistrados(usuariosRegistradosComPerfil);

      let usuarioParaExibir: UsuarioResumo | null = null;
      if (idUsuarioLogado && perfilUsuarioLogado) {
        const resumoBase = usuariosMap.get(idUsuarioLogado);
        if (resumoBase) {
          usuarioParaExibir = {
            ...resumoBase,
            usuario: {
              ...resumoBase.usuario,
              name: `${perfilUsuarioLogado.nome} ${perfilUsuarioLogado.sobrenome}`,
              dados: perfilUsuarioLogado.email,
              photpth: perfilUsuarioLogado.imgPerfilPath ?? perfilUsuarioLogado.imgPerfil,
            },
          };
        }
      }

      if (!usuarioParaExibir && perfilUsuarioLogado) {
        usuarioParaExibir = {
          usuario: {
            id: perfilUsuarioLogado.id,
            name: `${perfilUsuarioLogado.nome} ${perfilUsuarioLogado.sobrenome}`,
            dados: perfilUsuarioLogado.email,
            photpth: perfilUsuarioLogado.imgPerfilPath ?? perfilUsuarioLogado.imgPerfil,
          },
          totalTarefas: 0,
          tarefasConcluidas: 0,
          tarefasPendentes: 0,
        };
      }

      if (!usuarioParaExibir) {
        const primeiroResumo = buscarPrimeiroUsuario({ usuarios: Array.from(usuariosMap.values()) });
        if (primeiroResumo) {
          const perfilPrimeiro = perfilPorId.get(primeiroResumo.usuario.id);
          if (perfilPrimeiro) {
            usuarioParaExibir = {
              ...primeiroResumo,
              usuario: {
                ...primeiroResumo.usuario,
                name: `${perfilPrimeiro.nome} ${perfilPrimeiro.sobrenome}`,
                dados: perfilPrimeiro.email,
                photpth: perfilPrimeiro.imgPerfilPath ?? perfilPrimeiro.imgPerfil,
              },
            };
          } else {
            usuarioParaExibir = primeiroResumo;
          }
        }
      }

      if (!usuarioParaExibir) {
        setMensagemErro('Nenhum usuário encontrado');
        return;
      }

      localStorage.setItem('usuario', JSON.stringify(usuarioParaExibir.usuario));
      setUsuarioResumo(usuarioParaExibir);
      setMensagemErro('');
    } catch {
      setMensagemErro('Erro ao carregar os dados do usuário');
    } finally {
      setIsLoadingTela(false);
    }
  }, []);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  const nomeUsuario = useMemo(() => {
    if (!usuarioResumo) {
      return '';
    }

    return `${usuarioResumo.usuario.id} - ${usuarioResumo.usuario.name}`;
  }, [usuarioResumo]);

  const isAdministrador = useMemo<boolean>(() => localStorage.getItem('auth-user') === 'admin', []);

  const abrirFormularioCriacao = async (): Promise<void> => {
    setIsLoadingAberturaForm(true);
    await aguardarTresSegundos();
    setIsLoadingAberturaForm(false);
    setShowTaskForm(true);
  };

  const handleLogout = (): void => {
    limparSessaoAutenticada();
    navigate('/login');
  };

  if (isLoadingTela || isLoadingAberturaForm) {
    return <LoadingComponent texto="Carregando dados e preparando sua navegação..." />;
  }

  if (mensagemErro) {
    return <div>{mensagemErro}</div>;
  }

  return (
    <div className={homeStyle.homeContainer}>
      <div className={homeStyle.homeChildren}>
        <div className={homeStyle.dadosPerfil}>
          <UserDados
            userId={usuarioResumo?.usuario.id}
            userImg={usuarioResumo?.usuario.photpth ?? ''}
            name={nomeUsuario}
            info={usuarioResumo?.usuario.dados ?? ''}
            btEdite={handleEditPerfil}
            btLogout={handleLogout}
            vlPendentes={usuarioResumo?.tarefasPendentes ?? 0}
            vlConcluidas={usuarioResumo?.tarefasConcluidas ?? 0}
            vlTotal={totalGeral}
          />
        </div>
        <div className={homeStyle.btAtalhos}>
          <Atalho
            model="modeloUm"
            titulo="Nova tarefa"
            bgColor="lightSalmon"
            bgTxtColor="textColorDark"
            onClick={() => {
              void abrirFormularioCriacao();
            }}
          />
          <Atalho
            model="modeloUm"
            titulo="Concluidas"
            bgColor="mediumPurple"
            bgTxtColor="textColorDark"
            onClick={() => navigate(`/home/task/${usuarioResumo?.usuario.id}/concluidas`)}
          />
          <Atalho
            model="modeloUm"
            titulo="Em andamento"
            bgColor="paleVioletRed"
            bgTxtColor="textColorDark"
            onClick={() => navigate(`/home/task/${usuarioResumo?.usuario.id}/pendentes`)}
          />
          <Atalho
            model="modeloUm"
            titulo="Atrasadas"
            bgColor="cornflowerBlue"
            bgTxtColor="textColorDark"
            onClick={() => navigate(`/home/task/${usuarioResumo?.usuario.id}`)}
          />
          {isAdministrador && (
            <Atalho
              model="modeloUm"
              titulo="Novo usuário"
              bgColor="aquamarine"
              bgTxtColor="textColorDark"
              onClick={() => navigate('/home/create-user')}
            />
          )}
        </div>
        <Outlet
          context={{
            refreshHome: carregarDados,
            usuarioLogado: usuarioResumo?.usuario,
            usuariosRegistrados,
            isAdministrador,
          }}
        />
      </div>

      {showTaskForm && usuarioResumo && (
        <TaskFormComponent
          modo="criar"
          onCancel={() => setShowTaskForm(false)}
          onSuccess={carregarDados}
          usuarioLogado={usuarioResumo.usuario}
          usuariosRegistrados={usuariosRegistrados}
          isAdministrador={isAdministrador}
        />
      )}
    </div>
  );
};
