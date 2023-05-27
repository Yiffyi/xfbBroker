const xfbApp = "https://webapp.xiaofubao.com"
const xfbPay = "https://pay.xiaofubao.com"

export const xfb = {
    async xfbPostJson(url: string, sessionId: string, payload: any) {
        let h = new Headers();
        h.append('Content-Type', 'application/json;charset=UTF-8');
        if (sessionId) h.append('Cookie', 'shiroJID=' + sessionId)
        return fetch(url, {
            body: JSON.stringify(payload),
            method: "post",
            headers: h
        }).then(async (resp) => {
            let j = await resp.json()
            // console.log(...resp.headers)
            // for pay: {"ret_code":"1002","ret_msg":"网络异常，请稍候再试","statusCode":1002,"message":"网络异常，请稍候再试"}
            // have both ret_code & statusCode
            if (j["statusCode"] != 0) {
                console.log(j)
                throw new Error('API bad statusCode: ' + JSON.stringify(j))
            }
            else return j
        });
    },

    async getCardMoney(sessionId: string, ymId: string): Promise<string> {
        return this.xfbPostJson(xfbApp + "/card/getCardMoney", sessionId, {
            ymId
        }).then((j) => j.data)
    },

    async cardQuerynoPage(date, sessionId, ymId) {
        // Not good, but works
        let d = new Date(
            new Date().toLocaleString('en-US', { timeZone: "Asia/Shanghai" })
        );
        let pad = (s: number) => { return ("0" + s).substr(-2) }
        let queryTime = d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate())

        return this.xfbPostJson(xfbApp + "/routeauth/auth/route/user/cardQuerynoPage", sessionId, {
            queryTime,
            ymId
        }).then((j) => j.rows)
    },

    async rechargeOnCard(money, openId, sessionId, ymId): Promise<string> {
        return this.xfbPostJson(xfbApp + "/order/rechargeOnCardByParam", sessionId, {
            openid: openId,
            totalMoney: money,
            orderRealMoney: money,
            rechargeType: 1,
            subappid: "wx8fddf03d92fd6fa9",
            schoolCode: "20090820",
            platform: "WECHAT_H5",
            sessionId,
            ymId
        }).then((j) => {
            let u = new URL(j.data)
            return u.searchParams.get("tran_no")
        })
    },

    async signPayCheck(tranNo) {
        return this.xfbPostJson(xfbPay + "/pay/sign/signPayCheck", null, {
            tranNo,
            payType: "WXPAY"
        }).then((j) => {
            return j.message
        })
    },

    async getSignUrl(tranNo) {
        return this.xfbPostJson(xfbPay + "/h5/pay/sign/getSignUrl", null, {
            tranNo,
            payType: "WXPAY"
        }).then(j => {
            return j.data
        })
    },

    async querySignApplyById(applyId) {
        return this.xfbPostJson(xfbPay + "/h5/pay/sign/querySignApplyById", null, {
            applyId
        }).then(j => {
            return j.data
        })
    },

    async payChoose(tranNo) {
        return this.xfbPostJson(xfbPay + "/pay/unified/choose.shtml", null, {
            tranNo,
            payType: "WXPAY",
            bussiCode: "WXSIGN"
        })
    },

    async doPay(tranNo) {
        return this.xfbPostJson(xfbPay + "/pay/doPay", null, {
            tranNo
        })
    },

    /* CONFIG: {
      accounts: [
        {
          ymToken: "abcdefg==",
          ymUserId: "1234567890",
          sessionId: "abcd-asdefg-12312412",
          failed: 0
        }
      ]
    }*/

    async getUserById(ymToken, ymUserId) {
        return await fetch(xfbApp + "/user/getUserById", {
            body: JSON.stringify({
                token: ymToken,
                ymId: ymUserId,
                platform: "WECHAT_H5"
            }),
            method: "post",
        }).then(async (resp) => {
            let j = await resp.json()
            console.log(...resp.headers)
            // for pay: {"ret_code":"1002","ret_msg":"网络异常，请稍候再试","statusCode":1002,"message":"网络异常，请稍候再试"}
            // have both ret_code & statusCode

            if (j["statusCode"] != 0) {
                console.log(j)
                throw new Error('API bad statusCode: ' + JSON.stringify(j))
            }

            let cookie = resp.headers.get("set-cookie")
            if (!cookie) throw new Error('API no cookie returned: ' + JSON.stringify(j))
            const regex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;
            const sessionId = cookie.match(regex)?.[0];

            if (!sessionId) throw new Error('No sessionId found in cookie: ' + cookie)
            return {
                data: j["data"],
                sessionId
            }
        });
    },

    // async payAll(env) {
    //     const CONFIG = JSON.parse(await env.BROKER.get("CONFIG"))
    //     var changed = false;
    //     for (var i in CONFIG.accounts) {
    //         try {
    //             const a = CONFIG.accounts[i]
    //             await this.checkAndPay(env, a.sessionId, a.ymUserId)
    //         }
    //         catch (e) {
    //             CONFIG.accounts[i].failed++
    //             changed = true
    //         }
    //     }
    //     if (changed) await env.BROKER.put("CONFIG", JSON.stringify(CONFIG))
    // },

    // async garbageCollection(env) {
    //     const CONFIG = JSON.parse(await env.BROKER.get("CONFIG"))
    //     let changed = false;
    //     let a = []
    //     for (var v of CONFIG.accounts) {
    //         if (v.failed >= 5) {
    //             changed = true;
    //         } else {
    //             a.push(v)
    //         }
    //     }

    //     if (changed) {
    //         CONFIG.accounts = a;
    //         await env.BROKER.put("CONFIG", JSON.stringify(CONFIG))
    //     }
    // },

    //   async fetch(request, env) {
    //     try {
    //       const { pathname } = new URL(request.url);

    //       if (pathname.startsWith("/status")) {
    //         const httpStatusCode = Number(pathname.split("/")[2]);

    //         return Number.isInteger(httpStatusCode)
    //           ? fetch("https://http.cat/" + httpStatusCode)
    //           : new Response("That's not a valid HTTP status code.");
    //       }

    //       if (pathname.startsWith("/add")) {
    //         let params = new URL(request.url).searchParams;
    //         console.log(params.get("ymToken"), params.get("ymUserId"))
    //         let r = await this.addNewAccount(env, params.get("ymToken"), params.get("ymUserId"))
    //         console.log(r)
    //         return new Response(JSON.stringify(r))
    //       }

    //       if (pathname.startsWith("/get")) {
    //         return new Response(await env.BROKER.get("CONFIG"))
    //       }

    //       if (pathname.startsWith("/checkAndPay")) {
    //         await this.payAll(env)
    //       }

    //       if (pathname.startsWith("/gc")) {
    //         await this.garbageCollection(env)
    //       }
    //       return fetch("https://welcome.developers.workers.dev");
    //     } catch (err) {
    //       return new Response(err.stack, { status: 500 })
    //     }
    //   }
}