import * as React from 'react';
import { connect } from 'dva';
import { Button, Row, Form, Input } from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';
import { DvaRouteComponentProps } from 'interfaces';
import { ReduxState } from 'interfaces/state';
import * as styles from './index.less';
import * as config from 'constants/config';

const FormItem = Form.Item;

interface LoginProps extends FormComponentProps {
}

interface StateProps {
    loading: boolean;
}

type Props = LoginProps & StateProps & DvaRouteComponentProps;

class Login extends React.PureComponent<Props, any> {

    private onSubmit(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((errors, values) => {
            if (errors) {
                return;
            }
            this.props.dispatch({ type: 'login/login', payload: values });
        });
    }

    public render() {
        const { form, loading } = this.props;
        const { getFieldDecorator } = form;

        return (
            <div className={styles.form}>
                <div className={styles.logo}>
                    <img alt='logo' src={config.logo} />
                    <span>通晓管理后台</span>
                </div>
                <Form onSubmit={this.onSubmit.bind(this)}>
                    <FormItem hasFeedback>
                        {getFieldDecorator('username', {
                            rules: [
                                {
                                    required: true,
                                },
                            ],
                        })(<Input size='large' placeholder='用户名' />)}
                    </FormItem>
                    <FormItem hasFeedback>
                        {getFieldDecorator('password', {
                            rules: [
                                {
                                    required: true,
                                },
                            ],
                        })(<Input size='large' type='password' placeholder='密码' />)}
                    </FormItem>
                    <Row>
                        <Button type='primary' size='large' htmlType='submit' loading={loading}>
                            登录
                        </Button>
                    </Row>
                </Form>
            </div>
        );
    }
}

function mapStateToProps(state: ReduxState, ownProps: LoginProps): StateProps {
    return {
        loading: state.loading.effects['login/login']
    };
}

const form = Form.create()(Login);
export default connect(mapStateToProps)(form as any);
