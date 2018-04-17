// tslint:disable-next-line:no-unused-variable
import * as React from 'react';
import classNames from 'classnames';
import { Menu, Icon, Popover } from 'antd';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { ReduxState } from 'interfaces/state';
import { DvaRouteComponentProps, UserInfo, Menu as MenuInterface } from 'interfaces';
import * as styles from './Header.less';
import Menus from './Menus';

const SubMenu = Menu.SubMenu;

interface HeaderProps {
}

interface StateProps {
    user: UserInfo;
    siderFold: boolean;
    menus: MenuInterface[];
    isNavbar: boolean;
    navOpenKeys: string[];
    menuPopoverVisible: boolean;
}

type Props = HeaderProps & StateProps & DvaRouteComponentProps;

const Header = (props: Props) => {
    const { user, siderFold, isNavbar, menuPopoverVisible, dispatch } = props;
    function handleClickMenu(e) {
        if (e.key === 'logout') {
            dispatch({ type: 'app/logout' });
        }
    }
    function switchSider() {
        dispatch({ type: 'app/switchSider' });
    }
    function switchMenuPopover() {
        dispatch({ type: 'app/switchMenuPopver' });
    }
    function changeOpenKeys(openKeys: string[]) {
        dispatch({ type: 'app/changeNavOpenKeys', payload: openKeys });
    }

    return (
        <div className={styles.header}>
            {isNavbar
                ? <Popover
                    placement="bottomLeft"
                    onVisibleChange={switchMenuPopover}
                    visible={menuPopoverVisible}
                    overlayClassName={styles.popovermenu}
                    trigger="click"
                    content={<Menus {...props} handleClickNavMenu={switchMenuPopover} changeOpenKeys={changeOpenKeys} />}
                >
                    <div className={styles.button}>
                        <Icon type="bars" />
                    </div>
                </Popover>
                : <div
                    className={styles.button}
                    onClick={switchSider}
                >
                    <Icon type={classNames({ 'menu-unfold': siderFold, 'menu-fold': !siderFold })} />
                </div>}
            <div className={styles.rightWarpper}>
                <div className={styles.button}>
                    <Icon type="mail" />
                </div>
                <Menu mode="horizontal" onClick={handleClickMenu}>
                    <SubMenu
                        style={{
                            float: 'right',
                        }}
                        title={<span>
                            <Icon type="user" />
                            {user.nickname}
                        </span>}
                    >
                        <Menu.Item key="logout">
                            Sign out
                        </Menu.Item>
                    </SubMenu>
                </Menu>
            </div>
        </div>
    );
};

function mapStateToProps(state: ReduxState, ownProps: HeaderProps): StateProps {
    const { user, siderFold, menus, isNavbar, navOpenKeys, menuPopoverVisible } = state.app;
    return {
        user,
        siderFold,
        menus,
        isNavbar,
        navOpenKeys,
        menuPopoverVisible
    };
}

export default withRouter(connect(mapStateToProps)(Header)) as any as React.StatelessComponent<HeaderProps>;