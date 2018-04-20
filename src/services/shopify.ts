import * as request from './request';
import { ShopifyOrder, ShopifyOrderAddress, ExpressOrder } from 'interfaces/shopify';
import { Workbook, Row } from 'exceljs';
import * as path from 'path';
import moment from 'moment';
import number2english from 'number2english';
import { resourcesPath } from 'base/node/package';
import { price_map } from 'constants/shopify';

export interface OrdersOptions {
	ids: string[];
	limit?: number;
	page?: number;
	created_at_min?: string;  // format: 2014-04-25T16:15:47-04:00
	created_at_max?: string;
	updated_at_min?: string;
	updated_at_max?: string;
	processed_at_min?: string;
	processed_at_max?: string;
	status?: 'open' | 'closed' | 'cancelled' | 'any';
	financial_status?: 'authorized' | 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'voided' | 'partially_refunded' | 'any' | 'unpaid';
	fulfillment_status?: 'shipped' | 'partial' | 'unshipped' | 'any';
	fields?: string[];
}

const tracking_carriers = [
	{ name: "Royal Mail", pattern: "^([A-Z]{2}\d{9}GB)$", regexPattern: /^([A-Z]{2}\d{9}GB)$/i },
	{ name: "UPS", pattern: "^(1Z)|^(K\d{10}$)|^(T\d{10}$)", regexPattern: /^(1Z)|^(K\d{10}$)|^(T\d{10}$)/i },
	{ name: "Canada Post", pattern: "((CA)$|^\d{16}$)", regexPattern: /((CA)$|^\d{16}$)/i },
	{ name: "China Post", pattern: "^(R|CP|E|L)\w+CN$", regexPattern: /^(R|CP|E|L)\w+CN$/i },
	{ name: "FedEx", pattern: "^(\d{12}$)|^(\d{15}$)|^(96\d{20}$)", regexPattern: /^(\d{12}$)|^(\d{15}$)|^(96\d{20}$)/i },
	{ name: "PostNord", pattern: "\d{3}5705983\d{10}|DK$", regexPattern: /\d{3}5705983\d{10}|DK$/i },
	{ name: "USPS", pattern: "^((?:94001|92055|94073|93033|92701|94055|92088|92021|92001|94108|93612|94701|94058|94490|94612)\d{17}|7\d{19}|03\d{18}|8\d{9}|420\d{23,27}|10169\d{11}|[A-Z]{2}\d{9}US|(?:EV|CX)\d{9}CN|LK\d{9}HK)$", regexPattern: /^((?:94001|92055|94073|93033|92701|94055|92088|92021|92001|94108|93612|94701|94058|94490|94612)\d{17}|7\d{19}|03\d{18}|8\d{9}|420\d{23,27}|10169\d{11}|[A-Z]{2}\d{9}US|(?:EV|CX)\d{9}CN|LK\d{9}HK)$/i },
	{ name: "FedEx UK", pattern: null, regexPattern: /null/i },
	{ name: "DHL Express", pattern: "^(\d{10,11}$)", regexPattern: /^(\d{10,11}$)/i },
	{ name: "DHL eCommerce", pattern: "^(GM\d{16,18}$)|^([A-Z0-9]{14}$)|^(\d{22}$)", regexPattern: /^(GM\d{16,18}$)|^([A-Z0-9]{14}$)|^(\d{22}$)/i },
	{ name: "DHL eCommerce Asia", pattern: "^P[A-Z0-9]{14}$", regexPattern: /^P[A-Z0-9]{14}$/i },
	{ name: "Eagle", pattern: null, regexPattern: /null/i },
	{ name: "Purolator", pattern: "^[A-Z]{3}\d{9}$", regexPattern: /^[A-Z]{3}\d{9}$/i },
	{ name: "TNT", pattern: null, regexPattern: /null/i },
	{ name: "Australia Post", pattern: "^([A-Z]{2}\d{9}AU)$", regexPattern: /^([A-Z]{2}\d{9}AU)$/i },
	{ name: "New Zealand Post", pattern: "^[A-Z]{2}\d{9}NZ$", regexPattern: /^[A-Z]{2}\d{9}NZ$/i },
	{ name: "Correios", pattern: "^[A-Z]{2}\d{9}BR$", regexPattern: /^[A-Z]{2}\d{9}BR$/i },
	{ name: "TNT Post", pattern: "^\w{13}$", regexPattern: /^\w{13}$/i },
	{ name: "4PX", pattern: "^RF\d{9}SG$|^RT\d{9}HK$|^7\d{10}$|^P0{4}\d{8}$|^JJ\d{9}GB$|^MS\d{8}XSG$", regexPattern: /^RF\d{9}SG$|^RT\d{9}HK$|^7\d{10}$|^P0{4}\d{8}$|^JJ\d{9}GB$|^MS\d{8}XSG$/i },
	{ name: "APC", pattern: "^PF\d{11}$|^\d{13}$", regexPattern: /^PF\d{11}$|^\d{13}$/i },
	{ name: "FSC", pattern: "^((?:LS|LM|RW|RS|RU|RX)\d{9}(?:CN|CH|DE)|(?:WU\d{13})|(?:\w{10}$|\d{22}))$", regexPattern: /^((?:LS|LM|RW|RS|RU|RX)\d{9}(?:CN|CH|DE)|(?:WU\d{13})|(?:\w{10}$|\d{22}))$/i },
	{ name: "GLS", pattern: "^\d{10,14}$|^Y\w{7}$", regexPattern: /^\d{10,14}$|^Y\w{7}$/i },
	{ name: "Globegistics", pattern: "^JJ\d{9}GB$|^(LM|CJ|LX|UM|LJ|LN)\d{9}US$|^(GAMLABNY|BAIBRATX|SIMGLODE)\d{10}$|^\d{10}$", regexPattern: /^JJ\d{9}GB$|^(LM|CJ|LX|UM|LJ|LN)\d{9}US$|^(GAMLABNY|BAIBRATX|SIMGLODE)\d{10}$|^\d{10}$/i },
	{ name: "Amazon Logistics US", pattern: "^TBA\d{12,13}$", regexPattern: /^TBA\d{12,13}$/i },
	{ name: "Amazon Logistics UK", pattern: "^Q\d{11,13}$", regexPattern: /^Q\d{11,13}$/i },
	{ name: "Bluedart", pattern: "^\d{9,11}$", regexPattern: /^\d{9,11}$/i },
	{ name: "Delhivery", pattern: "^\d{11,12}$", regexPattern: /^\d{11,12}$/i },
	{ name: "Japan Post", pattern: "^[a-z]{2}\d{9}JP|^\d{11}$", regexPattern: /^[a-z]{2}\d{9}JP|^\d{11}$/i },
	{ name: "Sagawa (EN)", pattern: "^\d{10,12}$", regexPattern: /^\d{10,12}$/i },
	{ name: "Sagawa (JA)", pattern: "^\d{10,12}$", regexPattern: /^\d{10,12}$/i },
	{ name: "Yamato (EN)", pattern: "^\d{12}$", regexPattern: /^\d{12}$/i },
	{ name: "Yamato (JA)", pattern: "^\d{12}$", regexPattern: /^\d{12}$/i },
	{ name: "DPD", pattern: "^\d{10}$|^\d{14}\w{0,1}$|^\d{18}$", regexPattern: /^\d{10}$|^\d{14}\w{0,1}$|^\d{18}$/i },
	{ name: "DPD UK", pattern: "^\d{10}$|^\d{14}\w{0,1}$|^\d{18}$", regexPattern: /^\d{10}$|^\d{14}\w{0,1}$|^\d{18}$/i },
	{ name: "DPD Local", pattern: "^\d{10}$|^\d{14}\w{0,1}$|^\d{18}$", regexPattern: /^\d{10}$|^\d{14}\w{0,1}$|^\d{18}$/i },
	{ name: "Newgistics", pattern: "^[a-z]{2}\d{8}$|^\d{16}$|^\d{22}$|^\d{34}$", regexPattern: /^[a-z]{2}\d{8}$|^\d{16}$|^\d{22}$|^\d{34}$/i }
];
const api_key = '6ce3db2131682b30feec911060929a46';
const password = '9c23d6dcec931f17bcbc97750a32dc99';

// const api_key = '0b543326882395df8e0cc8e8b5278133';
// const password = '3e4bbf4ffa2cba9302939e6f56458366';

const baseUrl = `https://astroreality.myshopify.com`;

// const baseUrl = `https://xzper.myshopify.com`;
const headers = {
	Host: 'astroreality.myshopify.com',
	Authorization: `Basic ${window.btoa(api_key + ':' + password)}`
};

export async function orders(options?: OrdersOptions) {
	const body = await request.get(`${baseUrl}/admin/orders.json`, {
		headers: headers,
		params: options
	});
	return body.orders as ShopifyOrder[];
}

function getAddress(ship: ShopifyOrderAddress) {
	const { address1, address2, city, province, zip, country } = ship;
	let address = '';
	address += `${address1} ${address2}, `;
	address += `${city}, `;
	address += province ? `${province}, ` : '';
	address += zip ? `${zip}, ` : '';
	address += country;
	return address;
}

export async function export_invoice(order: ShopifyOrder, export_dir: string) {
	const workbook = new Workbook();
	await workbook.xlsx.readFile(path.join(resourcesPath, 'invoice.xlsx'));
	const sheet = workbook.getWorksheet(undefined);
	(sheet as any).name = order.name.replace('#', '');

	const date_cell = sheet.getCell('F7');
	date_cell.value = new Date();

	const address = getAddress(order.shipping_address);
	const address_cell = sheet.getCell('B8');
	address_cell.value = address;

	const po_cell = sheet.getCell('F8');
	po_cell.value = order.name;

	const tel_cell = sheet.getCell('B9');
	tel_cell.value = order.shipping_address.phone;

	const ino_cell = sheet.getCell('F9');
	const qta = `QTA${moment().format('YYMMDD')}${order.name.replace(/[^0-9]/ig, "")}`;
	ino_cell.value = qta;

	const attn_cell = sheet.getCell('B10');
	attn_cell.value = `${order.shipping_address.first_name} ${order.shipping_address.last_name}`;

	const email_cell = sheet.getCell('B11');
	email_cell.value = order.email;

	function saveStyles(row: Row) {
		let cell_styles = [];
		const cellCount = row.cellCount;
		for (let i = 0; i < cellCount; i++) {
			const cell = row.getCell(i + 1);
			cell_styles.push(Object.assign({}, cell.style));
		}
		return cell_styles;
	}

	function restoreStyles(row: Row, cell_styles: any) {
		const cellCount = row.cellCount;
		for (let i = 0; i < cellCount; i++) {
			const cell = row.getCell(i + 1);
			cell.style = cell_styles[i];
		}
	}

	const line_start_row = 13;
	const total_row_index = 14;
	const rows = [];

	const line_row = sheet.getRow(line_start_row);
	const line_row_styles = saveStyles(line_row);

	const total_row = sheet.getRow(total_row_index);
	const total_row_styles = saveStyles(total_row);

	const dollor_row = sheet.getRow(total_row_index + 1);
	const dollor_row_styles = saveStyles(dollor_row);

	const china_row = sheet.getRow(total_row_index + 2);
	const china_row_styles = saveStyles(china_row);

	let total_price = 0;
	order.line_items.map((item, i) => {
		const invocie_price = price_map[item.sku] || item.price;
		const line_price = item.quantity * parseFloat(invocie_price);
		const row_data = [
			item.sku,
			item.name,
			item.quantity,
			invocie_price,
			line_price,
			""
		];
		total_price += line_price;
		rows.push(row_data);
	});
	sheet.spliceRows(line_start_row, 1, ...rows);

	order.line_items.map((item, i) => {
		const r = sheet.getRow(line_start_row + i);
		restoreStyles(r, line_row_styles);
	});

	const new_total_row_index = total_row_index + order.line_items.length - 1;
	const new_total_row = sheet.getRow(new_total_row_index);
	restoreStyles(new_total_row, total_row_styles);

	const total_cell = sheet.getCell(`E${new_total_row_index}`);
	total_cell.value = {
		formula: `SUM(E${line_start_row}:E${new_total_row_index - 1})`,
		result: total_price
	};

	const new_dollor_row_index = new_total_row_index + 1;
	const new_dollor_row = sheet.getRow(new_dollor_row_index);
	restoreStyles(new_dollor_row, dollor_row_styles);

	const new_china_row_index = new_dollor_row_index + 1;
	const new_china_row = sheet.getRow(new_china_row_index);
	restoreStyles(new_china_row, china_row_styles);

	const new_dollor_cell = sheet.getCell(`A${new_dollor_row_index}`);
	new_dollor_cell.value = `SAY: US DOLLAR ${number2english(total_price).toUpperCase()} ONLY. `;

	if (!new_dollor_cell.isMerged) {
		sheet.mergeCells(`A${new_dollor_row_index}:F${new_dollor_row_index}`);
	}
	// if (!new_china_cell.isMerged) {
	// 	sheet.mergeCells(`A${new_china_row_index}:B${new_china_row_index}`);
	// }

	await workbook.xlsx.writeFile(path.join(export_dir, order.name + '.xlsx'));
}

export async function import_express(file: string) {
	const workbook = new Workbook();
	await workbook.xlsx.readFile(file);
	const sheet = workbook.getWorksheet(undefined);

	const line_start_index = 4;
	let index = line_start_index;

	const cell_map = {
		'M': 'id',
		'B': 'date',
		'C': 'tracking_number',
		'D': 'twice_number',
		'E': 'route',
		'I': 'destination',
		'L': 'recipient'
	};

	const orders: ExpressOrder[] = [];

	while (!sheet.getCell(`A${index}`).isMerged) {
		const order = Object.create(null);
		Object.keys(cell_map).forEach(c => {
			const cell = sheet.getCell(`${c}${index}`);
			order[cell_map[c]] = cell.text;
		});
		orders.push(order);
		index++;
	}
	return orders;
}

function companyFromNumber(e) {
	e = e.toString();
	function matchingCarriers(e) {
		var t, n, i, r, o;
		for (r = [],
			e = e.replace(/[^a-zA-Z0-9\\s]+/g, ""),
			o = tracking_carriers,
			n = 0,
			i = o.length; n < i; n++) {
			t = o[n];
			if (!t.regexPattern) {
				t.regexPattern = new RegExp(t.pattern, "i");
			}
			if (e.match(t.regexPattern)) {
				r.push(t.name);
			}
		}
		return r;
	}
	return null === e || "" === e ? "None" : matchingCarriers(e)[0] || "Other";
}

async function fulfillments(order_id: string) {
	const body = await request.get(`${baseUrl}/admin/orders/${order_id}/fulfillments.json`, {
		headers: headers
	});
	return body.fulfillments as any[];
}

export async function delivery(order: ExpressOrder) {
	let fms = await fulfillments(order.id);
	fms = fms.filter(fm => {
		return fm.status === 'pending' || fm.status === 'open' || fm.status === 'success';
	});
	if (fms.length > 0) {
		return fms[0];
	}

	const company = companyFromNumber(order.twice_number);
	const body = await request.post(`${baseUrl}/admin/orders/${order.id}/fulfillments.json`, {
		headers: headers,
		body: {
			fulfillment: {
				tracking_number: order.twice_number,
				tracking_company: company,
				notify_customer: true
			}
		}
	});
	return body.fulfillment;
}