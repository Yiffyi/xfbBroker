import { xfb } from '@api/xfb'
export default async (request: Request, env: Env): Promise<Response> => {
    const { searchParams } = new URL(request.url);

    const ymUserId = searchParams.get("ymUserId"), ymToken = searchParams.get("ymToken"), openId = searchParams.get("thirdOpenid");
    if (!ymUserId || !ymToken || !openId) {
        return new Response("缺少必要的查询参数", { status: 400 });
    }

    let r = await xfb.getUserById(ymToken, ymUserId)
    return Response.json(r)
}