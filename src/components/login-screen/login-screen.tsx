import { FormEvent, useMemo, useState } from 'react';
import { BiLockAlt, BiLogInCircle, BiUser, BiUserPlus } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import {
  autenticarUsuario,
  limparSessaoAutenticada,
  registrarUsuario,
  salvarSessaoAutenticada,
} from '../../services/auth-service';
import loginStyle from './login-screen.module.css';

export const LoginScreen = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [modoCadastro, setModoCadastro] = useState<boolean>(false);
  const [mensagemErro, setMensagemErro] = useState<string>('');
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');

  const titulo = useMemo(() => (modoCadastro ? 'Criar conta' : 'Entrar'), [modoCadastro]);
  const textoBotao = useMemo(() => (modoCadastro ? 'Registrar' : 'Login'), [modoCadastro]);

  const validarFormulario = (): boolean => login.trim().length > 0 && senha.trim().length > 0;

  const exibirRecuperacaoSenha = (): void => {
    setMensagemErro('');
    setMensagemSucesso('Recuperação de senha ainda não implementada.');
  };

  const alternarModo = (): void => {
    setModoCadastro((modoAtual) => !modoAtual);
    setMensagemErro('');
    setMensagemSucesso('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setMensagemErro('');
    setMensagemSucesso('');

    if (!validarFormulario()) {
      setMensagemErro('Preencha login e senha.');
      return;
    }

    if (modoCadastro) {
      try {
        await registrarUsuario({ login, senha });
        setModoCadastro(false);
        setMensagemSucesso('Cadastro realizado com sucesso. Faça seu login.');
        return;
      } catch (error) {
        const mensagem = error instanceof Error ? error.message : 'Erro ao registrar usuário';
        setMensagemErro(mensagem);
        return;
      }
    }

    const autenticado = await autenticarUsuario({ login, senha });
    if (!autenticado) {
      setMensagemErro('Login ou senha inválidos.');
      return;
    }

    salvarSessaoAutenticada({ login });
    navigate('/home');
  };

  const sairSessaoAnterior = (): void => {
    limparSessaoAutenticada();
    setMensagemErro('');
    setMensagemSucesso('Sessão anterior encerrada.');
  };

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
          {modoCadastro ? <BiUserPlus /> : <BiLogInCircle />}
          <span>{textoBotao}</span>
        </button>

        <div className={loginStyle.linkGroup}>
          <button className={loginStyle.inlineLink} type="button" onClick={alternarModo}>
            {modoCadastro ? 'Já tenho conta' : 'Registrar-se'}
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
