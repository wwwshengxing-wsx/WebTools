import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import App from './App';
import CounterPage from './pages/Counter';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <CounterPage />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
