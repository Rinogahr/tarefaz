import { Atalho } from '../atalho-component/atalho';
import dashBoardStyle from './dash-board.module.css';


export const DashBoard = () => {
    return(
        <div className={dashBoardStyle.dashboard}>
            <div className={dashBoardStyle.shotsContainer}>
                <div>
                    <h1>Dashboard</h1>
                </div>
                <div className={dashBoardStyle.btsContainer}>
                    <div></div>
                    <div></div>
                </div>
            </div>
            <div className={dashBoardStyle.atalho2Container}>
                <Atalho model="modeloDois" titulo="botão atalho - 1" bgColor="aquamarine"/>
                <Atalho model="modeloDois" titulo="botão atalho - 2" bgColor="cornflowerBlue"/>
                <Atalho model="modeloDois" titulo="botão atalho - 3" bgColor="lightPink"/>
                <Atalho model="modeloDois" titulo="botão atalho - 4" bgColor="lightSteelBlue"/>
                <Atalho model="modeloDois" titulo="botão atalho - 5" bgColor="paleTurquoise"/>
                <Atalho model="modeloDois" titulo="botão atalho - 6" bgColor="sandyBrown"/>
            </div>
        </div>
    );
}