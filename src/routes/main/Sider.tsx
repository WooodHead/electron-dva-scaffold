// tslint:disable-next-line:no-unused-variable
import * as React from 'react';
import { Icon, Switch } from 'antd';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import Menus from './Menus';
import { ReduxState } from 'interfaces/state';
import { DvaRouteComponentProps } from 'interfaces';
import * as config from 'constants/config';
import * as styles from './index.less';
import { Menu } from 'interfaces';

interface SiderProps {
}

interface StateProps {
    siderFold: boolean;
    menus: Menu[];
    darkTheme: boolean;
    navOpenKeys: string[];
}

type Props = SiderProps & StateProps & DvaRouteComponentProps;

const Sider = (props: Props) => {
    const { siderFold, darkTheme, dispatch } = props;
    function changeTheme() {
        dispatch({ type: 'app/switchTheme' });
    }

    function changeOpenKeys(openKeys: string[]) {
        dispatch({ type: 'app/changeNavOpenKeys', payload: openKeys });
    }

    return (
        <div>
            <div className={styles.logo}>
                <img alt={'logo'} src={config.logo} />
                {siderFold ? '' : <span>{config.name}</span>}
            </div>
            {<Menus {...props} changeOpenKeys={changeOpenKeys} />}
            {!siderFold ? <div className={styles.switchtheme}>
                <span><Icon type="bulb" />Switch Theme</span>
                <Switch onChange={changeTheme} defaultChecked={darkTheme} checkedChildren="Dark" unCheckedChildren="Light" />
            </div> : ''}
        </div>
    );
};

function mapStateToProps(state: ReduxState, ownProps: SiderProps): StateProps {
    const { siderFold, menus, darkTheme, navOpenKeys } = state.app;
    return {
        siderFold,
        menus,
        darkTheme,
        navOpenKeys
    };
}

export default withRouter(connect(mapStateToProps)(Sider)) as any as React.StatelessComponent<SiderProps>;