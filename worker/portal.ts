import settings from './settings';
import index from './index'
import consent from './consent';
import log from './log';
import { querySignApply } from './signPay';

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const { pathname } = new URL(request.url);
		if (pathname.startsWith("/_/login")) {
			return Response.redirect("https://auth.xiaofubao.com/auth/user/third/getCode?callBackUrl=https%3A%2F%2Fxiaofubao.com%40xfb.lklk.org%2F_%2Findex%3Fplatform%3DWECHAT_H5%26schoolCode%3D20090820%26thirdAppid%3Dwx8fddf03d92fd6fa9", 302)
		}

		if (pathname.startsWith("/_/log")) return log(request, env)

		if (pathname.startsWith("/_/index")) return index(request, env)

		if (pathname.startsWith("/_/settings")) return settings(request, env)

		if (pathname.startsWith("/_/consent")) return consent(request, env)

		if (pathname.startsWith("/_/querySignApply")) return querySignApply(request, env)
	},
};