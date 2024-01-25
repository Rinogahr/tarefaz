import { Link, useParams } from "react-router-dom";
import {TaskList} from './task-list-component/task-list';
import tarefasDiarias from '../../../data/tarefasDiarias.json';

export const Tarefa = () =>{

    const params = useParams();

    const taskList = tarefasDiarias.tarefasDiarias;

    console.log(taskList);

    return(
        <>
            <Link to={"/"}>Tela de Home</Link>
            <h1>Telas de Tarefas usuario de código {params.id}</h1>
            <TaskList></TaskList>
        </>
    )
}