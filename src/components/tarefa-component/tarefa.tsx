import { useEffect, useState, useCallback } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { TarefaModel } from '../../models/tarefa-model';
import {
  buscarTarefas,
  buscarTarefasPorUsuario,
  excluirTarefa,
  marcarComoConcluida,
} from '../../services/tarefas-service';
import { TaskList, TaskColor } from './task-list-component/task-list';
import dayjs from 'dayjs';

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
}

export const Tarefa = () => {
  const params = useParams<{ id: string; status?: string }>();
  const { refreshHome } = useOutletContext<HomeContext>();
  const [tarefaFiltrada, setTarefaFiltrada] = useState<TarefaModel[]>([]);
  const [mensagemErro, setMensagemErro] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

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

      // Filtrar por status se fornecido
      if (statusParam === 'concluidas') {
        tarefas = tarefas.filter((t) => t.feito);
      } else if (statusParam === 'pendentes') {
        tarefas = tarefas.filter((t) => !t.feito);
      }

      setTarefaFiltrada(tarefas);
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

  const handleMarcarComoConcluida = async (tarefa: TarefaModel): Promise<void> => {
    try {
      await marcarComoConcluida({ tarefa });
      await carregarTarefas();
      await refreshHome();
    } catch {
      alert('Erro ao marcar tarefa como concluída');
    }
  };

  const handleExcluirTarefa = async (tarefaId: number): Promise<void> => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

    try {
      await excluirTarefa({ tarefaId });
      await carregarTarefas();
      await refreshHome();
    } catch {
      alert('Erro ao excluir tarefa');
    }
  };

  const obterCorAleatoria = (id: number): TaskColor => {
    return cores[id % cores.length];
  };

  if (loading) {
    return <div>Carregando tarefas...</div>;
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
            onComplete={() => handleMarcarComoConcluida(task)}
            onDelete={() => handleExcluirTarefa(task.id)}
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
    </div>
  );
};
