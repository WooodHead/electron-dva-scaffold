// tslint:disable-next-line:no-unused-variable
import * as React from 'react';
import { RouterAPI } from 'dva';
import { Route, Switch, Redirect, routerRedux } from 'dva/router';
import dynamic, { RouteComponentType } from 'dva/dynamic';
import App from './app';

const { ConnectedRouter } = routerRedux;

interface RouteDescription {
  path: string;
  models?: () => Promise<any>[];
  component: () => RouteComponentType | Promise<any>;
}

const routes: RouteDescription[] = [];

export function registeRoute(route: RouteDescription) {
  routes.push(route);
}

registeRoute({
  path: '/home',
  component: () => import('./home'),
  models: () => [],
});

registeRoute({
  path: '/login',
  component: () => import('./login'),
  models: () => [import('../models/login')],
});

registeRoute({
  path: '/export',
  component: () => import('./shopify/export'),
  models: () => [import('../models/shopify')],
});

registeRoute({
  path: '/import',
  component: () => import('./shopify/import'),
  models: () => [import('../models/shopify')],
});

registeRoute({
  path: '/settings/export',
  component: () => import('./shopify/settings/ExportSettings'),
  models: () => [import('../models/shopify')],
});

registeRoute({
  path: '/settings/import',
  component: () => import('./shopify/settings/ImportSettings'),
  models: () => [import('../models/shopify')],
});

function RouterConfig({ history, app }: RouterAPI) {
  const error = dynamic({
    app,
    component: () => import('./error'),
  });

  return (
    <ConnectedRouter history={history}>
      <App>
        <Switch>
          <Route exact path="/" render={() => (<Redirect to="/export" />)} />
          {
            routes.map(({ path, component, ...dynamics }, index) => (
              <Route
                key={index}
                exact
                path={path}
                component={dynamic({
                  app,
                  component,
                  ...dynamics
                })}
              />
            ))
          }
          <Route component={error} />
        </Switch>
      </App>
    </ConnectedRouter>
  );
}

export default RouterConfig;
