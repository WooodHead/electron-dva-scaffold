// tslint:disable-next-line:no-unused-variable
import * as React from 'react';
import { connect } from 'dva';
import { Form, InputNumber, Input, Row, Col } from 'antd';
import { ReduxState } from 'interfaces/state';
import { ExportSettings as Settings } from 'interfaces/shopify';
import { DvaRouteComponentProps } from 'interfaces';
import { FormComponentProps } from 'antd/lib/form';
import { defaultsDeep } from 'lodash';

const FormItem = Form.Item;

interface ExportSettingsProps extends FormComponentProps {
	onValuesChange: (props, values) => void;
}

interface StateProps {
	settings: Settings;
}

type Props = ExportSettingsProps & StateProps & DvaRouteComponentProps;

interface ExportSettingsState {
}

class ExportSettings extends React.Component<Props, ExportSettingsState> {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	private renderExcelSetting(index: number, data: { id: string, cell: string, label: string }) {
		const { getFieldDecorator } = this.props.form;
		const field = `cell_mapping[${index}].cell`;
		const fieldDecorator = getFieldDecorator(field, {
			initialValue: data.cell,
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
					label='商品列表开始行号'
					labelCol={{ span: 5 }}
					wrapperCol={{ span: 5 }}
				>
					{getFieldDecorator('item_start_line', {
						initialValue: settings.item_start_line,
						rules: [{ required: true, message: '请输入商品列表开始行号' }]
					})(
						<InputNumber min={1} max={100} />
					)}
				</FormItem>
				<FormItem
					label='发票表格单元格匹配'
					labelCol={{ span: 5 }}
				>
				</FormItem>
				<Row>
					{
						settings.cell_mapping.map((data, index) => {
							return this.renderExcelSetting(index, data);
						})
					}
				</Row>
			</Form>
		);
	}
}

function mapStateToProps(state: ReduxState, ownProps: ExportSettingsProps): StateProps {
	return {
		settings: state.shopify.export_settings
	};
}

const from = Form.create<Props>({
	onValuesChange: (props, values, allValues) => {
		props.dispatch({
			type: 'shopify/changeExportSettings',
			payload: defaultsDeep({}, allValues, props.settings)
		});
	},
	mapPropsToFields: (props) => {
		const fileds = {};
		fileds['item_start_line'] = Form.createFormField({
			value: props.settings.item_start_line
		});
		fileds['cell_mapping'] = Form.createFormField({
			value: props.settings.cell_mapping
		});
		return fileds;
	}
})(ExportSettings);

export default connect(mapStateToProps)(from as any);