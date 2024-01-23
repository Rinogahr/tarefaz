import { UserDados } from "../user-dados-component/user-dados";
import homeStyle from "./home.module.css";

import fred from '../../assets/avatar/fred.jpg';
import { Atalho } from "../atalho-component/atalho";


export const Home = () =>{

    function handleEditPerfil(){
        alert("editando o perfil")
    }

    return(
        <div className={homeStyle.homeContainer}>
            <div className={homeStyle.homeChildren}>
                <UserDados
                    userImg={fred}
                    name="Pedro Algusto"
                    info="27 Ano - Brasília"
                    btEdite={ ()=> handleEditPerfil()}
                />
                <div className={homeStyle.atalhosConteiner}>
                    <Atalho titulo="Minhas tarefas" bgColor='redcolor'/>
                    <Atalho titulo="Nova tarefa"/>
                    <Atalho titulo="Concluidas"/>
                    <Atalho titulo="Andamento"/>
                    <Atalho titulo="Atrazadas"/>
                </div>
            </div>
        </div>        
    );
}