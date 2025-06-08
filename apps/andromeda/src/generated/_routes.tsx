import RouteComp0 from '@/pages/_layout';
import RouteComp1 from '@/pages/index';
import RouteComp2 from '@/pages/[...404]';
import RouteComp3 from '@/pages/auth';
import RouteComp4 from '@/pages/dashboard';
import RouteComp5 from '@/pages/test';
import React from 'react';
import { type RouteObject } from 'react-router';

const routes: RouteObject[] = [
  {
    "path": "/",
    "element": React.createElement(RouteComp0),
    "children": [
      {
        "index": true,
        "element": React.createElement(RouteComp1)
      },
      {
        "index": false,
        "path": "*",
        "element": React.createElement(RouteComp2)
      },
      {
        "index": false,
        "path": "auth",
        "element": React.createElement(RouteComp3)
      },
      {
        "index": false,
        "path": "dashboard",
        "element": React.createElement(RouteComp4)
      },
      {
        "index": false,
        "path": "test",
        "element": React.createElement(RouteComp5)
      }
    ]
  }
];

export default routes;
