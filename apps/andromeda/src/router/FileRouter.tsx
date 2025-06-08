import routes from '@/generated/_routes';
import React from 'react';
import { RouterProvider, createMemoryRouter } from 'react-router';

export const FileRouter = (): React.ReactElement => {
  if (!Array.isArray(routes) || routes.length === 0) {
    throw new Error('Error: routes is not an array or is empty.');
  }

  const router = createMemoryRouter(routes);

  return <RouterProvider router={router} />;
};
