import atalhoStyle from './atalho.module.css';

interface AtalhoProps {
  titulo: string;
  onClick?: () => void;
  iconSrc?: string;
  iconAlt?: string;
  bgColor?:
    | 'paleGreen'
    | 'cornflowerBlue'
    | 'lightSalmon'
    | 'paleVioletRed'
    | 'mediumPurple'
    | 'aquamarine'
    | 'lightSteelBlue'
    | 'sandyBrown'
    | 'skyBlue'
    | 'paleTurquoise'
    | 'lightPink';
  bgTxtColor?: 'textColorDark' | 'textColorWhite';
  model: 'modeloUm' | 'modeloDois';
}

export const Atalho = (atalho: AtalhoProps) => {
  const bgColorClass = atalho.bgColor ? atalhoStyle[atalho.bgColor] : '';
  const txtColorClass = atalho.bgTxtColor ? atalhoStyle[atalho.bgTxtColor] : '';
  const containerClass =
    atalho.model === 'modeloUm' ? atalhoStyle.atalhoContainer : atalhoStyle.atalhoContainerModelo2;

  return (
    <div className={`${containerClass} ${bgColorClass} ${txtColorClass}`} onClick={atalho.onClick}>
      {atalho.iconSrc && <img alt={atalho.iconAlt ?? atalho.titulo} className={atalhoStyle.atalhoIcon} src={atalho.iconSrc} />}
      <h3>{atalho.titulo}</h3>
    </div>
  );
};
