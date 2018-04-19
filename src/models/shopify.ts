import { Model } from 'dva';
import { orders, export_invoice } from 'services/shopify';
import { ShopifyState } from 'interfaces/state';

export default {
	namespace: 'shopify',
	state: {
		orders: []
	} as ShopifyState,
	subscriptions: {
		// tslint:disable-next-line:no-unused-variable
		setup({ dispatch, history }) {
		},
	},

	effects: {
		* query({ payload }, { call, put }) {
			const list = yield call(orders, payload);
			yield put({
				type: 'updateState',
				payload: { orders: list } as ShopifyState
			});
		},
		* export({ payload }, { call }) {
			yield call(export_invoice, payload.order, payload.dir);
		},
	},

	reducers: {
		updateState(state, { payload }) {
			return {
				...state,
				...payload
			};
		},
	},
} as Model;
