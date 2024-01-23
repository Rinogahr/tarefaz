import botaoStyle from './botao.module.css';

type botaoProps = {
    valor: string | number,
    titulo: string,
    onClick?: () => void
}


export const Botao = (bt: botaoProps) => {
    return(
        <div className={botaoStyle.btContainer} onClick={bt.onClick}>
            <h3>{bt.valor}</h3>
            <h4>{bt.titulo}</h4>
        </div>
    )
}