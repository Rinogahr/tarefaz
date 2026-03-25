import { useEffect, useState, useCallback } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { TarefaModel, UsuarioModel } from '../../models/tarefa-model';
import {
  buscarTarefas,
  buscarTarefasPorUsuario,
  excluirTarefa,
  marcarComoConcluida,
  marcarComoPendente,
} from '../../services/tarefas-service';
import { TaskList, TaskColor } from './task-list-component/task-list';
import { LoadingComponent } from '../loading-component/loading-component';
import { TaskFormComponent } from '../task-form-component/task-form-component';
import { buscarPerfisUsuarios } from '../../services/usuario-service';

const cores: TaskColor[] = [
  'taskColor1',
  'taskColor2',
  'taskColor3',
  'taskColor4',
  'taskColor5',
  'taskColor6',
  'taskColor7',
  'taskColor8',
  'taskColor9',
  'taskColor10',
  'taskColor11',
];

interface HomeContext {
  refreshHome: () => Promise<void>;
  usuarioLogado?: UsuarioModel;
  usuariosRegistrados?: UsuarioModel[];
  isAdministrador?: boolean;
}

const aguardarTresSegundos = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });

const extrairNumeroParaCor = ({ id }: { id: number | string }): number => {
  if (typeof id === 'number') {
    return id;
  }

  const numeroConvertido = Number(id);
  if (Number.isInteger(numeroConvertido)) {
    return numeroConvertido;
  }

  return id.split('').reduce((acumulador, caractere) => acumulador + caractere.charCodeAt(0), 0);
};

export const Tarefa = () => {
  const params = useParams<{ id: string; status?: string }>();
  const { refreshHome, usuarioLogado, usuariosRegistrados, isAdministrador } = useOutletContext<HomeContext>();
  const [tarefaFiltrada, setTarefaFiltrada] = useState<TarefaModel[]>([]);
  const [mensagemErro, setMensagemErro] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpeningEditForm, setIsOpeningEditForm] = useState<boolean>(false);
  const [tarefaEdicao, setTarefaEdicao] = useState<TarefaModel | null>(null);
  const podeGerenciarTarefa = useCallback(
    ({ tarefa }: { tarefa: TarefaModel }): boolean => {
      if (isAdministrador) {
        return true;
      }

      if (!usuarioLogado) {
        return false;
      }

      return tarefa.usuario.some((usuario) => usuario.id === usuarioLogado.id);
    },
    [isAdministrador, usuarioLogado],
  );

  const carregarTarefas = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const idParam = params.id ?? '';
      const statusParam = params.status;
      
      let tarefas: TarefaModel[] = [];
      if (idParam === 'all') {
        tarefas = await buscarTarefas();
      } else {
        const usuarioId = Number(idParam);
        if (Number.isNaN(usuarioId)) {
          setTarefaFiltrada([]);
          setMensagemErro('Filtro de usuário inválido');
          return;
        }
        tarefas = await buscarTarefasPorUsuario({ usuarioId });
      }

      if (statusParam === 'concluidas') {
        tarefas = tarefas.filter((t) => t.feito);
      } else if (statusParam === 'pendentes') {
        tarefas = tarefas.filter((t) => !t.feito);
      }

      const perfisUsuarios = await buscarPerfisUsuarios();
      const perfilPorId = new Map(perfisUsuarios.map((perfil) => [perfil.id, perfil]));
      const tarefasComPerfilAtualizado = tarefas.map((tarefaAtual) => ({
        ...tarefaAtual,
        usuario: tarefaAtual.usuario.map((usuarioTarefa) => {
          const perfil = perfilPorId.get(usuarioTarefa.id);
          if (!perfil) {
            return usuarioTarefa;
          }

          return {
            ...usuarioTarefa,
            name: `${perfil.nome} ${perfil.sobrenome}`,
            dados: perfil.email,
            photpth: perfil.imgPerfilPath ?? perfil.imgPerfil,
          };
        }),
      }));

      setTarefaFiltrada(tarefasComPerfilAtualizado);
      setMensagemErro('');
    } catch {
      setMensagemErro('Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }, [params.id, params.status]);

  useEffect(() => {
    void carregarTarefas();
  }, [carregarTarefas]);

  const handleAlternarStatusTarefa = async (tarefa: TarefaModel): Promise<void> => {
    if (!podeGerenciarTarefa({ tarefa })) {
      alert('Você só pode alterar tarefas que pertencem ao seu usuário.');
      return;
    }

    try {
      if (tarefa.feito) {
        await marcarComoPendente({ tarefa });
      } else {
        await marcarComoConcluida({ tarefa });
      }
      await carregarTarefas();
      await refreshHome();
    } catch {
      alert('Erro ao atualizar status da tarefa');
    }
  };

  const handleExcluirTarefa = async ({ tarefa }: { tarefa: TarefaModel }): Promise<void> => {
    if (!podeGerenciarTarefa({ tarefa })) {
      alert('Você só pode excluir tarefas que pertencem ao seu usuário.');
      return;
    }

    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

    try {
      await excluirTarefa({ tarefaId: tarefa.id });
      await carregarTarefas();
      await refreshHome();
    } catch {
      alert('Erro ao excluir tarefa');
    }
  };

  const handleEditarTarefa = async (tarefa: TarefaModel): Promise<void> => {
    if (!podeGerenciarTarefa({ tarefa })) {
      alert('Você só pode editar tarefas que pertencem ao seu usuário.');
      return;
    }

    if (tarefa.feito) {
      alert('Tarefas concluídas não podem ser editadas.');
      return;
    }

    setIsOpeningEditForm(true);
    await aguardarTresSegundos();
    setIsOpeningEditForm(false);
    setTarefaEdicao(tarefa);
  };

  const obterCorAleatoria = (id: number | string): TaskColor => {
    const numeroBase = extrairNumeroParaCor({ id });
    return cores[Math.abs(numeroBase) % cores.length];
  };

  if (loading || isOpeningEditForm) {
    return <LoadingComponent texto="Carregando tarefas..." />;
  }

  if (mensagemErro) {
    return <div style={{ color: 'red', padding: '1rem' }}>{mensagemErro}</div>;
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {tarefaFiltrada.length === 0 ? (
        <h3>O usuário não possui tarefas</h3>
      ) : (
        tarefaFiltrada.map((task) => (
          <TaskList
            key={task.id}
            taskId={task.id}
            canManageActions={podeGerenciarTarefa({ tarefa: task })}
            onToggleStatus={() => handleAlternarStatusTarefa(task)}
            onEdit={() => {
              void handleEditarTarefa(task);
            }}
            onDelete={() => {
              void handleExcluirTarefa({ tarefa: task });
            }}
            taskColor={obterCorAleatoria(task.id)}
            taskDateConclusao={task.dataFim}
            taskDateCriacao={task.dataInicio}
            taskDescription={task.descricao}
            taskFeito={task.feito}
            taskImg={task.usuario[0]?.photpth}
            taskTitle={task.titulo}
            taskUsuName={task.usuario[0]?.name}
          />
        ))
      )}
      {tarefaEdicao && usuarioLogado && (
        <TaskFormComponent
          modo="editar"
          tarefa={tarefaEdicao}
          onCancel={() => setTarefaEdicao(null)}
          onSuccess={async () => {
            await carregarTarefas();
            await refreshHome();
          }}
          usuarioLogado={usuarioLogado}
          usuariosRegistrados={usuariosRegistrados ?? []}
          isAdministrador={Boolean(isAdministrador)}
        />
      )}
    </div>
  );
};
