const database = [
    {
        id: '1',
        icon: 'laptop',
        name: '主面板',
        route: '/home',
    },
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