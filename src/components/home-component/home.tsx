import { UserDados } from "../user-dados-component/user-dados";
import homeStyle from "./home.module.css";

import { Atalho } from "../atalho-component/atalho";
import { Outlet } from "react-router-dom";
import task from '../../../data/tarefasDiarias.json';

export const Home = () =>{
    let dado: any = [];
    let totalMinhasTarefas: number = 0;
    let usuarioLogado: any = {};

    function handleEditPerfil(){
        alert("editando o perfil")
    }

    interface UsuarioComTarefas {
        id: number;
        name: string;
        dados: string;
        photpth: string;
        tarefas: {
          titulo: string;
          descricao: string;
          dataInicio: string;
          dataFim: string;
          feito: boolean;
        }[];
      }
      
      async function renderUsuarioLogado(params: any[]): Promise<UsuarioComTarefas[]> {
        // Criar um mapa para armazenar usuários únicos
        const usuariosUnicos = new Map<number, UsuarioComTarefas>();
      
        // Iterar sobre as tarefas para organizar por usuário
        params.forEach((tarefa) => {
          const usuarioId = tarefa.usuario[0].id;
      
          // Verificar se o usuário já está no mapa
          if (!usuariosUnicos.has(usuarioId)) {
            // Se não estiver, adicionar o usuário ao mapa
            usuariosUnicos.set(usuarioId, {
              id: tarefa.usuario[0].id,
              name: tarefa.usuario[0].name,
              dados: tarefa.usuario[0].dados,
              photpth: tarefa.usuario[0].photpth,
              tarefas: [],
            });
          }
      
          // Adicionar a tarefa ao usuário correspondente no mapa
         usuariosUnicos.get(usuarioId).tarefas.push({
            titulo: tarefa.titulo,
            descricao: tarefa.descricao,
            dataInicio: tarefa.dataInicio,
            dataFim: tarefa.dataFim,
            feito: tarefa.feito,
          });
        });
      
        // Converter o mapa de volta para um array
        const usuariosUnicosArray = Array.from(usuariosUnicos.values());

        dado = usuariosUnicosArray[0]
        totalMinhasTarefas = usuariosUnicosArray[0].tarefas.length
      
        const usuario: any = {
          "id": usuariosUnicosArray[0].id,
          "name": usuariosUnicosArray[0].name,
          "photpth": usuariosUnicosArray[0].photpth,
          "dados": usuariosUnicosArray[0].dados,
        }
        
        localStorage.setItem("usuario", JSON.stringify(usuario));
        usuarioLogado = localStorage.getItem("usuario");
        usuarioLogado = JSON.parse(usuarioLogado);

        console.table({
          "usuariosUnicosArray": usuariosUnicosArray,
          "dados": dado,
          "minhasTarefas": totalMinhasTarefas,
          "usuarioLogado": usuarioLogado
        });
      
        return usuariosUnicosArray;
      }
      
      
      renderUsuarioLogado(task.tarefasDiarias);
      

    return(
        <div className={homeStyle.homeContainer}>
            <div className={homeStyle.homeChildren}>
                <div className={homeStyle.dadosPerfil}>
                    <UserDados
                        userImg={`${usuarioLogado.photpth}`}
                        name={`${usuarioLogado.id} - ${usuarioLogado.name}`}
                        info={`${usuarioLogado.dados}`}
                        btEdite={ ()=> handleEditPerfil()}
                        vlChildren={totalMinhasTarefas}
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