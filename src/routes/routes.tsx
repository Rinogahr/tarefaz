import {BrowserRouter, Routes ,Route} from 'react-router-dom';
import { Home } from '../components/home-component/home';
import { Tarefa } from '../components/tarefa-component/tarefa';

export const Rotas = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />}/>
                <Route path="/task/:id" element={<Tarefa />}/>
                <Route path="*" element={<h1>400 not fund</h1>}/>
            </Routes>
        </BrowserRouter>
    );
}