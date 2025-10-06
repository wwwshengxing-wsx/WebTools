import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import App from './App';
import CounterPage from './pages/Counter';
import HomePage from './pages/Home';
import StoragePage from './pages/Storage';
import TextReplacementPage from './pages/TextReplacement';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'counter',
        element: <CounterPage />,
      },
      {
        path: 'storage',
        element: <StoragePage />,
      },
      {
        path: 'text-replacement',
        element: <TextReplacementPage />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
