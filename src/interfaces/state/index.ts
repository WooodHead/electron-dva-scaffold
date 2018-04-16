import { RouterState } from 'react-router-redux';

export interface RoutingState extends RouterState {
}

export interface AppState {
}

export interface ReduxState {
    app: AppState;
    routing: RoutingState;
}