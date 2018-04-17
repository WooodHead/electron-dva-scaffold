export interface UserInfo {
	id: string;
	birthday: number;
	tel: string;
	description: string;
	icon: string;
	nickname: string;
	permissions: {
		role: string;
		visit?: string[];
	};
}

export interface UserInfoWithUP extends UserInfo {
	username: string;
	password: string;
}

export interface Menu {
	id: string;
	mpid?: string;
	bpid?: string;
	icon: string;
	name: string;
	route: string;
}