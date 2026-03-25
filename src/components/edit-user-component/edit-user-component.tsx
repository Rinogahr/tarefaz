import { Button, MenuItem, TextField } from '@mui/material';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { atualizarSenhaUsuario, buscarUsuarioPorLogin } from '../../services/auth-service';
import { salvarAvatar } from '../../services/avatar-service';
import { LoadingComponent } from '../loading-component/loading-component';
import { atualizarPerfilUsuario, buscarPerfilPorId, buscarPerfilPorLogin } from '../../services/usuario-service';
import editUserStyle from './edit-user-component.module.css';

interface EditUserFormState {
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
  const usuarioId = Number(params.id ?? 0);
  const [formState, setFormState] = useState<EditUserFormState>({
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
  const [usuarioEditadoEhAdmin, setUsuarioEditadoEhAdmin] = useState<boolean>(false);

  const isAdministrador = useMemo<boolean>(() => localStorage.getItem('auth-user') === 'admin', []);
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
        if (!isAdministrador || perfilSessao?.tipoUsuario !== 'admin') {
          throw new Error('Apenas administradores podem editar usuários.');
        }

        const perfil = await buscarPerfilPorId({ usuarioId });
        if (!perfil) {
          throw new Error('Usuário não encontrado.');
        }
        setUsuarioEditadoEhAdmin(perfil.tipoUsuario === 'admin');

        setFormState({
          nome: perfil.nome,
          sobrenome: perfil.sobrenome,
          dataNascimento: perfil.dataNascimento,
          telefone: perfil.telefone,
          email: perfil.email,
          tipoUsuario: perfil.tipoUsuario,
          senha: '',
          confirmarSenha: '',
          imgPerfil: perfil.imgPerfil,
          imgPerfilPath: `src/assets/avatar/${montarSlugPrimeiroNome({ nome: perfil.nome })}_${perfil.id}.png`,
        });
      } catch (error) {
        const mensagem = error instanceof Error ? error.message : 'Falha ao carregar usuário.';
        setMensagemErro(mensagem);
      } finally {
        setIsLoadingTela(false);
      }
    };

    void carregarUsuario();
  }, [isAdministrador, loginSessao, usuarioId]);

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

      if (formState.senha.trim().length > 0) {
        const usuarioAuth = await buscarUsuarioPorLogin({ login: loginSessao });
        if (!usuarioAuth || usuarioAuth.id <= 0) {
          throw new Error('Sessão inválida para atualizar senha.');
        }
        await atualizarSenhaUsuario({
          usuarioId,
          senha: formState.senha.trim(),
        });
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
          {isAdministrador && usuarioEditadoEhAdmin && (
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
