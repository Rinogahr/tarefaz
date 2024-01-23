import { IconButton } from '@mui/material';
import userDadosStyle from './user-dados.module.css';
import { BiEdit } from 'react-icons/bi';
import { Botao } from '../bt-component/botao';
import { useNavigate } from 'react-router-dom';

type  userProps = {
        userImg: any,
        name: string,
        info: string,
        btEdite: any
    };

export const UserDados = (props : userProps) => {

    const history = useNavigate();

    function verMinhasTarefas(params) {

        history(`/task/${params}`);
    }

    function verMinhasTarefasConcluidas() {
        alert('indo pra tela de minha tarefa concluidas')
    }

    function verTodasTarefas() {
        alert('indo pra tela de todas tarefa')
    }

    return(
        <div className={userDadosStyle.container}>
            <div>
                <div>
                    <img alt='perfilImg' src={props.userImg}/>
                </div>
                <div>
                    <h1>{props.name}</h1>
                    <b>{props.info}</b>
                </div>
                <div>
                    <IconButton aria-label='Perfil' onClick={props.btEdite}>
                        <BiEdit color='#fafafa'/>
                    </IconButton>
                </div>
            </div>
            <div className={userDadosStyle.btContainer}>
                <Botao titulo='Minhas tarefas' valor={648} onClick={ () => verMinhasTarefas(this)}/>
                <Botao titulo='Tarefas concluidas' valor={100} onClick={ () => verMinhasTarefasConcluidas()}/>
                <Botao titulo='Todas as tarefas' valor={648} onClick={ () => verTodasTarefas()}/>
            </div>
        </div>
    );
}