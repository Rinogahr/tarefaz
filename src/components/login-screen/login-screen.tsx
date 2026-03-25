import { FormEvent, useMemo, useState } from 'react';
import { BiLockAlt, BiLogInCircle, BiUser } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import {
  autenticarUsuario,
  limparSessaoAutenticada,
  salvarSessaoAutenticada,
} from '../../services/auth-service';
import { LoadingComponent } from '../loading-component/loading-component';
import loginStyle from './login-screen.module.css';

const aguardarTresSegundos = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });

export const LoginScreen = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [mensagemErro, setMensagemErro] = useState<string>('');
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');
  const [isLoadingLogin, setIsLoadingLogin] = useState<boolean>(false);

  const titulo = useMemo(() => 'Entrar', []);
  const textoBotao = useMemo(() => 'Login', []);

  const validarFormulario = (): boolean => login.trim().length > 0 && senha.trim().length > 0;

  const exibirRecuperacaoSenha = (): void => {
    setMensagemErro('');
    setMensagemSucesso('Recuperação de senha ainda não implementada.');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setMensagemErro('');
    setMensagemSucesso('');

    if (!validarFormulario()) {
      setMensagemErro('Preencha login e senha.');
      return;
    }

    try {
      const autenticado = await autenticarUsuario({ login, senha });
      if (!autenticado) {
        setMensagemErro('Login ou senha inválidos.');
        return;
      }

      setIsLoadingLogin(true);
      await aguardarTresSegundos();
      salvarSessaoAutenticada({ login });
      navigate('/home');
    } finally {
      setIsLoadingLogin(false);
    }
  };

  const sairSessaoAnterior = (): void => {
    limparSessaoAutenticada();
    setMensagemErro('');
    setMensagemSucesso('Sessão anterior encerrada.');
  };

  if (isLoadingLogin) {
    return <LoadingComponent texto="Validando credenciais e carregando ambiente..." />;
  }

  return (
    <div className={loginStyle.loginContainer}>
      <form className={loginStyle.loginCard} onSubmit={handleSubmit}>
        <h1>{titulo}</h1>
        <div className={loginStyle.inputGroup}>
          <BiUser />
          <input
            name="login"
            placeholder="Digite seu login"
            type="text"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
          />
        </div>
        <div className={loginStyle.inputGroup}>
          <BiLockAlt />
          <input
            name="senha"
            placeholder="Digite sua senha"
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
          />
        </div>
        {mensagemErro && <p className={loginStyle.errorText}>{mensagemErro}</p>}
        {mensagemSucesso && <p className={loginStyle.successText}>{mensagemSucesso}</p>}

        <button className={loginStyle.loginButton} type="submit">
          <BiLogInCircle />
          <span>{textoBotao}</span>
        </button>

        <div className={loginStyle.linkGroup}>
          <button className={loginStyle.inlineLink} type="button" onClick={() => navigate('/create-user?from=login')}>
            Registrar-se
          </button>
          <button className={loginStyle.inlineLink} type="button" onClick={exibirRecuperacaoSenha}>
            Recuperar senha
          </button>
        </div>
        <button className={loginStyle.logoutButton} type="button" onClick={sairSessaoAnterior}>
          Limpar sessão
        </button>
      </form>
    </div>
  );
};
