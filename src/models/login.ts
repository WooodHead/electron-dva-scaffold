import { Model } from 'dva';
import { routerRedux } from 'dva/router';
import { login } from 'services/user';

export default {
    namespace: 'login',
    state: {},
    subscriptions: {
        // tslint:disable-next-line:no-unused-variable
        setup({ dispatch, history }) {
        },
    },

    effects: {
        * login({ payload }, { call, put }) {
            yield call(login, payload);
            yield put({ type: 'app/query' });
            yield put(routerRedux.push('/home'));
        },
    },

    reducers: {
    },
} as Model;
