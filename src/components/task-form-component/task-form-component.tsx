import { FormEvent, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { CriarTarefaInput, TarefaModel, UsuarioModel } from '../../models/tarefa-model';
import { atualizarTarefa, criarTarefa } from '../../services/tarefas-service';
import { LoadingComponent } from '../loading-component/loading-component';
import taskFormStyle from './task-form-component.module.css';

interface TaskFormComponentProps {
  modo: 'criar' | 'editar';
  tarefa?: TarefaModel;
  usuarioLogado: UsuarioModel;
  usuariosRegistrados: UsuarioModel[];
  isAdministrador: boolean;
  onCancel: () => void;
  onSuccess: () => Promise<void> | void;
}

const formatarDataLocalInput = ({ dataIso }: { dataIso: string }): string => dayjs(dataIso).format('YYYY-MM-DDTHH:mm');

const aguardarTresSegundos = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });

const formatarDataPersistencia = ({ data }: { data: string }): string => dayjs(data).format('YYYY-MM-DDTHH:mm:ss');

export const TaskFormComponent = ({
  modo,
  tarefa,
  usuarioLogado,
  usuariosRegistrados,
  isAdministrador,
  onCancel,
  onSuccess,
}: TaskFormComponentProps) => {
  const [titulo, setTitulo] = useState<string>(tarefa?.titulo ?? '');
  const [descricao, setDescricao] = useState<string>(tarefa?.descricao ?? '');
  const [dataInicio, setDataInicio] = useState<string>(
    tarefa ? formatarDataLocalInput({ dataIso: tarefa.dataInicio }) : dayjs().format('YYYY-MM-DDTHH:mm'),
  );
  const [dataFim, setDataFim] = useState<string>(
    tarefa ? formatarDataLocalInput({ dataIso: tarefa.dataFim }) : dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'),
  );
  const [usuarioSelecionadoId, setUsuarioSelecionadoId] = useState<number>(tarefa?.usuario[0]?.id ?? usuarioLogado.id);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mensagemErro, setMensagemErro] = useState<string>('');

  const usuariosSelect = useMemo<UsuarioModel[]>(
    () =>
      usuariosRegistrados.length > 0
        ? usuariosRegistrados
        : [
            {
              id: usuarioLogado.id,
              name: usuarioLogado.name,
              dados: usuarioLogado.dados,
              photpth: usuarioLogado.photpth,
            },
          ],
    [usuarioLogado.dados, usuarioLogado.id, usuarioLogado.name, usuarioLogado.photpth, usuariosRegistrados],
  );

  const tituloFormulario = useMemo<string>(() => (modo === 'criar' ? 'Criar Tarefa' : 'Editar Tarefa'), [modo]);
  const textoSalvar = useMemo<string>(() => (modo === 'criar' ? 'Salvar tarefa' : 'Salvar edição'), [modo]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setMensagemErro('');

    if (modo === 'editar' && tarefa?.feito) {
      setMensagemErro('Não é possível editar uma tarefa concluída.');
      return;
    }

    if (titulo.trim().length === 0 || descricao.trim().length === 0) {
      setMensagemErro('Preencha título e descrição.');
      return;
    }

    const dataInicioValida = dayjs(dataInicio).isValid();
    const dataFimValida = dayjs(dataFim).isValid();
    if (!dataInicioValida || (isAdministrador && !dataFimValida)) {
      setMensagemErro('Preencha datas válidas para salvar a tarefa.');
      return;
    }

    if (isAdministrador && dayjs(dataFim).isBefore(dayjs(dataInicio))) {
      setMensagemErro('A data de vencimento não pode ser anterior à data de criação.');
      return;
    }

    if (isAdministrador && dayjs(dataFim).isBefore(dayjs())) {
      setMensagemErro('A data de vencimento não pode ser anterior à data atual.');
      return;
    }

    const usuarioSelecionado = usuariosSelect.find((usuario) => usuario.id === usuarioSelecionadoId) ?? usuarioLogado;
    const dataFimTarefa = isAdministrador
      ? formatarDataPersistencia({ data: dataFim })
      : tarefa?.dataFim ?? formatarDataPersistencia({ data: dayjs(dataInicio).add(1, 'day').format('YYYY-MM-DDTHH:mm') });

    const payloadBase: CriarTarefaInput = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      dataInicio: formatarDataPersistencia({ data: dataInicio }),
      dataFim: dataFimTarefa,
      feito: tarefa?.feito ?? false,
      usuario: [isAdministrador ? usuarioSelecionado : usuarioLogado],
    };

    setIsLoading(true);
    try {
      const operacao =
        modo === 'criar'
          ? criarTarefa({ payload: payloadBase })
          : atualizarTarefa({
              tarefaId: tarefa?.id ?? 0,
              payload: payloadBase,
            });

      await Promise.all([operacao, aguardarTresSegundos()]);
      await onSuccess();
      alert('Tarefa salva com sucesso.');
      onCancel();
    } catch {
      setMensagemErro('Não foi possível salvar a tarefa. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingComponent texto="Processando solicitação da tarefa..." />;
  }

  return (
    <div className={taskFormStyle.overlay}>
      <div className={taskFormStyle.card}>
        <h2>{tituloFormulario}</h2>
        <form className={taskFormStyle.form} onSubmit={handleSubmit}>
          <label htmlFor="titulo">Nome da tarefa</label>
          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            required
          />

          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            required
          />

          <label htmlFor="dataInicio">Data de criação</label>
          <input
            id="dataInicio"
            type="datetime-local"
            value={dataInicio}
            onChange={(event) => setDataInicio(event.target.value)}
            readOnly
          />

          {isAdministrador && (
            <>
              <label htmlFor="dataFim">Data de vencimento</label>
              <input
                id="dataFim"
                type="datetime-local"
                value={dataFim}
                onChange={(event) => setDataFim(event.target.value)}
                required
              />

              <label htmlFor="usuario">Atribuir para usuário</label>
              <select
                id="usuario"
                value={usuarioSelecionadoId}
                onChange={(event) => setUsuarioSelecionadoId(Number(event.target.value))}
              >
                {usuariosSelect.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.id} - {usuario.name}
                  </option>
                ))}
              </select>
            </>
          )}

          {mensagemErro && <p className={taskFormStyle.errorText}>{mensagemErro}</p>}

          <div className={taskFormStyle.actions}>
            <button className={taskFormStyle.cancelButton} type="button" onClick={onCancel}>
              Cancelar
            </button>
            <button className={taskFormStyle.saveButton} type="submit">
              {textoSalvar}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
