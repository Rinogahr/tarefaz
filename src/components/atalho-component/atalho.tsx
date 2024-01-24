import atalhoStyle from './atalho.module.css';

type atalhoProps = {
    titulo: string,
    onClick?: () => void,
    bgColor?: "paleGreen" |"cornflowerBlue" | "lightSalmon" | "paleVioletRed" | "mediumPurple",
    bgTxtColor?: "textColorDark" | "textColorWhite",
    model: "modeloUm" | "modeloDois",
}

type atalhoProps2 = {
    titulo: string,
    onClick?: () => void,
    bgColor?: "aquamarine" | "lightSteelBlue" | "sandyBrown" | "skyBlue" | "paleTurquoise" | "lightPink" ,
    bgTxtColor?: "textColorDark" | "textColorWhite",
    model: "modeloUm" | "modeloDois",
}

export function Atalho(atalho: atalhoProps | atalhoProps2) {

    if (atalho.model === "modeloUm") {
        const bgColorClass = atalho.bgColor ? atalhoStyle[atalho.bgColor] : '';
        const txtColorClass = atalho.bgTxtColor ? atalhoStyle[atalho.bgTxtColor] : '';

        return (
            <div className={`${atalhoStyle.atalhoContainer} ${bgColorClass} ${txtColorClass}`} onClick={atalho.onClick}>
                <h3>{atalho.titulo}</h3>
            </div>
        );
    } else if (atalho.model === "modeloDois") {
        const bgColorClass2 = atalho.bgColor ? atalhoStyle[atalho.bgColor] : '';
        const txtColorClass2 = atalho.bgTxtColor ? atalhoStyle[atalho.bgTxtColor] : '';

        return (
            <div className={`${atalhoStyle.atalhoContainerModelo2} ${bgColorClass2} ${txtColorClass2}`} onClick={atalho.onClick}>
                <h3>{atalho.titulo}</h3>
            </div>
        );
    } else {
        return null; // Adicione um tratamento de erro ou retorno padrão, se necessário
    }
}