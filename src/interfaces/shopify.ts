export interface ShopifyOrderAddress {
	address1: string;
	address2: string;
	city: string;
	company: string;
	country: string;
	country_code: string;
	first_name: string;
	last_name: string;
	latitude: number;
	longitude: number;
	name: string;
	phone: string;
	province: string;
	province_code: string;
	zip: any;
}

export interface ShopifyOrderLineItem {
	fulfillable_quantity: number;
	fulfillment_service: string;
	fulfillment_status: string;
	gift_card: boolean;
	grams: number;
	id: number;
	name: string;
	origin_location: {
		address1: string;
		address2: string;
		city: string;
		country_code: string;
		id: number;
		name: string;
		province_code: string;
		zip: any;
	};
	price: string;
	product_exists: boolean;
	product_id: number;
	properties: string[];
	quantity: number;
	requires_shipping: boolean;
	sku: string;
	tax_lines: any[];
	taxable: boolean;
	title: string;
	total_discount: string;
	variant_id: number;
	variant_inventory_management: string;
	variant_title: string;
	vendor: string;
}

export interface ShopifyOrderShippingLine {
	carrier_identifier: string;
	code: string;
	delivery_category: string;
	discounted_price: string;
	id: number;
	phone: string;
	price: string;
	requested_fulfillment_service_id: number;
	source: string;
	tax_lines: any[];
	title: string;
}

export interface ShopifyClientDetails {
	accept_language: string;
	browser_height: number;
	browser_ip: string;
	browser_width: number;
	session_hash: string;
	user_agent: string;
}

export interface ShopifyCustomer {
	accepts_marketing: boolean;
	created_at: string;
	default_address: any;
	email: string;
	first_name: string;
	id: number;
	last_name: string;
	last_order_id: number;
	last_order_name: string;
	multipass_identifier: string;
	note: string;
	orders_count: number;
	phone: string;
	state: string;
	tags: string;
	tax_exempt: boolean;
	total_spent: string;
	updated_at: string;
	verified_email: boolean;
}

export interface ShopifyPaymentDetails {
	avs_result_code: string;
	credit_card_bin: string;
	credit_card_company: string;
	credit_card_number: string;
	cvv_result_code: string;
}

export interface ShopifyOrder {
	app_id: number;
	billing_address: ShopifyOrderAddress;
	browser_ip: string;
	buyer_accepts_marketing: boolean;
	cancel_reason: string;
	cancelled_at: string;
	cart_token: string;
	checkout_id: number;
	checkout_token: string;
	client_details: ShopifyClientDetails;
	closed_at: string;
	confirmed: boolean;
	contact_email: string;
	created_at: string;
	currency: string;
	customer: ShopifyCustomer;
	customer_locale: string;
	device_id: string;
	discount_codes: string[];
	email: string;
	financial_status: string;
	fulfillment_status: string;
	fulfillments: string[];
	gateway: string;
	id: number;
	landing_site: string;
	landing_site_ref: string;
	line_items: ShopifyOrderLineItem[];
	location_id: number;
	name: string;
	note: string;
	note_attributes: string[];
	number: number;
	order_number: number;
	order_status_url: string;
	payment_details: ShopifyPaymentDetails;
	payment_gateway_names: string[];
	phone: string;
	processed_at: string;
	processing_method: string;
	reference: string;
	referring_site: string;
	refunds: string[];
	shipping_address: ShopifyOrderAddress;
	shipping_lines: ShopifyOrderShippingLine[];
	source_identifier: string;
	source_name: string;
	source_url: string;
	subtotal_price: string;
	tags: string;
	tax_lines: string[];
	taxes_included: boolean;
	test: boolean;
	token: string;
	total_discounts: string;
	total_line_items_price: string;
	total_price: string;
	total_price_usd: string;
	total_tax: string;
	total_weight: number;
	updated_at: string;
	user_id: number;
}

export interface ExpressOrder {
	id: string;
	name: string;
	tracking_number: string;
	twice_number: string;
	date: string;
	route: string;
	destination: string;
	recipient: string;
	fulfillment?: any;
}

export interface ImportSettings {
	order_start_line: number;
	excel_mapping: {
		id: string;
		label: string;
		col: string;
	}[];
}

export interface ExportSettings {
	item_start_line: number;
	cell_mapping: {
		id: string;
		label: string;
		cell: string;
	}[];
}