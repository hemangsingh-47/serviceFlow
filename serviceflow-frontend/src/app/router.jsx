import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: <div className="p-8"><h1 className="text-2xl font-bold">Dashboard</h1><p>Welcome to ServiceFlow Dashboard!</p></div>,
  },
  {
    path: '/login',
    element: <div className="p-8"><h1 className="text-2xl font-bold">Login</h1><p>Login page placeholder</p></div>,
  },
  {
    path: '*',
    element: <div className="p-8"><h1 className="text-2xl font-bold text-danger">404 - Not Found</h1></div>,
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
