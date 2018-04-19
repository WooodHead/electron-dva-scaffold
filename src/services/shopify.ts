import * as request from './request';
import { ShopifyOrder, ShopifyOrderAddress } from 'interfaces/shopify';
import { Workbook, Row } from 'exceljs';
import * as path from 'path';
import moment from 'moment';
import number2english from 'number2english';
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
		const line_price = item.quantity * parseFloat(item.price);
		const row_data = [
			item.sku,
			item.name,
			item.quantity,
			item.price,
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