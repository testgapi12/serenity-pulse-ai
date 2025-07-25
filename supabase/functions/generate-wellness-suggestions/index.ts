import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WellnessRequest {
  moodScore: number;
  stressLevel: number;
  journalText?: string;
  userAge?: number;
  userGender?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { moodScore, stressLevel, journalText, userAge, userGender }: WellnessRequest = await req.json();
    
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Construct personalized prompt
    let prompt = `As a wellness coach, provide 3-4 personalized, actionable wellness suggestions for someone with:
- Mood score: ${moodScore}/5 (1=very low, 5=excellent)
- Stress level: ${stressLevel}/10 (1=very relaxed, 10=very stressed)`;

    if (userAge) {
      prompt += `\n- Age: ${userAge}`;
    }
    if (userGender) {
      prompt += `\n- Gender: ${userGender}`;
    }
    if (journalText) {
      prompt += `\n- Journal entry: "${journalText}"`;
    }

    prompt += `\n\nProvide suggestions in the following JSON format:
{
  "suggestions": [
    {
      "text": "specific actionable suggestion",
      "type": "activity|mindfulness|exercise|social|professional"
    }
  ]
}

Focus on:
- Immediate, practical actions they can take today
- Evidence-based wellness techniques
- Personalized recommendations based on their mood and stress levels
- Positive, encouraging tone
- Suggestions that take 5-30 minutes to complete

Keep suggestions concise (1-2 sentences each).`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional wellness coach and mental health advocate. Provide helpful, evidence-based suggestions that are safe and appropriate. Never provide medical advice or diagnose conditions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    // Parse the JSON response
    let suggestions;
    try {
      const parsed = JSON.parse(content);
      suggestions = parsed.suggestions;
    } catch (parseError) {
      // Fallback if JSON parsing fails
      console.warn("Failed to parse OpenAI response as JSON, using fallback suggestions");
      suggestions = getFallbackSuggestions(moodScore, stressLevel);
    }

    return new Response(JSON.stringify({ suggestions }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in generate-wellness-suggestions function:", error);
    
    // Return fallback suggestions in case of error
    const fallbackSuggestions = getFallbackSuggestions(3, 5); // default values
    
    return new Response(
      JSON.stringify({ 
        suggestions: fallbackSuggestions,
        fallback: true 
      }),
      {
        status: 200, // Return 200 so the app continues to work
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function getFallbackSuggestions(moodScore: number, stressLevel: number) {
  const suggestions = [
    {
      text: "Take 5 deep breaths using the 4-7-8 technique: inhale for 4, hold for 7, exhale for 8.",
      type: "mindfulness"
    },
    {
      text: "Step outside for a brief 10-minute walk to get fresh air and natural light.",
      type: "activity"
    },
    {
      text: "Write down 3 things you're grateful for right now, no matter how small.",
      type: "mindfulness"
    }
  ];

  if (stressLevel >= 7) {
    suggestions.push({
      text: "Try progressive muscle relaxation: tense and release each muscle group for 5 seconds.",
      type: "mindfulness"
    });
  }

  if (moodScore <= 2) {
    suggestions.push({
      text: "Reach out to a friend or family member for a brief, supportive conversation.",
      type: "social"
    });
  }

  return suggestions;
}

serve(handler);