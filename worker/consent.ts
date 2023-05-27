import { applyAndRedirect, applySignPay } from './signPay'
import { loadUser } from './utils'
import xfb from './xfb'
export default async (request: Request, env: Env): Promise<Response> => {
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 })
    }

    const formData = await request.formData()
    let u = await loadUser(env, formData.get("ymUserId"))
    if (!u) return new Response('User Not Found', { status: 404 })

    u.consent = true

    if (!u.signPay) return applyAndRedirect(u, env)
}