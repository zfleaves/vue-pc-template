import http from "@/api/request";

/**
 * @name 登录模块
 */

// * 获取按钮权限
export const getAuthorButtons = (params: any) => {
    return http.get<Login.ResAuthButtons>(`/v4/web/fs/resource/auth`, params);
};

// * 用户登录接口
export const loginApi = (params: Login.ReqLoginForm) => {
	return http.post<Login.ResLogin>(`/login`, params);
};


// * 登录
export namespace Login {
	export interface ReqLoginForm {
		username: string;
		password: string;
	}
	export interface ResLogin {
		access_token: string;
	}
	export interface ResAuthButtons {
		[propName: string]: any;
	}
}