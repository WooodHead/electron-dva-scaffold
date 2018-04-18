// tslint:disable-next-line:no-unused-variable
import * as React from 'react';
import { connect } from 'dva';
import { Button, Table } from 'antd';
import { ReduxState } from 'interfaces/state';
import { DvaRouteComponentProps } from 'interfaces';
import { OrdersOptions } from 'services/shopify';
import { TableRowSelection } from 'antd/lib/table';
import { ShopifyOrder } from 'interfaces/shopify';

const columns = [
	{
		title: '订单号',
		dataIndex: 'name',
	},
	{
		title: '日期',
		dataIndex: 'updated_at',
	},
	{
		title: '客户',
		dataIndex: 'customer',
	},
	{
		title: '支付状态',
		dataIndex: 'financial_status',
	},
	{
		title: '发货状态',
		dataIndex: 'fulfillment_status',
	},
	{
		title: '总价',
		dataIndex: 'total_price',
	}
];

interface ExportProps {
}

interface StateProps {
	loading: boolean;
	orders: ShopifyOrder[];
}

type Props = ExportProps & StateProps & DvaRouteComponentProps;

interface ExportState {
	selectedRowKeys: number[];
}

class Export extends React.Component<Props, ExportState> {
	constructor(props) {
		super(props);
		this.state = {
			selectedRowKeys: []
		};
	}

	private refresh() {
		this.props.dispatch({
			type: 'shopify/query', payload: {
				status: 'any',
				fulfillment_status: 'any'
			} as OrdersOptions
		});
	}

	private export() {
		const { dispatch } = this.props;
		const keys = this.state.selectedRowKeys;
		const orders = keys.map(index => {
			return this.props.orders[index];
		});
		orders.map(order => {
			dispatch({ type: 'shopify/export', payload: order });
		});
	}

	public render() {
		const { orders, loading } = this.props;
		const rowSelection: TableRowSelection<any> = {
			selectedRowKeys: this.state.selectedRowKeys,
			hideDefaultSelections: true,
			selections: [
				{
					key: 'export-invoice',
					text: '导出发票',
					onSelect: () => {
						this.export();
					}
				}
			],
			onChange: (selectedRowKeys) => {
				this.setState({ selectedRowKeys: selectedRowKeys as any });
			}
		};

		return (
			<div>
				<Button loading={loading} onClick={this.refresh.bind(this)}>加载订单</Button>
				<Table rowSelection={rowSelection} columns={columns} size='small' dataSource={orders} >
				</Table>
			</div>
		);
	}
}

function mapStateToProps(state: ReduxState, ownProps: ExportProps): StateProps {
	return {
		loading: state.loading.effects['shopify/query'],
		orders: state.shopify.orders
	};
}

export default connect(mapStateToProps)(Export);