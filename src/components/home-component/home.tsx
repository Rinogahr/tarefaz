import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Atalho } from '../atalho-component/atalho';
import { UserDados } from '../user-dados-component/user-dados';
import { UsuarioModel } from '../../models/tarefa-model';
import { buscarTarefas } from '../../services/tarefas-service';
import homeStyle from './home.module.css';
import { TaskModal } from '../tarefa-component/task-modal';

interface UsuarioResumo {
  usuario: UsuarioModel;
  totalTarefas: number;
  tarefasConcluidas: number;
  tarefasPendentes: number;
}

const buscarPrimeiroUsuario = ({ usuarios }: { usuarios: UsuarioResumo[] }): UsuarioResumo | null =>
  usuarios.length > 0 ? usuarios[0] : null;

export const Home = () => {
  const navigate = useNavigate();
  const [usuarioResumo, setUsuarioResumo] = useState<UsuarioResumo | null>(null);
  const [totalGeral, setTotalGeral] = useState(0);
  const [mensagemErro, setMensagemErro] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  const handleEditPerfil = (): void => {
    alert('editando o perfil');
  };

  const carregarDados = useCallback(async (): Promise<void> => {
    try {
      const loginLogado = localStorage.getItem('auth-user');
      const tarefas = await buscarTarefas();
      setTotalGeral(tarefas.length);
      
      // Mapeia todos os usuários encontrados nas tarefas
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

      // Tenta encontrar o usuário pelo login (assumindo que id 1 é admin)
      const idUsuarioLogado = loginLogado === 'admin' ? 1 : null;
      
      let usuarioParaExibir: UsuarioResumo | null = null;
      if (idUsuarioLogado) {
        usuarioParaExibir = usuariosMap.get(idUsuarioLogado) ?? null;
      }

      // Fallback para o primeiro usuário se não encontrar o logado
      if (!usuarioParaExibir) {
        usuarioParaExibir = buscarPrimeiroUsuario({ usuarios: Array.from(usuariosMap.values()) });
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
            onClick={() => setShowModal(true)}
          />
          <Atalho
            model="modeloUm"
            titulo="Concluidas"
            bgColor="mediumPurple"
            bgTxtColor="textColorDark"
            onClick={() => navigate(`/task/${usuarioResumo?.usuario.id}`)}
          />
          <Atalho
            model="modeloUm"
            titulo="Em andamento"
            bgColor="paleVioletRed"
            bgTxtColor="textColorDark"
            onClick={() => navigate(`/task/${usuarioResumo?.usuario.id}`)}
          />
          <Atalho
            model="modeloUm"
            titulo="Atrasadas"
            bgColor="cornflowerBlue"
            bgTxtColor="textColorDark"
            onClick={() => navigate(`/task/${usuarioResumo?.usuario.id}`)}
          />
        </div>
        <Outlet context={{ refreshHome: carregarDados }} />
      </div>

      {showModal && usuarioResumo && (
        <TaskModal
          onClose={() => setShowModal(false)}
          onSuccess={carregarDados}
          usuarioLogado={usuarioResumo.usuario}
        />
      )}
    </div>
  );
};
