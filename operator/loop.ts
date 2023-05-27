import { User, xfb } from "./deps.ts";
import users from "./accounts.json" assert { type: "json" };
// const transDone: { [id: string]: string; } = {}
// console.log(CF_LISTKEYS_URL)
async function checkAndPay() {

    // .then(j => Promise.all(j.map(v => v.json())))
    // .then(j => console.log(j))
    // console.log(r)
    // const trans_cache = await fetch("https://xfb.lklk.org/_/grabTrans").then( r => r.json())
    // const new_trans = []

    await Promise.all(
        users.filter(v => v.enabled)
            .map(async (v) => {
                const delta = v.threshold - parseFloat(await xfb.getCardMoney(v.sessionId, v.ymUserId))
                // console.log(delta.toFixed(2))
                if (delta > 1 && delta <= 100) {
                    const tranNo = await xfb.rechargeOnCard(delta.toFixed(2), v.openId, v.sessionId, v.ymUserId)
                    await xfb.payChoose(tranNo)
                    await xfb.doPay(tranNo)

                    console.log(v.name, '+', delta)
                } else console.error('Delta', delta, 'too big')
            })
    )
    // for (const v of r) {

    // xfb.cardQuerynoPage(new Date(), v.sessionId, v.ymUserId).then((trans) => {
    //     trans.forEach(async (t: { money: string; serialno: string; }) => {
    //         if (parseFloat(t.money) < 0 && !(t.serialno in transDone)) {
    //             const tranNo = await xfb.rechargeOnCard(t.money.substring(1), v.openId, v.sessionId, v.ymUserId)
    //             await xfb.payChoose(tranNo)
    //             await xfb.doPay(tranNo)
    //             transDone[tranNo] = t.money.substring(1)
    //         }
    //     });
    // })
    // }
    // let trans = await this.cardQuerynoPage(new Date(), sessionId, ymUserId)
    // console.log(trans)
    // for (var t of trans) {
    //     if (parseFloat(t.money) < 0 && await env.BROKER.get("TRANS:" + t.serialno) === null) {
    //         let tran_no = await this.rechargeOnCard(t.money.substring(1), sessionId, ymUserId)
    //         await this.payChoose(tran_no)
    //         await this.doPay(tran_no)
    //         await env.BROKER.put("TRANS:" + t.serialno, t.money.substring(1), { expirationTtl: 2592000 })

    //         // console.log(parseFloat(i.money))
    //         // console.log(await env.TRANS.get("TRANS:" + i.serialno))
    //     }
    // }
}

await checkAndPay()
const timer = setInterval(checkAndPay, 60000);
Deno.refTimer(timer)
