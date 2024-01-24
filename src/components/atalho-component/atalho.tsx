import atalhoStyle from './atalho.module.css';

type atalhoProps = {
    titulo: string,
    onClick?: () => void,
    bgColor?: "greencolor" | "bluecolor" | "oragecolor" | "redcolor" | "purplecolor",
    bgTxtColor?: "textColorDark" | "textColorWhite"
}

export const Atalho = (atalho: atalhoProps) => {
    const bgColorClass = atalho.bgColor ? atalhoStyle[atalho.bgColor] : '';
    const txtColorClas = atalho.bgTxtColor ? atalhoStyle[atalho.bgTxtColor] : '';
    return(
        <div className={`${atalhoStyle.atalhoContainer} ${bgColorClass} ${txtColorClas}`} onClick={atalho.onClick}>
            <h3>{atalho.titulo}</h3>
        </div>
    );
}