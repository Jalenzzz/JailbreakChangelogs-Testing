import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { content, title } = await request.json();

  if (!content || !title) {
    return NextResponse.json({ error: 'Content and title required' }, { status: 400 });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'GEMINI_API_KEY environment variable is required',
        },
        { status: 500 },
      );
    }

    // Clean and truncate content to avoid API issues
    const cleanContent = content
      .replace(/\n\n+/g, '\n') // Reduce multiple newlines to single
      .replace(/\s+/g, ' ') // Reduce multiple spaces to single
      .substring(0, 4000); // Truncate to avoid token limits

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Summarize this Roblox Jailbreak changelog in 2 sentences and extract 5 relevant tags:

Title: "${title}"
Content: "${cleanContent}"

Respond in JSON format:
{
  "summary": "Brief summary here",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error ${response.status}:`, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const finishReason = data.candidates?.[0]?.finishReason;

    if (!generatedText) {
      if (finishReason === 'MAX_TOKENS') {
        throw new Error('Content too long - please try with shorter content');
      }

      throw new Error('No content generated');
    }

    // Try to parse JSON response with multiple fallback strategies
    let result;
    try {
      // First try: Look for JSON block
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        // Second try: Look for JSON in code blocks
        const codeBlockMatch = generatedText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          result = JSON.parse(codeBlockMatch[1]);
        } else {
          // Third try: Extract summary and tags manually
          const summaryMatch = generatedText.match(/summary["\s]*:["\s]*"([^"]+)"/i);
          const tagsMatch = generatedText.match(/tags["\s]*:["\s]*\[([^\]]+)\]/i);

          if (summaryMatch) {
            result = {
              summary: summaryMatch[1],
              tags: tagsMatch
                ? tagsMatch[1].split(',').map((tag: string) => tag.trim().replace(/['"]/g, ''))
                : [],
            };
          } else {
            throw new Error('Could not extract summary from response');
          }
        }
      }
    } catch {
      throw new Error('Invalid JSON response');
    }

    return NextResponse.json({
      summary: result.summary || content.substring(0, 200),
      tags: result.tags || [],
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate AI summary',
      },
      { status: 500 },
    );
  }
}
