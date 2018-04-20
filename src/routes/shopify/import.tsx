import * as React from 'react';
import { ReduxState } from "interfaces/state";
import { connect } from "dva";
import { remote } from 'electron';
import { DvaRouteComponentProps } from 'interfaces';
import { Button, Table, message } from 'antd';
import { TableRowSelection, ColumnProps } from 'antd/lib/table';
import { ExpressOrder } from 'interfaces/shopify';
import * as styles from './index.less';

const dialog = remote.dialog;

interface ImportProps {
}

interface StateProps {
	orders: ExpressOrder[];
	delivery_loading: boolean;
}

type Props = ImportProps & StateProps & DvaRouteComponentProps;

interface ImportState {
	selectedRowKeys: string[];
}

const columns: ColumnProps<any>[] = [
	{
		title: '订单ID',
		dataIndex: 'id',
	},
	{
		title: '运单号',
		dataIndex: 'tracking_number',
	},
	{
		title: '二程单号',
		dataIndex: 'twice_number',
	},
	{
		title: '寄件日期',
		dataIndex: 'date',
	},
	{
		title: '路线',
		dataIndex: 'route',
	},
	{
		title: '目的地',
		dataIndex: 'destination',
	},
	{
		title: '收件人',
		className: 'recipient',
		dataIndex: 'recipient',
		width: 100
	},
	{
		title: '发货状态',
		dataIndex: 'fulfillment',
		render: (fulfillment) => {
			let text = '';
			if (!fulfillment) {
				text = '未同步';
			} else if (fulfillment.status === 'success') {
				text = '已发货';
			} else {
				text = fulfillment.status;
			}
			return <span>{text}</span>;
		}
	}
];

class Import extends React.Component<Props, ImportState> {

	constructor(props) {
		super(props);
		this.state = {
			selectedRowKeys: []
		};
	}

	private import() {
		const paths = dialog.showOpenDialog(remote.getCurrentWindow(), {
			title: '选择导入的出货单',
			filters: [{ name: '表格', extensions: ['xlsx'] }],
			properties: ['openFile']
		});
		if (!paths || paths.length < 1) {
			return;
		}
		const file = paths[0];
		this.props.dispatch({
			type: 'shopify/import',
			payload: file
		});
	}

	private delivery() {
		const ids = this.state.selectedRowKeys;
		if (ids.length === 0) {
			message.error('请选择要同步发货状态的订单');
			return;
		}
		const orders = this.props.orders.filter(order => {
			return ids.includes(order.id.toString());
		});
		orders.map(order => {
			this.props.dispatch({
				type: 'shopify/delivery',
				payload: order
			});
		});
	}

	public render() {
		const { orders, delivery_loading } = this.props;
		const rowSelection: TableRowSelection<any> = {
			selectedRowKeys: this.state.selectedRowKeys,
			hideDefaultSelections: true,
			onChange: (selectedRowKeys) => {
				this.setState({ selectedRowKeys: selectedRowKeys as any });
			}
		};

		const rowKey = (order: ExpressOrder, index) => {
			return order.id.toString();
		};

		console.log(styles.table);

		return (
			<div>
				<Button onClick={this.import.bind(this)}>导入出货单</Button>
				<Button loading={delivery_loading} onClick={this.delivery.bind(this)}>同步发货状态</Button>
				<Table
					className={styles.table}
					size='small'
					loading={delivery_loading}
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

function mapStateToProps(state: ReduxState, ownProps: ImportProps): StateProps {
	return {
		orders: state.shopify.express_orders,
		delivery_loading: state.loading.effects['shopify/delivery']
	};
}

export default connect(mapStateToProps)(Import);