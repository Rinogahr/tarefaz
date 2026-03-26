import { Button, TextField } from '@mui/material';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { registrarUsuario } from '../../services/auth-service';
import { LoadingComponent } from '../loading-component/loading-component';
import { buscarPerfilPorLogin, criarPerfilUsuario, gerarProximoIdUsuario } from '../../services/usuario-service';
import createUserStyle from './create-user-component.module.css';

interface CreateUserFormState {
  nome: string;
  sobrenome: string;
  dataNascimento: string;
  telefone: string;
  email: string;
  login: string;
  senha: string;
  confirmarSenha: string;
}

const formSchema = z
  .object({
    nome: z.string().min(2, 'Informe o nome'),
    sobrenome: z.string().min(2, 'Informe o sobrenome'),
    dataNascimento: z.iso.date('Data de nascimento inválida'),
    telefone: z.string().min(8, 'Informe um telefone válido'),
    email: z.email('Email inválido'),
    login: z.string().min(3, 'Informe um login com ao menos 3 caracteres'),
    senha: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
    confirmarSenha: z.string().min(6, 'A confirmação deve ter ao menos 6 caracteres'),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    error: 'Senha e confirmação precisam ser iguais',
    path: ['confirmarSenha'],
  });

const aguardarCincoSegundos = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 5000);
  });

const obterRotaRetorno = ({ origem }: { origem: string | null }): string =>
  origem === 'login' ? '/login' : origem === 'users' ? '/home/users' : '/home';

const montarDadosPerfil = ({
  id,
  dadosForm,
}: {
  id: number;
  dadosForm: CreateUserFormState;
}) => ({
  id,
  login: dadosForm.login.trim(),
  nome: dadosForm.nome.trim(),
  sobrenome: dadosForm.sobrenome.trim(),
  dataNascimento: dadosForm.dataNascimento,
  telefone: dadosForm.telefone.trim(),
  email: dadosForm.email.trim().toLowerCase(),
  tipoUsuario: 'regular' as const,
  imgPerfil: 'src/assets/noPhoto.jpg',
});

export const CreateUserComponent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const origem = searchParams.get('from');
  const [formState, setFormState] = useState<CreateUserFormState>({
    nome: '',
    sobrenome: '',
    dataNascimento: '',
    telefone: '',
    email: '',
    login: '',
    senha: '',
    confirmarSenha: '',
  });
  const [mensagemErro, setMensagemErro] = useState<string>('');
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');
  const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);
  const [isAdministrador, setIsAdministrador] = useState<boolean>(false);

  const origemLogin = useMemo<boolean>(() => origem === 'login', [origem]);

  useEffect(() => {
    const carregarPermissao = async (): Promise<void> => {
      try {
        const loginSessao = localStorage.getItem('auth-user');
        if (!loginSessao) {
          setIsAdministrador(false);
          return;
        }

        const perfilSessao = await buscarPerfilPorLogin({ login: loginSessao });
        setIsAdministrador(perfilSessao?.tipoUsuario === 'admin');
      } catch {
        setIsAdministrador(false);
      }
    };

    void carregarPermissao();
  }, []);

  const handleChangeCampo = ({
    event,
    campo,
  }: {
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
    campo: keyof CreateUserFormState;
  }): void => {
    setFormState((estadoAtual) => ({
      ...estadoAtual,
      [campo]: event.target.value,
    }));
  };

  const cancelarCadastro = (): void => {
    navigate(obterRotaRetorno({ origem }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setMensagemErro('');
    setMensagemSucesso('');

    if (!origemLogin && !isAdministrador) {
      setMensagemErro('Somente administradores podem criar usuários por esta rota.');
      return;
    }

    const validacao = formSchema.safeParse(formState);
    if (!validacao.success) {
      setMensagemErro(validacao.error.issues[0]?.message ?? 'Dados inválidos');
      return;
    }

    try {
      setIsLoadingSubmit(true);
      await aguardarCincoSegundos();
      const proximoId = await gerarProximoIdUsuario();

      await registrarUsuario({
        id: proximoId,
        login: formState.login.trim(),
        senha: formState.senha,
      });

      await criarPerfilUsuario({
        payload: montarDadosPerfil({
          id: proximoId,
          dadosForm: formState,
        }),
      });

      setMensagemSucesso('Usuário cadastrado com sucesso.');
      navigate(obterRotaRetorno({ origem }));
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Não foi possível cadastrar usuário';
      setMensagemErro(mensagem);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  if (isLoadingSubmit) {
    return <LoadingComponent texto="Salvando usuário e validando informações..." />;
  }

  return (
    <div className={createUserStyle.screenContainer}>
      <div className={createUserStyle.card}>
        <h1 className={createUserStyle.title}>Crie seu usuário</h1>
        <p className={createUserStyle.subtitle}>Preencha os dados para criar sua conta.</p>
        <form className={createUserStyle.form} onSubmit={handleSubmit}>
          <TextField
            label="Nome"
            value={formState.nome}
            onChange={(event) => handleChangeCampo({ event, campo: 'nome' })}
            required
          />
          <TextField
            label="Sobrenome"
            value={formState.sobrenome}
            onChange={(event) => handleChangeCampo({ event, campo: 'sobrenome' })}
            required
          />
          <TextField
            label="Data de Nascimento"
            type="date"
            value={formState.dataNascimento}
            onChange={(event) => handleChangeCampo({ event, campo: 'dataNascimento' })}
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Telefone"
            value={formState.telefone}
            onChange={(event) => handleChangeCampo({ event, campo: 'telefone' })}
            required
          />
          <TextField
            label="Email"
            type="email"
            value={formState.email}
            onChange={(event) => handleChangeCampo({ event, campo: 'email' })}
            required
          />
          <TextField
            label="Login"
            value={formState.login}
            onChange={(event) => handleChangeCampo({ event, campo: 'login' })}
            required
          />
          <TextField
            label="Senha"
            type="password"
            value={formState.senha}
            onChange={(event) => handleChangeCampo({ event, campo: 'senha' })}
            required
          />
          <TextField
            label="Confirmação de Senha"
            type="password"
            value={formState.confirmarSenha}
            onChange={(event) => handleChangeCampo({ event, campo: 'confirmarSenha' })}
            required
          />
          {mensagemErro && <p className={createUserStyle.messageError}>{mensagemErro}</p>}
          {mensagemSucesso && <p className={createUserStyle.messageSuccess}>{mensagemSucesso}</p>}

          <div className={createUserStyle.actions}>
            <Button
              className={createUserStyle.actionButton}
              color="inherit"
              variant="outlined"
              onClick={cancelarCadastro}
              sx={{ textTransform: 'none' }}
            >
              Cancelar
            </Button>
            <Button
              className={createUserStyle.actionButton}
              type="submit"
              variant="contained"
              sx={{ textTransform: 'none' }}
            >
              Cadastrar usuário
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
