import { loadUser, redirectToUrlWithParams, saveUser } from './utils';
import xfb from './xfb'

export async function applySignPay(u: User): Promise<{ signPay: boolean; applyId: string; jumpUrl: string }> {
    // check if signPay is enabled
    let tranNo = await xfb.rechargeOnCard(1, u.openId, u.sessionId, u.ymUserId)
    try {
        let signPayStatus = await xfb.signPayCheck(tranNo)
        if (signPayStatus == "操作成功") {
            return { signPay: true, applyId: null, jumpUrl: null }
        } else {
            console.log(signPayStatus)
            throw new Error(signPayStatus)
        }
    } catch (error) {
        let d = await xfb.getSignUrl(tranNo)
        if (d.jumpUrl) {
            return { signPay: false, applyId: d.applyId, jumpUrl: d.jumpUrl }
        } else throw new Error(d)
    }
}

export async function querySignApply(request: Request, env: Env): Promise<Response> {
    const { searchParams } = new URL(request.url)
    const applyId = searchParams.get("applyId")
    let r = await xfb.querySignApplyById(applyId)
    if (r.status == 3) {
        let u = await loadUser(env, r.userId)
        if (!u) return new Response("User Not Found", { status: 404 })

        u.signPay = true
        u.applyId = r.id
        await saveUser(env, u)
        return redirectToUrlWithParams("https://xfb.lklk.org/settings.html", { ymUserId: u.ymUserId })
    } else {
        // const url = new URL("https://xfb.lklk.org/signPay.html")
        // const params = new URLSearchParams()
        // params.set("applyId")
        return new Response("签约不成功")
    }
}

export async function applyAndRedirect(u: User, env: Env): Promise<Response> {
    let t = await applySignPay(u)
    u.applyId = t.applyId
    if(t.signPay) {
        u.signPay = true
        await saveUser(env, u)
        return redirectToUrlWithParams("https://xfb.lklk.org/settings.html", { ymUserId: u.ymUserId })
    } else {
        await saveUser(env, u)

        let outParams = new URLSearchParams()
        outParams.set("signUrl", t.jumpUrl)
        outParams.set("applyId", t.applyId)
        return redirectToUrlWithParams("https://xfb.lklk.org/signPay.html", t)
    }
}