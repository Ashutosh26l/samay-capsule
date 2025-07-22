/*
  # Process Capsule with AI

  Edge function to handle Perplexity API integration for:
  1. Summarizing capsule content
  2. Generating future-self response
  3. Updating capsule record with AI results
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface CapsuleData {
  capsuleId: string;
  title: string;
  content: string;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { capsuleId, title, content }: CapsuleData = await req.json();

    if (!capsuleId || !content) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate AI summary
    const summaryPrompt = `Summarize this personal time capsule message in 2-3 sentences. Focus on the key emotions, themes, and important details:\n\nTitle: ${title}\nMessage: ${content}`;
    
    const summaryResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: summaryPrompt }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7
        }
      })
    });

    if (!summaryResponse.ok) {
      throw new Error(`Summary API call failed: ${summaryResponse.statusText}`);
    }

    const summaryData = await summaryResponse.json();
    const aiSummary = summaryData.candidates[0]?.content?.parts[0]?.text || "Unable to generate summary";

    // Generate future-self response
    const futurePrompt = `You are the future version of the person who wrote this time capsule message 5-10 years ago. You are wiser, more experienced, and reflecting back on this moment in your life. Write a warm, encouraging response to your past self. Be specific about growth, lessons learned, and perspective gained. Keep it personal and heartfelt.\n\nOriginal message:\nTitle: ${title}\nMessage: ${content}`;

    const futureResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: futurePrompt }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.8
        }
      })
    });

    if (!futureResponse.ok) {
      throw new Error(`Future response API call failed: ${futureResponse.statusText}`);
    }

    const futureData = await futureResponse.json();
    const aiFutureReply = futureData.candidates[0]?.content?.parts[0]?.text || "Unable to generate future response";

    // Update capsule with AI results
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: updateError } = await supabase
      .from("capsules")
      .update({
        ai_summary: aiSummary,
        ai_future_reply: aiFutureReply
      })
      .eq("id", capsuleId);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        ai_summary: aiSummary,
        ai_future_reply: aiFutureReply
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error processing capsule AI:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to process capsule with AI",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});