import botaoStyle from './botao.module.css';

interface BotaoProps {
  valor: string | number;
  titulo: string;
  onClick?: () => void;
}

export const Botao = (bt: BotaoProps) => (
  <div className={botaoStyle.btContainer} onClick={bt.onClick}>
    <h4>{bt.valor}</h4>
    <h6>{bt.titulo}</h6>
  </div>
);
