import { useState } from 'react';
import { CriarTarefaInput, UsuarioModel } from '../../models/tarefa-model';
import { criarTarefa } from '../../services/tarefas-service';
import dayjs from 'dayjs';
import modalStyle from './task-modal.module.css';

interface TaskModalProps {
  onClose: () => void;
  onSuccess: () => void;
  usuarioLogado: UsuarioModel;
}

export const TaskModal = ({ onClose, onSuccess, usuarioLogado }: TaskModalProps) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState(dayjs().format('YYYY-MM-DDTHH:mm'));
  const [dataFim, setDataFim] = useState(dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm'));
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const formatarDataPersistencia = ({ data }: { data: string }): string => dayjs(data).format('YYYY-MM-DDTHH:mm:ss');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      const payload: CriarTarefaInput = {
        titulo,
        descricao,
        dataInicio: formatarDataPersistencia({ data: dataInicio }),
        dataFim: formatarDataPersistencia({ data: dataFim }),
        feito: false,
        usuario: [usuarioLogado],
      };

      await criarTarefa({ payload });
      onSuccess();
      onClose();
    } catch {
      setErro('Erro ao criar tarefa. Verifique os campos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={modalStyle.modalOverlay}>
      <div className={modalStyle.modalContent}>
        <h2>Nova Tarefa</h2>
        <form onSubmit={handleSubmit}>
          <div className={modalStyle.formGroup}>
            <label>Título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>
          <div className={modalStyle.formGroup}>
            <label>Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
          </div>
          <div className={modalStyle.formGroup}>
            <label>Data Início</label>
            <input
              type="datetime-local"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              required
            />
          </div>
          <div className={modalStyle.formGroup}>
            <label>Data Fim</label>
            <input
              type="datetime-local"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              required
            />
          </div>
          {erro && <p className={modalStyle.error}>{erro}</p>}
          <div className={modalStyle.actions}>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
