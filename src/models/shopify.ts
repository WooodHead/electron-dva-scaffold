import { Model } from 'dva';
import { orders, export_invoice, import_express, delivery, change_settings, OrdersOptions } from 'services/shopify';
import { m } from 'services/message';
import { ShopifyState, ReduxState } from 'interfaces/state';
import { ExpressOrder } from 'interfaces/shopify';

const shopifySettings_key = 'shopify_settings';

const VERSION = 1;
let settings = JSON.parse(window.localStorage.getItem(shopifySettings_key)) || {
};
if (settings && settings.version !== VERSION ) {
	settings = {};
}

export default {
	namespace: 'shopify',
	state: {
		orders: [],
		express_orders: [],
		import_settings: settings.import || {
			order_start_line: 4,
			excel_mapping: [
				{ id: 'name', col: 'M', label: '订单名称' },
				{ id: 'tracking_number', col: 'C', label: '运单号' },
				{ id: 'twice_number', col: 'D', label: '二程单号' },
				{ id: 'date', col: 'B', label: '寄件日期' },
				{ id: 'route', col: 'E', label: '路线' },
				{ id: 'destination', col: 'I', label: '目的地' },
				{ id: 'recipient', col: 'L', label: '收件人' },
			]
		},
		export_settings: settings.export || {
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
			const list = yield call(orders, payload || {
				financial_status: 'paid',
				fulfillment_status: 'unshipped',
				limit: 200
			} as OrdersOptions);
			yield put({
				type: 'updateState',
				payload: { orders: list }
			});
		},
		* applySettings(action, { call, select }) {
			const { import_settings, export_settings }: ShopifyState = yield select((_: ReduxState) => _.shopify);
			const new_settings = {
				version: VERSION,
				import: import_settings,
				export: export_settings
			};
			window.localStorage.setItem(shopifySettings_key, JSON.stringify(new_settings));
			yield call(change_settings, new_settings);
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
		* import({ payload }, { call, put, take, select }) {
			// 导入之前先拉取订单，确保能通过订单名称获取订单id
			yield put({ type: 'query' });
			yield take('shopify/updateState');

			const { orders }: ShopifyState = yield select((_: ReduxState) => _.shopify);

			// 此时导入的运单数据不包含订单id，需要把订单名称映射到订单id
			let express_orders: ExpressOrder[] = yield call(import_express, payload);

			// 运单通过运单名称添加对应订单id
			express_orders.forEach(express_order => {
				if (!express_order.name) {
					return;
				}
				const order = orders.find(order => order.name === express_order.name);
				if (order) {
					express_order.id = order.id.toString();
				}
			});

			const length = express_orders.length;
			express_orders = express_orders.filter(order => !!order.id);
			if (express_orders.length < length) {
				m.warn(`导入${length}条订单数据, 已过滤已发货或者无订单名称的数据${length - express_orders.length}条`);
			}
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
