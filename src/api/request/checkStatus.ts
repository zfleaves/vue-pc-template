/**
 * @description: 校验网络请求状态码
 * @param {Number} status
 * @return void
 */
export const checkStatus = (status: number): string => {
    let errorMessage = '';
	switch (status) {
		case 400:
			errorMessage = "请求失败！请您稍后重试";
			break;
		case 401:
			errorMessage = "登录失效！请您重新登录";
			break;
		case 403:
			errorMessage = "当前账号无权限访问！";
			break;
		case 404:
			errorMessage = "你所访问的资源不存在！";
			break;
		case 405:
			errorMessage = "请求方式错误！请您稍后重试";
			break;
		case 408:
			errorMessage = "请求超时！请您稍后重试";
			break;
		case 500:
			errorMessage = "服务异常！";
			break;
		case 502:
			errorMessage = "网关错误！";
			break;
		case 503:
			errorMessage = "服务不可用！";
			break;
		case 504:
			errorMessage = "网关超时！";
			break;
		default:
			errorMessage = "请求失败！";
	}
    return errorMessage;
};
