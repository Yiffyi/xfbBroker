export function redirectToUrlWithParams(url: string, params: any, code: number = 302): Response {
    let u = new URL(url)
    u.search = (new URLSearchParams(params)).toString()
    return Response.redirect(u.toString(), code)
}

export function requestParams(request: Request) {
    return (new URL(request.url)).searchParams
}

export async function saveUser(env: Env, u: User, options?: KVNamespacePutOptions) {
    await env.BROKER.put("USER:" + u.ymUserId, JSON.stringify(u), options)
}

export async function loadUser(env: Env, ymUserId: string): Promise<User> {
    return JSON.parse(await env.BROKER.get("USER:" + ymUserId))
}