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

function RouterConfig({ history, app }: RouterAPI) {
  // todo: 404 page.
  const error = dynamic({
    app,
    component: () => () => (<div>404</div>),
  });

  const routes: RouteDescription[] = [
    {
      path: '/home',
      component: () => System.import('./home'),
      models: () => [],
    },
    {
      path: '/login',
      component: () => System.import('./login'),
      models: () => [System.import('../models/login')],
    }
  ];

  return (
    <ConnectedRouter history={history}>
      <App>
        <Switch>
          <Route exact path="/" render={() => (<Redirect to="/home" />)} />
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
