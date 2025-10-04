import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import CounterPage from './pages/CounterPage';

export const router = createBrowserRouter([
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
]);
