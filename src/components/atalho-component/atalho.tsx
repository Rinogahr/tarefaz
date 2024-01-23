import atalhoStyle from './atalho.module.css';

type atalhoProps = {
    titulo: string,
    onClick?: () => void,
    bgColor?: {
        greencolor: string,
        bluecolor: string,
        oragecolor: string,
        redcolor: string,
        purplecolor: string,
    }
}

export const Atalho = (atalho: atalhoProps) => {
    return(
        <div className={`${atalhoStyle.atalhoContainer} ${atalho.bgColor}`} onClick={atalho.onClick}>
            <h3>{atalho.titulo}</h3>
        </div>
    );
}