import { Link, useParams } from "react-router-dom";
import {TaskList} from './task-list-component/task-list';
import tarefasDiarias from '../../../data/tarefasDiarias.json';


export const Tarefa = () =>{

    const params = useParams();

    const taskList = tarefasDiarias.tarefasDiarias;
    let  tasksFilter = [];
    console.log('tasksFilter',tasksFilter);
    function renderizarListaDeTarefas(params){        
        taskList.forEach( (item) => {
            if(item.usuario[0].id == params.id ){
                tasksFilter.push(item);
            }
        });
      
    }

    renderizarListaDeTarefas(params);

    return(
        <>
            {tasksFilter.length == 0 ? "<h2>Sem tarefas no momento</h2>" : tasksFilter.map( (item) => {
                <TaskList taskUsuName="tetse" taskTitle="Teste"/>
            })}
        </>
    )
}