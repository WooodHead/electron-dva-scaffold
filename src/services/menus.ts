const database = [
    // {
    //     id: '1',
    //     icon: 'laptop',
    //     name: '主面板',
    //     route: '/home',
    // },
    {
        id: '2',
        bpid: '1',
        name: '导出发票',
        icon: 'user',
        route: '/export',
    },
    {
        id: '3',
        bpid: '1',
        name: '导入运单',
        icon: 'shopping-cart',
        route: '/import',
    },
    {
        id: '4',
        bpid: '1',
        name: '设置',
        icon: 'setting'
    },
    {
        id: '41',
        bpid: '4',
        mpid: '4',
        name: '导出设置',
        icon: 'setting',
        route: '/settings/export',
    },
    {
        id: '42',
        bpid: '4',
        mpid: '4',
        name: '导入设置',
        icon: 'setting',
        route: '/settings/import',
    },
];

export async function queryMenus() {
    // const result = await request.get(`${apiPrefix}/menus`);
    // if (result.item) {
    //     return result.item as Menu[];
    // } else {
    //     throw new Error(`获取目录失败`);
	// }
	return database;
}