import taskListStyle from './task-list.module.css';
import dayjs from 'dayjs';
import { BiCheck, BiTrash } from 'react-icons/bi';

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
  taskImg?: string;
  taskUsuName: string;
  taskTitle: string;
  taskDescription: string;
  taskDateCriacao: string;
  taskDateConclusao: string;
  taskFeito: boolean;
  taskColor: TaskColor;
  onComplete: () => void;
  onDelete: () => void;
}

export const TaskList = ({
  taskImg,
  taskUsuName,
  taskTitle,
  taskDescription,
  taskDateCriacao,
  taskDateConclusao,
  taskFeito,
  taskColor,
  onComplete,
  onDelete,
}: TaskItemProps) => {
  const taskColorClass = taskListStyle[taskColor];
  const dataCriacaoFormatada = dayjs(taskDateCriacao).format('DD/MM/YYYY HH:mm');
  const dataConclusaoFormatada = taskFeito
    ? dayjs(taskDateConclusao).format('DD/MM/YYYY HH:mm')
    : 'Tarefa não concluída';

  const imageSrc = taskImg?.startsWith('http') || taskImg?.startsWith('/') ? taskImg : `/${taskImg}`;

  return (
    <div className={`${taskListStyle.taskLitContainer} ${taskColorClass}`}>
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
          className={`${taskListStyle.btnAction} ${taskListStyle.btnComplete}`}
          onClick={onComplete}
          title="Marcar como concluída"
          disabled={taskFeito}
        >
          <BiCheck size={24} />
        </button>
        <button
          className={`${taskListStyle.btnAction} ${taskListStyle.btnDelete}`}
          onClick={onDelete}
          title="Excluir tarefa"
        >
          <BiTrash size={24} />
        </button>
      </div>
    </div>
  );
};
