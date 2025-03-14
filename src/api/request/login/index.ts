import http from "@/api/request";

/**
 * @name 登录模块
 */

// * 获取按钮权限
export const getAuthorButtons = () => {
    return http.get<Login.ResAuthButtons>(`/auth/buttons`);
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

const NOOP = () => { };

/**
* 创建一个可取消的异步任务
* @param {Function} asyncTask - 要包装的异步任务函数
* @returns {Function} - 返回一个新的函数，该函数执行时会返回一个可取消的 Promise
*/
function createCancelTask(asyncTask: any) {
    // 初始化取消函数，默认为空函数
    let cancel = NOOP;
    return (...args: any[]) => {
        return new Promise((resolve, reject) => {
            // 执行上一次的取消函数，取消之前的任务
            cancel();
            // 重新定义取消函数，当调用取消函数时，将 resolve 和 reject 置为空函数
            cancel = () => {
                resolve = reject = NOOP;
            }
            // 执行传入的异步任务，并处理结果
            asyncTask(...args).then(
                // 任务成功时，调用 resolve 返回结果
                (res: any) => resolve(res),
                // 任务失败时，调用 reject 返回错误
                (err: any) => reject(err)
            )
        })
    }
}


export const getAuthorButtons2 = () => {
    return http.get<Login.ResAuthButtons>(`/auth/buttons`);
};

// const requestFun = createCancelTask((...args: any) => {
//     return 
// });