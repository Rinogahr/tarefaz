import botaoStyle from "./botao.module.css";

export function BotaoComponent({btFunction,dadosBd,titulo}) {
    return(
        <div className={botaoStyle.botaoContainer} onClick={btFunction}>
           <h3>{dadosBd}</h3>
           <p>{titulo}</p>     
        </div>
    );
}