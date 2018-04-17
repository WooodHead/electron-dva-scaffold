import { RouterState } from 'react-router-redux';
import { UserInfo, Menu } from '../user';

export interface LoadingState {
    global: boolean;
    effects: {
        [key: string]: boolean;
    };
    models: {
        [key: string]: boolean;
    };
}

export interface RoutingState extends RouterState {
}

export interface AppState {
    user: UserInfo;
    permissions: {
        visit: string[];
    };
    menus: Menu[];
    menuPopoverVisible: boolean;
    siderFold: boolean;
    darkTheme: boolean;
    isNavbar: boolean;
    navOpenKeys: string[];
    locationPathname: string;
    locationPathQuery: Object;
}

export interface ReduxState {
    app: AppState;
    loading: LoadingState;
    routing: RoutingState;
}