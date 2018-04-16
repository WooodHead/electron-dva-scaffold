// tslint:disable-next-line:no-unused-variable
import * as React from 'react';
import { RouterAPI, Model } from 'dva';
import { Route, Switch, Redirect, routerRedux } from 'dva/router';
import dynamic, { RouteComponentType } from 'dva/dynamic';
import App from 'routes/app';

const { ConnectedRouter } = routerRedux;

interface RouteDescription {
  path: string;
  models?: () => Promise<Model>[];
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
      path: '/dashboard',
      component: () => import('./routes/dashboard'),
      models: () => [],
    }
  ];

  return (
    <ConnectedRouter history={history}>
      <App>
        <Switch>
          <Route exact path="/" render={() => (<Redirect to="/dashboard" />)} />
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
