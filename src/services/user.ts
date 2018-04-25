import { UserInfoWithUP } from 'interfaces/user';
import { EnumRole } from 'constants/enum';

const userPermission = {
	DEFAULT: {
		visit: ['1', '2', '21', '7', '5', '51', '52', '53'],
		role: EnumRole.DEFAULT,
	},
	ADMIN: {
		role: EnumRole.ADMIN,
	},
	DEVELOPER: {
		role: EnumRole.DEVELOPER,
	},
};

const adminUsers: UserInfoWithUP[] = [
	{
		id: '0',
		username: 'admin',
		password: '1',
		permissions: userPermission.ADMIN,
		birthday: 0,
		description: '我是管理员',
		icon: '',
		nickname: '管理员',
		tel: '1688888888'
	}
];

export async function login(parms: { username: string, password: string }) {
	// const result = await request.post(`${apiPrefix}/user/login`, {
	//     body: parms
	// });
	// if (result.status !== 200) {
	//     throw new Error(result.message);
	// }
	const user = adminUsers.filter(item => item.username === parms.username);
	if (user.length > 0 && user[0].password === parms.password) {
		return void 0;
	} else {
		throw new Error('用户名与密码不匹配');
	}
}

export async function logout() {
	// const result = await request.get(`${apiPrefix}/user/logout`);
	// if (result.status !== 200) {
	//     throw new Error(result.message);
	// }
}

export async function query() {
	// const result = await request.get(`${apiPrefix}/user/account/userinfo`);
	// if (result.item) {
	//     return result.item as UserInfo;
	// } else {
	//     throw new Error(`获取用户信息失败`);
	// }
	const admin = adminUsers[0];
	return admin;
}