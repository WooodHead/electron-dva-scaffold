declare module 'dva' {
    import {
        Reducer,
        Action,
        ReducersMapObject,
        Dispatch,
        MiddlewareAPI,
        StoreEnhancer
    } from 'redux';
    import { connect as redux_connect } from 'react-redux';
    import * as sagaEffects from 'redux-saga/effects';

    import { History } from "history";
    import * as React from "react";

    export interface onActionFunc {
        (api: MiddlewareAPI<any>): void;
    }

    export interface ReducerEnhancer {
        (reducer: Reducer<any>): void
    }

    export interface Hooks {
        onError?: (e: Error, dispatch: Dispatch<any>) => void;
        onAction?: onActionFunc | onActionFunc[];
        onStateChange?: () => void;
        onReducer?: ReducerEnhancer;
        onEffect?: () => void;
        onHmr?: () => void;
        extraReducers?: ReducersMapObject;
        extraEnhancers?: StoreEnhancer<any>[];
    }

    export type DvaOption = Hooks & {
        initialState?: Object;
        history?: Object;
    }

    export type Effect = (action: Action & { [key: string]: any }, effects: typeof sagaEffects) => void;
    export type EffectType = 'takeEvery' | 'takeLatest' | 'watcher' | 'throttle';
    export type EffectWithType = [Effect, { type: EffectType }];
    export type Subscription = (api: SubscriptionAPI, done: Function) => void;
    export type ReducersMapObjectWithEnhancer = [ReducersMapObject, ReducerEnhancer];

    export interface EffectsMapObject {
        [key: string]: Effect | EffectWithType;
    }

    export interface SubscriptionAPI {
        history: History;
        dispatch: Dispatch<any>;
    }

    export interface SubscriptionsMapObject {
        [key: string]: Subscription;
    }

    export interface Model {
        namespace: string,
        state?: any,
        reducers?: ReducersMapObject | ReducersMapObjectWithEnhancer,
        effects?: EffectsMapObject,
        subscriptions?: SubscriptionsMapObject,
    }

    export interface RouterAPI {
        history: History;
        app: DvaInstance;
    }

    export interface Router {
        (api?: RouterAPI): JSX.Element | Object;
    }

    export interface DvaInstance {
        /**
         * Register an object of hooks on the application.
         *
         * @param hooks
         */
        use: (hooks: Hooks) => void,

        /**
         * Register a model.
         *
         * @param model
         */
        model: (model: Model) => void,

        /**
         * Unregister a model.
         *
         * @param namespace
         */
        unmodel: (namespace: string) => void,

        /**
         * Config router. Takes a function with arguments { history, dispatch },
         * and expects router config. It use the same api as react-router,
         * return jsx elements or JavaScript Object for dynamic routing.
         *
         * @param router
         */
        router: (router: Router) => void,

        /**
         * Start the application. Selector is optional. If no selector
         * arguments, it will return a function that return JSX elements.
         *
         * @param selector
         */
        start: (selector?: HTMLElement | string) => any,
    }

    export default function dva(opts?: DvaOption): DvaInstance;

    /**
     * Connects a React component to Dva.
     */
    export const connect: typeof redux_connect;
}

declare module 'dva/router' {
    import * as rrr from 'react-router-redux';
    export * from 'react-router-dom';
    export const routerRedux: typeof rrr;
}

declare module 'dva/fetch' {
    import * as fetch from 'isomorphic-fetch';
    export = fetch;
}

declare module 'dva/dynamic' {
    import { DvaInstance, Model } from 'dva';
    import { RouteComponentProps } from 'react-router';

    export type RouteComponentType = React.ComponentType<RouteComponentProps<any>>;

    interface AsyncComponentConfig {
        LoadingComponent?: React.ComponentType;
        resolve?: () => Promise<any>;
        app: DvaInstance;
        models?: () => Promise<Model>[];
        component: () => RouteComponentType | Promise<any>;
    }
    function dynamic(config: AsyncComponentConfig): RouteComponentType;
    export default dynamic;
}