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

    function verTarefasConcluidas(params) {
        history(`/task/${params}`);
    }

    function verTodasTarefas(params) {
        history(`/task/${params}`);
    }

    function clickPath() { history('/') }

    return(
        <div className={userDadosStyle.userDadoscontainer}>
            <div className={userDadosStyle.userDadoscontainerhildren}>
                <div className={userDadosStyle.profileEdit}>
                    <IconButton aria-label='Perfil' onClick={props.btEdite} >
                        <BiEdit color='#fafafa'/>
                    </IconButton>
                </div>
                <div className={userDadosStyle.userDadoscontainerImg}>
                    <img alt='perfilImg' src={props.userImg} onClick={() => {clickPath()}}/>
                </div>
                <div className={userDadosStyle.infoDados}>
                    <h1>{props.name}</h1>
                    <b>{props.info}</b>
                </div>
            </div>
            <div className={userDadosStyle.btContainer}>
                <Botao titulo='Minhas tarefas' valor={648} onClick={ () => verMinhasTarefas(1)}/>
                <Botao titulo='Tarefas concluidas' valor={100} onClick={ () => verTarefasConcluidas(1)}/>
                <Botao titulo='Todas as tarefas' valor={648} onClick={ () => verTodasTarefas('all')}/>
            </div>
        </div>
    );
}