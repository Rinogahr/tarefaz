import { Link, useParams} from "react-router-dom";
import { useEffect, useState } from "react";
import {TaskList} from './task-list-component/task-list';
import tarefasDiarias from '../../../data/tarefasDiarias.json';



export const Tarefa = () =>{
    const params = useParams();
    let color = "taskColor5";
    const taskList = tarefasDiarias.tarefasDiarias;
    const [tarefaFiltrada, setTarefaFiltrada] = useState<{ 
        usuario: { id: number; name: string; dados: string; photopth: string; }[];
        titulo: string;
        descricao: string;
        dataInicio: string;
        dataFim: string;
        feito: boolean; 
    }[]>([]);

    useEffect( () => {
        if( params.id === "all"){
            setTarefaFiltrada(taskList as any);
            console.log(taskList)
        }else{
            const fillTask = taskList.filter( (i) => i.usuario[0].id == Number(params.id));
            setTarefaFiltrada(fillTask as any);
        }
    }, [params.id, taskList]);

    return(
    <>
        {
         tarefaFiltrada.length === 0 ? 
         "Tarefa não encontrada" :  
         tarefaFiltrada.map( (task) => {
            return <TaskList key={task.titulo}
            taskColor={color}
            taskTitle={task.titulo}
            taskSubTitle={task.descricao}
            taskUsuName={task.usuario[0].name}
            taskImg={task.usuario[0].photopth}/>
         })
        }
    </>
);
    

}