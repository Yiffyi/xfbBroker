import xfb from './xfb'
import { applySignPay } from './signPay'
import { loadUser, redirectToUrlWithParams, saveUser } from './utils';
export default async (request: Request, env: Env): Promise<Response> => {
    const { searchParams } = new URL(request.url);

    const ymUserId = searchParams.get("ymUserId"), ymToken = searchParams.get("ymToken"), openId = searchParams.get("thirdOpenid");
    if (!ymUserId || !ymToken || !openId) {
        return new Response("缺少必要的查询参数", { status: 400 });
    }

    let u = await loadUser(env, ymUserId)
    if (!u) {
        try {
            let r = await xfb.getUserById(ymToken, ymUserId)
            u = {
                name: r.data.userName,
                openId,
                sessionId: r.sessionId,
                ymUserId,
                consent: false,
                threshold: 0,
                enabled: false,
                signPay: false,
                applyId: null
            }
            await saveUser(env, u, { expirationTtl: 600 })
        } catch (error) {
            return new Response(error.stack, { status: 500 })
        }
    }

    if (u.consent && u.signPay) {
        return redirectToUrlWithParams("https://xfb.lklk.org/settings.html", { ymUserId })
    }

    if (!u.consent) {
        return redirectToUrlWithParams("https://xfb.lklk.org/consent.html", { ymUserId, name: u.name });
    }

    if (!u.signPay) {
        let t = await applySignPay(u)
        u.applyId = t.applyId
        if(t.signPay) {
            u.signPay = true
            await saveUser(env, u)
            return redirectToUrlWithParams("https://xfb.lklk.org/settings.html", { ymUserId })
        } else {
            await saveUser(env, u)
            return redirectToUrlWithParams("https://xfb.lklk.org/signPay.html", t)
        }
    }
}