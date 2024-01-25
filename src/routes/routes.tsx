// configurando router
import {createBrowserRouter, RouterProvider} from 'react-router-dom';

import { Home } from '../components/home-component/home';
import { Tarefa } from '../components/tarefa-component/tarefa';
import { DashBoard } from '../components/dash-board/dash-board';




const router = createBrowserRouter([
    { path: '/', 
      element: <Home /> ,
      children: [
        {
            path: "/",
            element: <DashBoard/>
        },
        {
            path: "task/:id",
            element: <Tarefa/>
        }
      ]
    }
]);

export const Rotas = () => {
    return ( <RouterProvider router={router}/> );
}