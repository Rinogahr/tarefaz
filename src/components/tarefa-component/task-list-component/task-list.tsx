import taskListStyle from './task-list.module.css';

import photo from '../../../assets/avatar/marki.jpg';


type  TaskItemProps = {
    taskImg?:  any,
    taskUsuName:  string,
    taskTitle:    string,
    taskSubTitle?:  string | number,
    taskTime?:      Date | string | number | null,
    taskDateCriacao?:    Date | string | undefined,
    tskDateCoclusao?:      Date | string | undefined,
    tskFunction?  : () => void,
    taskColor?:  "taskColor1" | "taskColor2" |"taskColor3" |"taskColor4" |"taskColor5" |"taskColor6" |"taskColor7" |"taskColor8" |"taskColor9" |"taskColor10" | "taskColor11",
}

export const TaskList = (task: TaskItemProps) => {
    const taskColorClass = task.taskColor ? taskListStyle[task.taskColor] : '';

    return(
        <div className={`${taskListStyle.taskLitContainer} ${taskColorClass}`}>
            <div className={taskListStyle.imgContainer}>
                <img src={photo} alt="photoPerfil" />
            </div>
            <div className={taskListStyle.titleContainer}>
                <div className={taskListStyle.taskDadosContainer}>
                    <h3>Nome do responsavel da tarefa</h3>
                    <h4>Título: {'da tarefa'}</h4>
                </div>
                <div className={taskListStyle.infoTaskContainer}>
                    <div>1</div>
                    <div>12</div>
                    <div>123</div>
                </div>
            </div>
            <div className={taskListStyle.taskBtContainer}>
                <div>1</div>
                <div>2</div>
            </div>
        </div>
    );
}