import { Model } from 'dva';
import { orders, export_invoice, import_express, delivery, change_settings } from 'services/shopify';
import { ShopifyState, ReduxState } from 'interfaces/state';
import { ExpressOrder } from 'interfaces/shopify';

export default {
	namespace: 'shopify',
	state: {
		orders: [],
		express_orders: [],
		import_settings: {
			order_start_line: 4,
			excel_mapping: [
				{ id: 'id', col: 'M', label: '订单ID' },
				{ id: 'tracking_number', col: 'C', label: '运单号' },
				{ id: 'twice_number', col: 'D', label: '二程单号' },
				{ id: 'date', col: 'B', label: '寄件日期' },
				{ id: 'route', col: 'E', label: '路线' },
				{ id: 'destination', col: 'I', label: '目的地' },
				{ id: 'recipient', col: 'L', label: '收件人' },
			]
		},
		export_settings: {
			item_start_line: 13,
			cell_mapping: [
				{ id: 'date', cell: 'F7', label: '日期' },
				{ id: 'address', cell: 'B8', label: '地址' },
				{ id: 'po', cell: 'F8', label: '订单名' },
				{ id: 'tel', cell: 'B9', label: '电话' },
				{ id: 'ino', cell: 'F9', label: '流水号' },
				{ id: 'attn', cell: 'B10', label: '客户' },
				{ id: 'email', cell: 'B11', label: '邮箱' }
			]
		}
	} as ShopifyState,
	subscriptions: {
		// tslint:disable-next-line:no-unused-variable
		setup({ dispatch, history }) {
			dispatch({ type: 'applySettings' });
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
		* applySettings(action, { call, select }) {
			const { import_settings, export_settings }: ShopifyState = yield select((_: ReduxState) => _.shopify);
			yield call(change_settings, {
				import: import_settings,
				export: export_settings
			});
		},
		* changeImportSettings({ payload }, { put }) {
			yield put({
				type: 'updateState',
				payload: {
					import_settings: {
						...payload
					}
				}
			});
			yield put({ type: 'applySettings' });
		},
		* changeExportSettings({ payload }, { put }) {
			yield put({
				type: 'updateState',
				payload: {
					export_settings: {
						...payload
					}
				}
			});
			yield put({ type: 'applySettings' });
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
