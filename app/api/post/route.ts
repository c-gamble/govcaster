import { NextRequest, NextResponse } from "next/server";

async function getHeadline(post: string) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            messages: [{ role: 'system', content: 'You are given a POST made on a Web 3.0 governance forum. Your job is to first determine whether the post would attract the attention of viewers on Twitter based on what it talks about. If not, immediately return the phrase "NO". If it will capture their attention, then provide a phrase or sentence summarizing the POST, asking a question about the POST, or inspiring discussion related to what the POST discusses.' }, { role: 'user', content: post }],
            model: 'gpt-3.5-turbo',
        }),
    });
    const json = await response.json();
    const headline = json.choices[0].message.content;
    return headline;
}

async function getPosts() {
    const url = "https://gov.optimism.io/posts.json";
    const headers: any = {
        "Api-Key": process.env.DISCOURSE_API_KEY,
        "Api-Username": "system",
    };

    const response = await fetch(url, { headers });
    return response.json();
}

export async function GET(req: NextRequest): Promise<Response> {
    const searchParams = req.nextUrl.searchParams
    const id:any = searchParams.get("id")
    var idAsNumber = parseInt(id)

    const posts = await getPosts();
    
    var headline: string = "NO";
    while (headline.includes("NO") && idAsNumber < posts['latest_posts'].length) {
        var post = posts['latest_posts'][idAsNumber];
        headline = await getHeadline(post['cooked']);
        idAsNumber++;
    }
    const nextId = idAsNumber + 1;
    const headers = new Headers();
    headers.set("Next-Id", nextId.toString());
    return new NextResponse(JSON.stringify({'headline': headline}), {
        headers,
    });
}

export const dynamic = "force-dynamic";