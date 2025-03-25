import taskListStyle from './task-list.module.css';

import more from '../../../assets/more.png';


type  TaskItemProps = {
    taskImg:  any,
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

export const TaskList = (props: TaskItemProps) => {
    const taskColorClass = props.taskColor ? taskListStyle[props.taskColor] : '';

    return(
        <div className={`${taskListStyle.taskLitContainer} ${taskColorClass}`}>
            <div className={taskListStyle.imgContainer}>
                <img src={props.taskImg} alt="photoPerfil" />
            </div>
            <div className={taskListStyle.titleContainer}>
                <div className={taskListStyle.taskDadosContainer}>
                    <h3>Nome: {props.taskUsuName}</h3>
                    <h4>Título: {props.taskTitle}</h4>
                    <h5>SubTítulo: {props.taskSubTitle}</h5>
                </div>
                <div className={taskListStyle.infoTaskContainer}>
                    <div>{props.taskTime}</div>
                    <div>{props.taskDateCriacao instanceof Date ? props.taskDateCriacao.toLocaleDateString() : props.taskDateCriacao}</div>
                    <div>{props.tskDateCoclusao instanceof Date ? props.tskDateCoclusao.toLocaleDateString() : props.tskDateCoclusao}</div>
                </div>
            </div>
            <div className={taskListStyle.taskBtContainer}>
                <div>
                    <img src={more} alt='moreIcon'/>
                </div>
                <div>{props.taskChildren}</div>
            </div>
        </div>
    );
}