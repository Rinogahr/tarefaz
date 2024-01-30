import taskListStyle from './task-list.module.css';


type  TaskItemProps = {
    taskImg?:  string | null,
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
            <div className={taskListStyle.childrenContainerUm}>1</div>
            <div className={taskListStyle.childrenContainerDois}>2</div>
        </div>
    );
}