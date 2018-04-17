import { Model } from 'dva';
import * as qs from 'query-string';
import { AppState, ReduxState } from 'interfaces/state';
import { UserInfo, Menu } from 'interfaces/user';
import { query, logout } from 'services/user';
import { queryMenus } from 'services/menus';
import { EnumRole } from 'constants/enum';
import { routerRedux } from 'dva/router';

const minNavWidth = 769;

const siderFold_key = 'admin_siderFold';
const darkTheme_key = 'admin_darkTheme';
const navOpenKeys_key = 'admin_navOpenKeys';

export default {
	namespace: 'app',
	state: {
		user: {},
		permissions: {
			visit: [],
		},
		menus: [
			{
				id: '1',
				icon: 'laptop',
				name: 'Home',
				route: '/home',
			},
		],
		menuPopoverVisible: false,
		siderFold: window.localStorage.getItem(siderFold_key) === 'true',
		darkTheme: window.localStorage.getItem(darkTheme_key) === 'true',
		isNavbar: document.body.clientWidth < minNavWidth,
		navOpenKeys: JSON.parse(window.localStorage.getItem(navOpenKeys_key)) || [],
		locationPathname: '',
		locationPathQuery: {}
	} as AppState,
	subscriptions: {
        setupHistory({ dispatch, history }) {
            history.listen(location => {
                dispatch({
                    type: 'updateState',
                    payload: {
                        locationPathname: location.pathname,
                        locationQuery: qs.parse(location.search),
                    },
                });
            });
        },
        setup({ dispatch }) {
            dispatch({ type: 'query' });
            let tid;
            window.onresize = () => {
                clearTimeout(tid);
                tid = setTimeout(() => {
                    dispatch({ type: 'changeNavbar' });
                }, 300);
            };
        }
	},
	effects: {
		*query(action, { call, put, select }) {
            let user: UserInfo;
            try {
                user = yield call(query);
            } catch (error) {
                user = null;
            }
            const { locationPathname }: AppState = yield select((_: ReduxState) => _.app);
            if (user) {
                const list: Menu[] = yield call(queryMenus);
                let menus = list;
                const { permissions } = user;
                if (permissions.role === EnumRole.ADMIN || permissions.role === EnumRole.DEVELOPER) {
                    permissions.visit = list.map(item => item.id);
                } else {
                    menus = list.filter((item) => {
                        const cases = [
                            permissions.visit.includes(item.id),
                            item.mpid ? permissions.visit.includes(item.mpid) || item.mpid === '-1' : true,
                            item.bpid ? permissions.visit.includes(item.bpid) : true,
                        ];
                        return cases.every(_ => _);
                    });
                }

                yield put({
                    type: 'updateState',
                    payload: { user, permissions, menus },
                });
                if (location.pathname === '/login') {
                    yield put(routerRedux.push({
                        pathname: '/home',
                    }));
                }
            } else {
                yield put(routerRedux.push({
                    pathname: '/login',
                    search: qs.stringify({
                        from: locationPathname,
                    }),
                }));
            }
		},
		*logout(action, { call, put }) {
            yield call(logout);
            yield put({ type: 'query' });
		},
		*changeNavbar(action, { put, select }) {
            const { app }: ReduxState = yield select();
            const isNavbar = document.body.clientWidth < minNavWidth;
            if (isNavbar !== app.isNavbar) {
                yield put({
                    type: 'updateState',
                    payload: { isNavbar }
                });
            }
        },
        *changeNavOpenKeys({ payload }, { put }) {
            window.localStorage.setItem(navOpenKeys_key, JSON.stringify(payload));
            yield put({
                type: 'updateState',
                payload: { navOpenKeys: payload }
            });
        },
        *switchSider(action, { put, select }) {
            const { app }: ReduxState = yield select();
            const value = !app.siderFold;
            window.localStorage.setItem(siderFold_key, value + '');
            yield put({
                type: 'updateState',
                payload: { siderFold: value }
            });
        },
        *switchTheme(action, { put, select }) {
            const { app }: ReduxState = yield select();
            const value = !app.darkTheme;
            window.localStorage.setItem(darkTheme_key, value + '');
            yield put({
                type: 'updateState',
                payload: { darkTheme: value }
            });
        },
	},
	reducers: {
        updateState(state, { payload }) {
            return {
                ...state,
                ...payload
            };
        },
        switchMenuPopver(state: AppState) {
            return {
                ...state,
                menuPopoverVisible: !state.menuPopoverVisible,
            };
        },
    }
} as Model;