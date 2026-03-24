import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { DashBoard } from '../components/dash-board/dash-board';
import { Home } from '../components/home-component/home';
import { LoginScreen } from '../components/login-screen/login-screen';
import { Tarefa } from '../components/tarefa-component/tarefa';
import { possuiSessaoAutenticada } from '../services/auth-service';

const RotaProtegida = () => {
  if (!possuiSessaoAutenticada()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginScreen />,
  },
  {
    element: <RotaProtegida />,
    children: [
      {
        path: '/home',
        element: <Home />,
        children: [
          {
            path: '/home',
            element: <DashBoard />,
          },
          {
            path: 'task/:id/:status?',
            element: <Tarefa />,
          },
        ],
      },
    ],
  },
]);

export const Rotas = () => <RouterProvider router={router} />;
