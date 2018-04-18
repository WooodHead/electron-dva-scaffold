import * as request from './request';
import { ShopifyOrder, ShopifyOrderAddress } from 'interfaces/shopify';
import { Workbook, Row } from 'exceljs';
import * as path from 'path';
import { resourcesPath } from 'base/node/package';

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

const api_key = '6ce3db2131682b30feec911060929a46';
const password = '9c23d6dcec931f17bcbc97750a32dc99';

const baseUrl = `https://astroreality.myshopify.com`;
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
	return `${address1} ${address2}, ${city}, ${province}, ${zip ? (zip + ', ') : ''}${country}`;
}

export async function export_invoice(order: ShopifyOrder) {
	const workbook = new Workbook();
	await workbook.xlsx.readFile(path.join(resourcesPath, 'invoice.xlsx'));
	const sheet = workbook.getWorksheet(undefined);
	(sheet as any).name = order.name.replace('#', '');

	const address = getAddress(order.shipping_address);
	const address_cell = sheet.getCell('B8');
	address_cell.value = address;

	const po_cell = sheet.getCell('F8');
	po_cell.value = order.name;

	const tel_cell = sheet.getCell('B9');
	tel_cell.value = order.shipping_address.phone;

	const ino_cell = sheet.getCell('F9');
	ino_cell.value = `QTA${180414}11`;  // todo

	const attn_cell = sheet.getCell('B10');
	attn_cell.value = `${order.shipping_address.first_name} ${order.shipping_address.last_name}`;

	const email_cell = sheet.getCell('B11');
	email_cell.value = order.email;

	const dollor_cell = sheet.getCell('A15');
	dollor_cell.value = 'SAY: US DOLLAR ONE HUNDRED AND FORTY NINE ONLY. ';
	const dollor_model = Object.assign({}, dollor_cell.model);

	const china_cell = sheet.getCell('A16');
	china_cell.value = 'MADE IN CHINA';
	const china_model = Object.assign({}, china_cell.model);

	const line_start_row = 13;
	const total_row_index = 14;
	const rows = [];

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

	const line_row = sheet.getRow(line_start_row);
	const line_row_styles = saveStyles(line_row);

	const total_row = sheet.getRow(total_row_index);
	const total_row_styles = saveStyles(total_row);

	order.line_items.map((item, i) => {
		const row_data = [
			item.sku,
			item.name,
			item.quantity,
			item.price,
			item.quantity * parseFloat(item.price),
			""
		];
		rows.push(row_data);
	});
	sheet.spliceRows(line_start_row, 1, ...rows);

	order.line_items.map((item, i) => {
		const r = sheet.getRow(line_start_row + i);
		restoreStyles(r, line_row_styles);
	});

	const new_total_row = sheet.getRow(total_row_index + order.line_items.length - 1);
	restoreStyles(new_total_row, total_row_styles);

	const dollor_row_index = line_start_row + order.line_items.length + 1;
	const china_row_index = dollor_row_index + 1;

	// sheet.mergeCells(`A${dollor_row_index}:F${dollor_row_index}`);
	// sheet.spliceRows(dollor_row_index, 0, [dollor_model.value]);

	// sheet.mergeCells(`A${china_row_index}:B${china_row_index}`);
	// sheet.spliceRows(china_row_index, 0, [china_model.value]);

	await workbook.xlsx.writeFile(path.join(resourcesPath, order.name + '.xlsx'));
}