import { loadUser, requestParams, saveUser } from "./utils"

export default async (request: Request, env: Env): Promise<Response> => {
    if (request.method == 'POST') {
        try {
            // 读取请求 body 中的数据
            const formData = await request.formData()

            let u = await loadUser(env, formData.get("ymUserId"))
            if (!u) {
                return new Response('User not found', { status: 404 })
            }

            u.threshold = Number(formData.get("threshold"))
            if (u.threshold > 50 || u.threshold < 0) return new Response('Bad threshold - too big or too small', { status: 400 })
            u.enabled = Boolean(formData.get("enabled"))

            await saveUser(env, u)
            // 返回成功响应
            return new Response('Settings saved successfully', { status: 200 })
        } catch (error) {
            // 返回错误响应
            return new Response('Internal Server Error', { status: 500 })
        }
    } else if (request.method == 'GET') {
        let u = await loadUser(env, requestParams(request).get("ymUserId"))
        return Response.json(u)
    } else return new Response('Method Not Allowed', { status: 405 })
}