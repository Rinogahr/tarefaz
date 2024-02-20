import taskListStyle from './task-list.module.css';

import more from '../../../assets/more.png';


type  TaskItemProps = {
    taskImg?:  any,
    taskUsuName:  string,
    taskTitle:    string,
    taskSubTitle?:  string | number,
    taskTime?:      string | number | null,
    taskDateCriacao?:    Date | string | undefined,
    tskDateCoclusao?:      Date | string | undefined,
    tskFunction?  : () => void,
    taskColor?:  "taskColor1" | "taskColor2" |"taskColor3" |"taskColor4" |"taskColor5" |"taskColor6" |"taskColor7" |"taskColor8" |"taskColor9" |"taskColor10" | "taskColor11",
    taskChildren?: string | undefined,
}

export const TaskList = (task: TaskItemProps) => {
    const taskColorClass = task.taskColor ? taskListStyle[task.taskColor] : '';

    return(
        <div className={`${taskListStyle.taskLitContainer} ${taskColorClass}`}>
            <div className={taskListStyle.imgContainer}>
                <img src={task.taskImg} alt="photoPerfil" />
            </div>
            <div className={taskListStyle.titleContainer}>
                <div className={taskListStyle.taskDadosContainer}>
                    <h3>Nome: {task.taskUsuName}</h3>
                    <h4>Título: {task.taskTitle}</h4>
                    <h5>SubTítulo: {task.taskSubTitle}</h5>
                </div>
                <div className={taskListStyle.infoTaskContainer}>
                    <div>{task.taskTime}</div>
                    <div>{task.taskDateCriacao instanceof Date ? task.taskDateCriacao.toLocaleDateString() : task.taskDateCriacao}</div>
                    <div>{task.tskDateCoclusao instanceof Date ? task.tskDateCoclusao.toLocaleDateString() : task.tskDateCoclusao}</div>
                </div>
            </div>
            <div className={taskListStyle.taskBtContainer}>
                <div>
                    <img src={more} alt='moreIcon'/>
                </div>
                <div>{task.taskChildren}</div>
            </div>
        </div>
    );
}