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
                    <Atalho model="modeloUm" titulo="Atrasadas" bgColor="paleGreen" bgTxtColor="textColorDark"/>
                    <Atalho model="modeloUm" titulo="Nova tarefa" bgColor="lightSalmon" bgTxtColor="textColorWhite"/>
                    <Atalho model="modeloUm" titulo="Concluidas" bgColor="mediumPurple" bgTxtColor="textColorWhite"/>
                    <Atalho model="modeloUm" titulo=" Em andamento" bgColor="paleVioletRed" bgTxtColor="textColorDark"/>
                    <Atalho model="modeloUm" titulo="Atrasadas" bgColor="cornflowerBlue" bgTxtColor="textColorDark"/>
                </div>
                <div className={homeStyle.dashboard}>
                    <div className={homeStyle.shotsContainer}>
                        <div>
                            <h1>Dashboard</h1>
                        </div>
                        <div>
                            <div>bt1</div>
                            <div>bt2</div>
                        </div>
                    </div>
                    <div className={homeStyle.atalho2Container}>
                        <Atalho model="modeloDois" titulo="botão atalho - 1" bgColor="aquamarine"/>
                        <Atalho model="modeloDois" titulo="botão atalho - 2" bgColor="cornflowerBlue"/>
                        <Atalho model="modeloDois" titulo="botão atalho - 3" bgColor="lightPink"/>
                        <Atalho model="modeloDois" titulo="botão atalho - 4" bgColor="lightSteelBlue"/>
                        <Atalho model="modeloDois" titulo="botão atalho - 5" bgColor="paleTurquoise"/>
                        <Atalho model="modeloDois" titulo="botão atalho - 6" bgColor="sandyBrown"/>
                    </div>
                </div>
            </div>
        </div>        
    );
}