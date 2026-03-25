import taskListStyle from './task-list.module.css';
import dayjs from 'dayjs';
import { BiCheck, BiEdit, BiRevision, BiTrash } from 'react-icons/bi';

export type TaskColor =
  | 'taskColor1'
  | 'taskColor2'
  | 'taskColor3'
  | 'taskColor4'
  | 'taskColor5'
  | 'taskColor6'
  | 'taskColor7'
  | 'taskColor8'
  | 'taskColor9'
  | 'taskColor10'
  | 'taskColor11';

interface TaskItemProps {
  taskId: number | string;
  taskImg?: string;
  taskUsuName: string;
  taskTitle: string;
  taskDescription: string;
  taskDateCriacao: string;
  taskDateConclusao: string;
  taskFeito: boolean;
  taskColor: TaskColor;
  canManageActions: boolean;
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const extrairNumero = ({ valor }: { valor: number | string }): number => {
  if (typeof valor === 'number') {
    return valor;
  }

  const numeroConvertido = Number(valor);
  if (Number.isInteger(numeroConvertido)) {
    return numeroConvertido;
  }

  return valor.split('').reduce((acumulador, caractere) => acumulador + caractere.charCodeAt(0), 0);
};

const obterClasseContraste = ({ taskColor, taskId }: { taskColor: TaskColor; taskId: number | string }): string => {
  const numeroBase = Math.abs(extrairNumero({ valor: taskId })) % 3;
  const sufixo = numeroBase + 1;
  const coresEscuras: TaskColor[] = ['taskColor2', 'taskColor4', 'taskColor5', 'taskColor9'];
  return coresEscuras.includes(taskColor) ? `contrasteEscuro${sufixo}` : `contrasteClaro${sufixo}`;
};

export const TaskList = ({
  taskId,
  taskImg,
  taskUsuName,
  taskTitle,
  taskDescription,
  taskDateCriacao,
  taskDateConclusao,
  taskFeito,
  taskColor,
  canManageActions,
  onToggleStatus,
  onEdit,
  onDelete,
}: TaskItemProps) => {
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

  const taskColorClass = taskListStyle[taskColor];
  const contrasteClass = taskListStyle[obterClasseContraste({ taskColor, taskId })];
  const dataCriacaoFormatada = dayjs(taskDateCriacao).format('DD/MM/YYYY HH:mm');
  const dataConclusaoFormatada = taskFeito
    ? dayjs(taskDateConclusao).format('DD/MM/YYYY HH:mm')
    : 'Tarefa não concluída';

  const imageSrc = normalizarCaminhoImagem({ caminhoImagem: taskImg || 'src/assets/avatar/vista-da-mulher-3d.jpg' });

  return (
    <div className={`${taskListStyle.taskLitContainer} ${taskColorClass} ${contrasteClass}`}>
      <div className={taskListStyle.imgContainer}>
        <img src={imageSrc} alt="photoPerfil" />
      </div>

      <div className={taskListStyle.contentContainer}>
        <div className={taskListStyle.taskHeader}>
          <span className={taskListStyle.userName}>Usuário: {taskUsuName}</span>
          <span className={taskListStyle.taskStatus}>
            Status: {taskFeito ? 'Concluída' : 'Pendente'}
          </span>
        </div>

        <div className={taskListStyle.taskBody}>
          <h3 className={taskListStyle.taskTitle}>Título: {taskTitle}</h3>
          <p className={taskListStyle.taskDescription}>Descrição: {taskDescription}</p>
        </div>

        <div className={taskListStyle.taskFooter}>
          <div className={taskListStyle.dateInfo}>
            <span>Criação: {dataCriacaoFormatada}</span>
            <span>Conclusão: {dataConclusaoFormatada}</span>
          </div>
        </div>
      </div>

      <div className={taskListStyle.taskBtContainer}>
        <button
          className={`${taskListStyle.btnAction} ${taskListStyle.btnEdit}`}
          onClick={onEdit}
          title={canManageActions ? 'Editar tarefa' : 'Ação bloqueada para tarefas de outro usuário'}
          disabled={taskFeito || !canManageActions}
        >
          <BiEdit size={24} />
        </button>
        <button
          className={`${taskListStyle.btnAction} ${taskListStyle.btnComplete}`}
          onClick={onToggleStatus}
          title={
            canManageActions
              ? taskFeito
                ? 'Desmarcar conclusão'
                : 'Marcar como concluída'
              : 'Ação bloqueada para tarefas de outro usuário'
          }
          disabled={!canManageActions}
        >
          {taskFeito ? <BiRevision size={24} /> : <BiCheck size={24} />}
        </button>
        <button
          className={`${taskListStyle.btnAction} ${taskListStyle.btnDelete}`}
          onClick={onDelete}
          title={canManageActions ? 'Excluir tarefa' : 'Ação bloqueada para tarefas de outro usuário'}
          disabled={!canManageActions}
        >
          <BiTrash size={24} />
        </button>
      </div>
    </div>
  );
};
