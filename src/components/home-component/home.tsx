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
                <div className={homeStyle.dadosPerfil}>
                    <UserDados
                        userImg={fred}
                        name="Pedro Algusto"
                        info="27 Ano - Brasília"
                        btEdite={ ()=> handleEditPerfil()}
                    />
                </div>
                <div className={homeStyle.btAtalhos}>
                    <Atalho titulo="Nova tarefa" bgColor="bluecolor" bgTxtColor="textColorWhite"/>
                    <Atalho titulo="Concluidas" bgColor="greencolor" bgTxtColor="textColorWhite"/>
                    <Atalho titulo=" Em andamento" bgColor="oragecolor" bgTxtColor="textColorDark"/>
                    <Atalho titulo="Atrasadas" bgColor="purplecolor" bgTxtColor="textColorDark"/>
                </div>
                <div className={homeStyle.dashboard}>

                </div>
            </div>
        </div>        
    );
}