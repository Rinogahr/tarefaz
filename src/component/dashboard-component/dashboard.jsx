import dashboardStyle from "./dashboard.module.css";
import {PerfilComponent} from "../perfil-component/perfil-component";
import {BotaoComponent} from "../botao-component/botao";
import avatar from "../../assets/perfil/fred.jpg";

function DashboardComponent() {

    function verMinhasTarefas(id) {
        alert(`totais de tarefas atribuidas a mim = ${id}`);
    }

    function minhasTarefasConcluidas(id) {
        alert(`totais de tarefas atribuidas a mim concluidas = ${id}`);
    }

    function todasTarefas() {
        alert(`Mostrar todas as tarefas`);
    }

    function editarPerfil(id) {
        alert(`Editar perfil de código ${id}`);
    }

    return(
        <div className={dashboardStyle.dashboardContainer}>
            <div className={dashboardStyle.dashboradTop}>
                <PerfilComponent 
                    image={avatar}
                    name={"Teste da Silva Sauro"}
                    infoTxt={"Belem do Para"}
                    btTxt={"Editar"}
                    perfilBtClick={()=> {editarPerfil(1)}}
                    />      
                <div className={dashboardStyle.dashboradTopInfo}>
                <BotaoComponent
                    dadosBd="5"
                    titulo="Minhas tarefas"
                    btFunction={() => {verMinhasTarefas(1)}}
                /> 
                <BotaoComponent
                    dadosBd="5"
                    titulo="Minhas tarefas concluidas"
                    btFunction={() => {minhasTarefasConcluidas(1)}}
                /> 
                <BotaoComponent
                    dadosBd="5"
                    titulo="Todas as tarefas"
                    btFunction={() => {todasTarefas()}}
                /> 

                </div>
            </div>
            <div className={dashboardStyle.dashboradfooter}>footer</div>
        </div>
    );
}


export {DashboardComponent};