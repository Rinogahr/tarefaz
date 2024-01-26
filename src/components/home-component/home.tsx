import { UserDados } from "../user-dados-component/user-dados";
import homeStyle from "./home.module.css";

import { Atalho } from "../atalho-component/atalho";
import { Outlet } from "react-router-dom";
import task from '../../../data/tarefasDiarias.json';

export const Home = () =>{
    const dados = task.tarefasDiarias[0].usuario;

    function handleEditPerfil(){
        alert("editando o perfil")
    }

   async function renderUsuarioLogado(params){
        console.log(params);
        const usuario = params.map((u) => {
            return{
                usuario : u.usuario,
                tarefas : u.filter( ( t ) => t.usuario.id === u.usuario.id) 
            }
        })

        console.log("usuario => ", usuario);
    }
    
    renderUsuarioLogado(task.tarefasDiarias);

    return(
        <div className={homeStyle.homeContainer}>
            <div className={homeStyle.homeChildren}>
                <div className={homeStyle.dadosPerfil}>
                    <UserDados
                        userImg={`${dados[0].photpth}`}
                        name={`${dados[0].id} - ${dados[0].name}`}
                        info="27 Ano - Brasília"
                        btEdite={ ()=> handleEditPerfil()}
                    />
                </div>
                <div className={homeStyle.btAtalhos}>
                    <Atalho model="modeloUm" titulo="Nova tarefa" bgColor="lightSalmon" bgTxtColor="textColorDark"/>
                    <Atalho model="modeloUm" titulo="Concluidas" bgColor="mediumPurple" bgTxtColor="textColorDark"/>
                    <Atalho model="modeloUm" titulo="Em andamento" bgColor="paleVioletRed" bgTxtColor="textColorDark"/>
                    <Atalho model="modeloUm" titulo="Atrasadas" bgColor="cornflowerBlue" bgTxtColor="textColorDark"/>
                </div>
                <Outlet/>
            </div>
        </div>        
    );
}