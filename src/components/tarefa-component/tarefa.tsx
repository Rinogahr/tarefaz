import { Link, useParams } from "react-router-dom"


export const Tarefa = () =>{

    const params = useParams();

    return(
        <>
            <Link to={"/"}>Tela de Home</Link>
            <h1>Telas de Tarefas usuario de código {params.id}</h1>
        </>
    )
}