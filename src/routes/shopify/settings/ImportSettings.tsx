// tslint:disable-next-line:no-unused-variable
import * as React from 'react';
import { connect } from 'dva';
import { Form, InputNumber, Input, Row, Col } from 'antd';
import { ReduxState } from 'interfaces/state';
import { ImportSettings as Settings } from 'interfaces/shopify';
import { DvaRouteComponentProps } from 'interfaces';
import { FormComponentProps } from 'antd/lib/form';
import { defaultsDeep } from 'lodash';

const FormItem = Form.Item;

interface ImportSettingsProps extends FormComponentProps {
	onValuesChange: (props, values) => void;
}

interface StateProps {
	settings: Settings;
}

type Props = ImportSettingsProps & StateProps & DvaRouteComponentProps;

interface ImportSettingsState {
}

class ImportSettings extends React.Component<Props, ImportSettingsState> {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	private renderExcelSetting(index: number, data: { id: string, col: string, label: string }) {
		const { getFieldDecorator } = this.props.form;
		const field = `excel_mapping[${index}].col`;
		const fieldDecorator = getFieldDecorator(field, {
			initialValue: data.col,
			rules: [{ required: true }]
		})(
			<Input maxLength={2} />
		);
		return (
			<Col span={6}>
				<FormItem
					key={data.id}
					label={data.label}
					labelCol={{ span: 12 }}
					wrapperCol={{ span: 8 }}
				>
					{fieldDecorator}
				</FormItem>
			</Col>
		);
	}

	public render() {
		const { settings, form } = this.props;
		const { getFieldDecorator } = form;
		return (
			<Form
			>
				<FormItem
					label='订单项开始行号'
					labelCol={{ span: 5 }}
					wrapperCol={{ span: 5 }}
				>
					{getFieldDecorator('order_start_line', {
						initialValue: settings.order_start_line,
						rules: [{ required: true, message: '请输入订单项开始行号' }]
					})(
						<InputNumber min={1} max={100} />
					)}
				</FormItem>
				<FormItem
					label='出货单表格列匹配'
					labelCol={{ span: 5 }}
				>
				</FormItem>
				<Row>
					{
						settings.excel_mapping.map((data, index) => {
							return this.renderExcelSetting(index, data);
						})
					}
				</Row>
			</Form>
		);
	}
}

function mapStateToProps(state: ReduxState, ownProps: ImportSettingsProps): StateProps {
	return {
		settings: state.shopify.import_settings
	};
}

const from = Form.create<Props>({
	onValuesChange: (props, values, allValues) => {
		props.dispatch({
			type: 'shopify/changeImportSettings',
			payload: defaultsDeep({}, allValues, props.settings)
		});
	},
	mapPropsToFields: (props) => {
		const fileds = {};
		fileds['order_start_line'] = Form.createFormField({
			value: props.settings.order_start_line
		});
		fileds['excel_mapping'] = Form.createFormField({
			value: props.settings.excel_mapping
		});
		return fileds;
	}
})(ImportSettings);

export default connect(mapStateToProps)(from as any);