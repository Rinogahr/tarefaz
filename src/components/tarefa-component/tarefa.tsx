import { Link, useParams} from "react-router-dom";
import { useEffect, useState } from "react";
import {TaskList} from './task-list-component/task-list';
import tarefasDiarias from '../../../data/tarefasDiarias.json';



export const Tarefa = () =>{
    const params = useParams();
    const taskList = tarefasDiarias.tarefasDiarias;
    const [tarefaFiltrada, setTarefaFiltrada] = useState<{ usuario: { id: number; name: string; dados: string; photpth: string; }[]; titulo: string; descricao: string; dataInicio: string; dataFim: string; feito: boolean; }[]>([]);
    const [cont, setCont] = useState(0)
    // const [tarefaFiltrada, setTarefaFiltrada] = useState<{ usuario: any}[]>([]);

    // Filtrar as tarefas e, em seguida, atualizar o estado
    useEffect(() => {
        const tarefasFiltradas = taskList.filter((item) => item.usuario[0].id == Number(params.id));
        setTarefaFiltrada(tarefasFiltradas);
        setCont(+1);
    }, [params.id, taskList]); // Dependências do useEffect

    // Use tarefaFiltrada conforme necessário em seu componente
    console.log("tarefaFiltrada -> ",tarefaFiltrada);

    return(
        <>
            {
             tarefaFiltrada.length == 0 ? 
             "Tarefa não encontrada" :  
             tarefaFiltrada.map( (task) => {
                return <TaskList key={task.titulo}
                taskColor="taskColor1"
                taskTitle={task.titulo}
                taskSubTitle={task.descricao}
                taskUsuName={task.usuario[0].name}
                taskImg={task.usuario[0].photpth}/>
             })
            }
        </>
    )
}