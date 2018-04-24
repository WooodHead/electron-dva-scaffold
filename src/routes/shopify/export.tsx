// tslint:disable-next-line:no-unused-variable
import * as React from 'react';
import { connect } from 'dva';
import { Button, Table, message } from 'antd';
import { remote } from 'electron';
import moment from 'moment';
import { ReduxState } from 'interfaces/state';
import { DvaRouteComponentProps } from 'interfaces';
import { OrdersOptions } from 'services/shopify';
import { TableRowSelection, ColumnProps } from 'antd/lib/table';
import { ShopifyOrder, ShopifyCustomer } from 'interfaces/shopify';
import * as styles from './index.less';

const dialog = remote.dialog;

const columns: ColumnProps<ShopifyOrder>[] = [
	{
		title: '订单号',
		dataIndex: 'name',
	},
	{
		title: '日期',
		width: 120,
		dataIndex: 'updated_at',
		render: text => {
			return <span>{moment(text).fromNow()}</span>;
		},
	},
	{
		title: '客户',
		width: 150,
		className: 'customer',
		dataIndex: 'customer',
		render: (customer: ShopifyCustomer) => {
			return <span>{customer.first_name} {customer.last_name}</span>;
		},
	},
	{
		title: '支付状态',
		dataIndex: 'financial_status',
		render: (text: string) => {
			if (text === 'paid') {
				text = '已支付';
			}
			return <span>{text}</span>;
		},
	},
	{
		title: '发货状态',
		dataIndex: 'fulfillment_status',
		render: (text: string) => {
			if (!text) {
				text = '未发货';
			}
			if (text === 'fulfilled') {
				text = '已发货';
			}
			return <span>{text}</span>;
		},
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
	selectedRowKeys: string[];
}

class Export extends React.Component<Props, ExportState> {
	constructor(props) {
		super(props);
		this.state = {
			selectedRowKeys: []
		};
	}

	private refresh() {
		this.setState({ selectedRowKeys: [] });
		this.props.dispatch({
			type: 'shopify/query'
		});
	}

	private export() {
		const { dispatch } = this.props;
		const ids = this.state.selectedRowKeys;
		if (ids.length === 0) {
			message.error('请选择要导出发票的订单');
			return;
		}
		const orders = this.props.orders.filter(order => {
			return ids.includes(order.id.toString());
		});

		dialog.showOpenDialog(remote.getCurrentWindow(), {
			title: '选择导出文件夹',
			properties: ['openDirectory'],
			buttonLabel: '保存'
		}, paths => {
			if (paths.length < 1) {
				return;
			}
			const dir = paths[0];
			orders.map(order => {
				dispatch({
					type: 'shopify/export',
					payload: {
						order,
						dir
					}
				});
			});
		});
	}

	public render() {
		const { orders, loading } = this.props;
		const rowSelection: TableRowSelection<any> = {
			selectedRowKeys: this.state.selectedRowKeys,
			hideDefaultSelections: true,
			onChange: (selectedRowKeys) => {
				this.setState({ selectedRowKeys: selectedRowKeys as any });
			}
		};

		const rowKey = (order: ShopifyOrder, index) => {
			return order.id.toString();
		};

		return (
			<div>
				<Button loading={loading} onClick={this.refresh.bind(this)}>加载订单</Button>
				<Button onClick={this.export.bind(this)}>导出发票</Button>
				<Table
					className={styles.table}
					size='small'
					loading={loading}
					rowKey={rowKey}
					rowSelection={rowSelection}
					columns={columns}
					dataSource={orders}
				>
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