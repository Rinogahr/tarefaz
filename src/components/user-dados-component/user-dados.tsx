import { IconButton } from '@mui/material';
import userDadosStyle from './user-dados.module.css';
import { BiEdit } from 'react-icons/bi';
import { Botao } from '../bt-component/botao';
import { useNavigate } from 'react-router-dom';

interface UserProps {
  userId?: number;
  userImg: string;
  name: string;
  info: string;
  btEdite: () => void;
  vlPendentes: number;
  vlConcluidas: number;
  vlTotal: number;
}

export const UserDados = (props: UserProps) => {
  const history = useNavigate();

  const verMinhasTarefas = ({ userId }: { userId?: number }): void => {
    if (!userId) {
      return;
    }

    history(`/home/task/${userId}/pendentes`);
  };

  const verTarefasConcluidas = ({ userId }: { userId?: number }): void => {
    if (!userId) {
      return;
    }

    history(`/home/task/${userId}/concluidas`);
  };

  const verTodasTarefas = (): void => {
    history('/home/task/all');
  };

  const clickPath = (): void => {
    history('/home');
  };

  const imageSrc = props.userImg?.startsWith('http') || props.userImg?.startsWith('/') ? props.userImg : `/${props.userImg}`;

  return (
    <div className={userDadosStyle.userDadoscontainer}>
      <div className={userDadosStyle.userDadoscontainerhildren}>
        <div className={userDadosStyle.profileEdit}>
          <IconButton aria-label="Perfil" onClick={props.btEdite}>
            <BiEdit color="#fafafa" />
          </IconButton>
        </div>
        <div className={userDadosStyle.userDadoscontainerImg}>
          <img alt="perfilImg" src={imageSrc} onClick={clickPath} />
        </div>
        <div className={userDadosStyle.infoDados}>
          <h1>{props.name}</h1>
          <b>{props.info}</b>
        </div>
      </div>
      <div className={userDadosStyle.btContainer}>
        <Botao
          titulo="Minhas tarefas"
          valor={props.vlPendentes}
          onClick={() => verMinhasTarefas({ userId: props.userId })}
        />
        <Botao
          titulo="Tarefas concluidas"
          valor={props.vlConcluidas}
          onClick={() => verTarefasConcluidas({ userId: props.userId })}
        />
        <Botao titulo="Todas as tarefas" valor={props.vlTotal} onClick={verTodasTarefas} />
      </div>
    </div>
  );
};
