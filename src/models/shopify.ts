import { Model } from 'dva';
import { orders, export_invoice, import_express, delivery } from 'services/shopify';
import { ShopifyState, ReduxState } from 'interfaces/state';
import { ExpressOrder } from 'interfaces/shopify';

export default {
	namespace: 'shopify',
	state: {
		orders: [],
		express_orders: []
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
				payload: { orders: list }
			});
		},
		* export({ payload }, { call }) {
			yield call(export_invoice, payload.order, payload.dir);
		},
		* import({ payload }, { call, put }) {
			const express_orders = yield call(import_express, payload);
			yield put({
				type: 'updateState',
				payload: { express_orders }
			});
		},
		* delivery({ payload }, { call, put, select }) {
			const order: ExpressOrder = payload;
			const fulfillment = yield call(delivery, order);
			const { express_orders }: ShopifyState = yield select((_: ReduxState) => _.shopify);
			const orders = express_orders.concat();
			order.fulfillment = fulfillment;
			yield put({
				type: 'updateState',
				payload: { express_orders: orders }
			});
		},
	},

	reducers: {
		// updateExpressOrder(state: ShopifyState, { payload }) {
		// 	const order: ExpressOrder = payload;
		// 	state.express_orders
		// 	return {
		// 		...state,
				
		// 	};
		// },
		updateState(state, { payload }) {
			return {
				...state,
				...payload
			};
		},
	},
} as Model;
