import { Button, MenuItem, TextField } from '@mui/material';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { atualizarLoginUsuario, atualizarSenhaUsuario } from '../../services/auth-service';
import { salvarAvatar } from '../../services/avatar-service';
import { LoadingComponent } from '../loading-component/loading-component';
import { atualizarPerfilUsuario, buscarPerfilPorId, buscarPerfilPorLogin } from '../../services/usuario-service';
import editUserStyle from './edit-user-component.module.css';

interface EditUserFormState {
  login: string;
  nome: string;
  sobrenome: string;
  dataNascimento: string;
  telefone: string;
  email: string;
  tipoUsuario: 'admin' | 'regular';
  senha: string;
  confirmarSenha: string;
  imgPerfil: string;
  imgPerfilPath: string;
}

const formSchema = z
  .object({
    login: z.string().min(3, 'Informe um login com ao menos 3 caracteres'),
    nome: z.string().min(2, 'Informe o nome'),
    sobrenome: z.string().min(2, 'Informe o sobrenome'),
    dataNascimento: z.iso.date('Data de nascimento inválida'),
    telefone: z.string().min(8, 'Informe um telefone válido'),
    email: z.email('Email inválido'),
    tipoUsuario: z.enum(['admin', 'regular']),
    senha: z.string(),
    confirmarSenha: z.string(),
    imgPerfil: z.string().min(1, 'Imagem de perfil inválida'),
    imgPerfilPath: z.string(),
  })
  .refine((dados) => (dados.senha.length > 0 ? dados.senha.length >= 6 : true), {
    error: 'A nova senha deve ter ao menos 6 caracteres',
    path: ['senha'],
  })
  .refine((dados) => (dados.senha.length > 0 ? dados.senha === dados.confirmarSenha : true), {
    error: 'Senha e confirmação precisam ser iguais',
    path: ['confirmarSenha'],
  });

const aguardarCincoSegundos = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 5000);
  });

const extrairExtensaoArquivo = ({ nomeArquivo }: { nomeArquivo: string }): string => {
  const partesNome = nomeArquivo.split('.');
  if (partesNome.length < 2) {
    return 'png';
  }

  return partesNome[partesNome.length - 1].toLowerCase();
};

const montarSlugPrimeiroNome = ({ nome }: { nome: string }): string => {
  return nome
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
};

const lerArquivoComoDataUrl = ({ file }: { file: File }): Promise<string> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => resolve(String(fileReader.result ?? ''));
    fileReader.onerror = () => reject(new Error('Falha ao ler a imagem'));
    fileReader.readAsDataURL(file);
  });

export const EditUserComponent = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const origem = searchParams.get('from');
  const usuarioId = Number(params.id ?? 0);
  const [formState, setFormState] = useState<EditUserFormState>({
    login: '',
    nome: '',
    sobrenome: '',
    dataNascimento: '',
    telefone: '',
    email: '',
    tipoUsuario: 'regular',
    senha: '',
    confirmarSenha: '',
    imgPerfil: '',
    imgPerfilPath: '',
  });
  const [mensagemErro, setMensagemErro] = useState<string>('');
  const [isLoadingTela, setIsLoadingTela] = useState<boolean>(true);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);
  const [loginOriginalUsuario, setLoginOriginalUsuario] = useState<string>('');
  const [idUsuarioSessao, setIdUsuarioSessao] = useState<number | null>(null);
  const [isAdministrador, setIsAdministrador] = useState<boolean>(false);

  const loginSessao = useMemo<string>(() => localStorage.getItem('auth-user') ?? '', []);

  useEffect(() => {
    const carregarUsuario = async (): Promise<void> => {
      setIsLoadingTela(true);
      setMensagemErro('');
      try {
        if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
          throw new Error('Usuário inválido para edição.');
        }

        const perfilSessao = await buscarPerfilPorLogin({ login: loginSessao });
        if (!perfilSessao) {
          throw new Error('Sessão de usuário inválida.');
        }
        setIdUsuarioSessao(perfilSessao.id);
        setIsAdministrador(perfilSessao.tipoUsuario === 'admin');

        const podeEditar = perfilSessao.tipoUsuario === 'admin' || perfilSessao.id === usuarioId;
        if (!podeEditar) {
          throw new Error('Você não tem permissão para editar este usuário.');
        }

        const perfil = await buscarPerfilPorId({ usuarioId });
        if (!perfil) {
          throw new Error('Usuário não encontrado.');
        }
        setLoginOriginalUsuario(perfil.login);

        setFormState({
          login: perfil.login,
          nome: perfil.nome,
          sobrenome: perfil.sobrenome,
          dataNascimento: perfil.dataNascimento,
          telefone: perfil.telefone,
          email: perfil.email,
          tipoUsuario: perfil.tipoUsuario,
          senha: '',
          confirmarSenha: '',
          imgPerfil: perfil.imgPerfil,
          imgPerfilPath:
            perfil.imgPerfilPath ?? `src/assets/avatar/${montarSlugPrimeiroNome({ nome: perfil.nome })}_${perfil.id}.png`,
        });
      } catch (error) {
        const mensagem = error instanceof Error ? error.message : 'Falha ao carregar usuário.';
        setMensagemErro(mensagem);
      } finally {
        setIsLoadingTela(false);
      }
    };

    void carregarUsuario();
  }, [loginSessao, usuarioId]);

  const handleChangeCampo = ({
    event,
    campo,
  }: {
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
    campo: keyof EditUserFormState;
  }): void => {
    setFormState((estadoAtual) => ({
      ...estadoAtual,
      [campo]: event.target.value,
    }));
  };

  const handleChangeImagem = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const arquivoSelecionado = event.target.files?.[0];
    if (!arquivoSelecionado) {
      return;
    }

    try {
      const extensao = extrairExtensaoArquivo({ nomeArquivo: arquivoSelecionado.name });
      const primeiroNome = montarSlugPrimeiroNome({ nome: formState.nome });
      const nomePadrao = `${primeiroNome}_${usuarioId}.${extensao}`;
      const imagemBase64 = await lerArquivoComoDataUrl({ file: arquivoSelecionado });
      setFormState((estadoAtual) => ({
        ...estadoAtual,
        imgPerfil: imagemBase64,
        imgPerfilPath: `src/assets/avatar/${nomePadrao}`,
      }));
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Falha ao carregar imagem';
      setMensagemErro(mensagem);
    }
  };

  const cancelarEdicao = (): void => {
    if (origem === 'users') {
      navigate('/home/users');
      return;
    }

    navigate('/home');
  };

  const avatarPreviewSrc = useMemo<string>(() => {
    if (formState.imgPerfil.startsWith('data:image') || formState.imgPerfil.startsWith('http') || formState.imgPerfil.startsWith('/')) {
      return formState.imgPerfil;
    }

    return `/${formState.imgPerfil}`;
  }, [formState.imgPerfil]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setMensagemErro('');
    const validacao = formSchema.safeParse(formState);
    if (!validacao.success) {
      setMensagemErro(validacao.error.issues[0]?.message ?? 'Dados inválidos');
      return;
    }

    try {
      setIsLoadingSubmit(true);
      await aguardarCincoSegundos();
      const arquivoAvatar = formState.imgPerfilPath.split('/').pop() ?? `${usuarioId}.png`;
      const imgPerfilFinal = formState.imgPerfil.startsWith('data:image')
        ? await salvarAvatar({
            dataUrl: formState.imgPerfil,
            fileName: arquivoAvatar,
          })
        : formState.imgPerfil;
      await atualizarPerfilUsuario({
        usuarioId,
        payload: {
          login: formState.login.trim(),
          nome: formState.nome.trim(),
          sobrenome: formState.sobrenome.trim(),
          dataNascimento: formState.dataNascimento,
          telefone: formState.telefone.trim(),
          email: formState.email.trim().toLowerCase(),
          tipoUsuario: formState.tipoUsuario,
          imgPerfil: imgPerfilFinal,
          imgPerfilPath: imgPerfilFinal,
        },
      });

      if (formState.login.trim() !== loginOriginalUsuario) {
        await atualizarLoginUsuario({
          usuarioId,
          login: formState.login.trim(),
        });
      }

      if (formState.senha.trim().length > 0) {
        await atualizarSenhaUsuario({
          usuarioId,
          senha: formState.senha.trim(),
        });
      }

      if (idUsuarioSessao === usuarioId && formState.login.trim() !== loginSessao) {
        localStorage.setItem('auth-user', formState.login.trim());
      }

      navigate('/home');
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Não foi possível editar o usuário';
      setMensagemErro(mensagem);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  if (isLoadingTela || isLoadingSubmit) {
    return <LoadingComponent texto="Salvando alterações do usuário..." />;
  }

  return (
    <div className={editUserStyle.screenContainer}>
      <div className={editUserStyle.card}>
        <h1 className={editUserStyle.title}>Edite seu usuário</h1>
        <p className={editUserStyle.subtitle}>Atualize os dados de forma simples e segura.</p>
        <form className={editUserStyle.form} onSubmit={handleSubmit}>
          <div className={editUserStyle.avatarHeader}>
            <img alt="Avatar do usuário" className={editUserStyle.avatarPreview} src={avatarPreviewSrc} />
            <p className={editUserStyle.avatarName}>{formState.imgPerfilPath || 'Sem arquivo selecionado'}</p>
          </div>
          <TextField
            label="Login"
            value={formState.login}
            onChange={(event) => handleChangeCampo({ event, campo: 'login' })}
            required
          />
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
          {isAdministrador && (
            <TextField
              label="Tipo de Usuário"
              select
              value={formState.tipoUsuario}
              onChange={(event) => handleChangeCampo({ event, campo: 'tipoUsuario' })}
            >
              <MenuItem value="regular">Regular</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          )}
          <TextField
            label="Nova senha"
            type="password"
            value={formState.senha}
            onChange={(event) => handleChangeCampo({ event, campo: 'senha' })}
            helperText="Preencha somente se quiser alterar a senha."
          />
          <TextField
            label="Confirmação de Senha"
            type="password"
            value={formState.confirmarSenha}
            onChange={(event) => handleChangeCampo({ event, campo: 'confirmarSenha' })}
          />
          <Button className={editUserStyle.fullRow} component="label" variant="outlined">
            Alterar imagem de perfil
            <input accept="image/*" hidden type="file" onChange={(event) => void handleChangeImagem(event)} />
          </Button>
          {mensagemErro && <p className={editUserStyle.messageError}>{mensagemErro}</p>}
          <div className={editUserStyle.actions}>
            <Button
              className={editUserStyle.actionButton}
              color="inherit"
              variant="outlined"
              onClick={cancelarEdicao}
              sx={{ textTransform: 'none' }}
            >
              Cancelar
            </Button>
            <Button
              className={editUserStyle.actionButton}
              type="submit"
              variant="contained"
              sx={{ textTransform: 'none' }}
            >
              Atualizar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
