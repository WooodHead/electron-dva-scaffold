// tslint:disable-next-line:no-unused-variable
import * as React from 'react';
import { Menu, Icon } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import { Link } from 'react-router-dom';
import { Location } from 'history';
import { Menu as MenuInterface } from 'interfaces';
import { arrayToTree, queryArray } from 'utils';
import pathToRegexp from 'path-to-regexp';

export interface MenusProps {
    menus: MenuInterface[];
    siderFold: boolean;
    darkTheme?: boolean;
    location: Location;
    navOpenKeys: string[];
    handleClickNavMenu?: (param: ClickParam) => void;
    changeOpenKeys?: (openKeys: string[]) => void;
}

export interface MenuWithChildren extends MenuInterface {
    children?: MenuWithChildren[];
}

export default ({ siderFold, darkTheme, handleClickNavMenu, navOpenKeys, changeOpenKeys, menus, location }: MenusProps) => {
    // 生成树状
    const menuTree: MenuWithChildren[] = arrayToTree(menus.filter(_ => _.mpid !== '-1'), 'id', 'mpid');
    const levelMap = {};

    // 递归生成菜单
    const getMenus = (menuTreeN: MenuWithChildren[], siderFoldN: boolean) => {
        return menuTreeN.map((item) => {
            if (item.children) {
                if (item.mpid) {
                    levelMap[item.id] = item.mpid;
                }
                return (
                    <Menu.SubMenu
                        key={item.id}
                        title={<span>
                            {item.icon && <Icon type={item.icon} />}
                            {(!siderFoldN || !menuTree.includes(item)) && item.name}
                        </span>}
                    >
                        {getMenus(item.children, siderFoldN)}
                    </Menu.SubMenu>
                );
            }
            return (
                <Menu.Item key={item.id}>
                    <Link to={item.route || '#'}>
                        {item.icon && <Icon type={item.icon} />}
                        {(!siderFoldN || !menuTree.includes(item)) && item.name}
                    </Link>
                </Menu.Item>
            );
        });
    };
    const menuItems = getMenus(menuTree, siderFold);

    // 保持选中
    const getAncestorKeys = (key) => {
        let map = {};
        const getParent = (index) => {
            const result = [String(levelMap[index])];
            if (levelMap[result[0]]) {
                result.unshift(getParent(result[0])[0]);
            }
            return result;
        };
        for (let index in levelMap) {
            if ({}.hasOwnProperty.call(levelMap, index)) {
                map[index] = getParent(index);
            }
        }
        return map[key] || [];
    };

    const onOpenChange = (openKeys) => {
        const latestOpenKey = openKeys.find(key => !navOpenKeys.includes(key));
        const latestCloseKey = navOpenKeys.find(key => !openKeys.includes(key));
        let nextOpenKeys = [];
        if (latestOpenKey) {
            nextOpenKeys = getAncestorKeys(latestOpenKey).concat(latestOpenKey);
        }
        if (latestCloseKey) {
            nextOpenKeys = getAncestorKeys(latestCloseKey);
        }
        changeOpenKeys(nextOpenKeys);
    };

    let menuProps = !siderFold ? {
        onOpenChange,
        openKeys: navOpenKeys,
    } : {};


    // 寻找选中路由
    let currentMenu;
    let defaultSelectedKeys;
    for (let item of menus) {
        if (item.route && pathToRegexp(item.route).exec(location.pathname)) {
            currentMenu = item;
            break;
        }
    }
    const getPathArray = (array, current, pid, id) => {
        let result = [String(current[id])];
        const getPath = (item) => {
            if (item && item[pid]) {
                result.unshift(String(item[pid]));
                getPath(queryArray(array, item[pid], id));
            }
        };
        getPath(current);
        return result;
    };
    if (currentMenu) {
        defaultSelectedKeys = getPathArray(menus, currentMenu, 'mpid', 'id');
    }

    if (!defaultSelectedKeys) {
        defaultSelectedKeys = ['1'];
    }

    return (
        <Menu
            {...menuProps}
            mode={siderFold ? 'vertical' : 'inline'}
            theme={darkTheme ? 'dark' : 'light'}
            onClick={handleClickNavMenu}
            selectedKeys={defaultSelectedKeys}
        >
            {menuItems}
        </Menu>
    );
};