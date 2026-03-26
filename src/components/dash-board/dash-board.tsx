import { Atalho } from '../atalho-component/atalho';
import dashBoardStyle from './dash-board.module.css';


export const DashBoard = () => {
    return(
        <div className={dashBoardStyle.dashboard}>
            <div className={dashBoardStyle.shotsContainer}>
                <div>
                    <h1>Dashboard</h1>
                </div>
                {/* <div className={dashBoardStyle.btsContainer}>
                    <div>bt1</div>
                    <div>bt2</div>
                </div> */}
            </div>
            <div className={dashBoardStyle.atalho2Container}>
                <Atalho model="modeloDois" titulo="Exemplo de Component" bgColor="aquamarine"/>
                <Atalho model="modeloDois" titulo="Exemplo de Component" bgColor="cornflowerBlue"/>
                <Atalho model="modeloDois" titulo="Exemplo de Component" bgColor="lightPink"/>
                <Atalho model="modeloDois" titulo="Exemplo de Component" bgColor="lightSteelBlue"/>
                <Atalho model="modeloDois" titulo="Exemplo de Component" bgColor="paleTurquoise"/>
                <Atalho model="modeloDois" titulo="Exemplo de Component" bgColor="sandyBrown"/>
            </div>
        </div>
    );
}