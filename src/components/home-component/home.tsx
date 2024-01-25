import { UserDados } from "../user-dados-component/user-dados";
import homeStyle from "./home.module.css";

import fred from '../../assets/avatar/fred.jpg';
import { Atalho } from "../atalho-component/atalho";
import { Outlet } from "react-router-dom";


export const Home = () =>{

    function handleEditPerfil(){
        alert("editando o perfil")
    }

    return(
        <div className={homeStyle.homeContainer}>
            <div className={homeStyle.homeChildren}>
                <div className={homeStyle.dadosPerfil}>
                    <UserDados
                        userImg={fred}
                        name="Pedro Algusto"
                        info="27 Ano - Brasília"
                        btEdite={ ()=> handleEditPerfil()}
                    />
                </div>
                <div className={homeStyle.btAtalhos}>
                    <Atalho model="modeloUm" titulo="Atrasadas" bgColor="paleGreen" bgTxtColor="textColorDark"/>
                    <Atalho model="modeloUm" titulo="Nova tarefa" bgColor="lightSalmon" bgTxtColor="textColorDark"/>
                    <Atalho model="modeloUm" titulo="Concluidas" bgColor="mediumPurple" bgTxtColor="textColorDark"/>
                    <Atalho model="modeloUm" titulo=" Em andamento" bgColor="paleVioletRed" bgTxtColor="textColorDark"/>
                    <Atalho model="modeloUm" titulo="Atrasadas" bgColor="cornflowerBlue" bgTxtColor="textColorDark"/>
                </div>
                <Outlet/>
            </div>
        </div>        
    );
}