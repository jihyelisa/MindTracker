using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace MindTracker.Api.Services;

public class GeminiService : IGeminiService
{
    private readonly HttpClient _http;
    private readonly string? _apiKey;
    private readonly ILogger<GeminiService> _logger;

    public GeminiService(IHttpClientFactory httpClientFactory, IConfiguration config, ILogger<GeminiService> logger)
    {
        _http = httpClientFactory.CreateClient();
        _apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? config["GeminiApiKey"];
        _logger = logger;
    }

    private bool IsConfigured => !string.IsNullOrWhiteSpace(_apiKey);

    public async Task<List<string>> SuggestTagsAsync(string text, IEnumerable<string> existingTags, string language = "en")
    {
        if (!IsConfigured)
        {
            // Return mock tags when no API key is set
            return language == "ko" 
                ? new List<string> { "업무", "성찰", "감사" }
                : new List<string> { "work", "reflection", "gratitude" };
        }

        var tagsList = string.Join(", ", existingTags);
        var languageInstruction = language == "ko" ? "Please respond in Korean." : "";
        var prompt = $"""
            You are a helpful journaling assistant. Based on the following journal entry, suggest 3-5 short, lowercase tags 
            that capture the core keywords, emotions, or activities mentioned. 
            {languageInstruction}
            
            IMPORTANT: Check if any of your suggested tags are similar to these existing tags: [{tagsList}].
            If a similar tag already exists (e.g., you want to suggest "family bonding" but "family" exists), 
            use the EXISTING tag instead. If no similar tag exists, feel free to suggest a new one.
            
            Return ONLY a JSON array of strings.
            
            Journal entry: "{text}"
            
            Return format: ["tag1", "tag2", "tag3"]
            """;

        return await CallGeminiAsync<List<string>>(prompt) ?? new List<string> { language == "ko" ? "성찰" : "reflection" };
    }

    public async Task<(string summary, string suggestion)> GenerateInsightAsync(IEnumerable<string> recentEntries, string language = "en")
    {
        if (!IsConfigured)
        {
            if (language == "ko")
            {
                return (
                    "삶의 굴곡을 사려 깊게 헤쳐나가고 계시네요. 꾸준한 일기 쓰기는 진정한 자기 인식을 보여줍니다.",
                    "매일 아침 10분 정도 가벼운 산책이나 스트레칭을 해보세요. 작은 움직임이 기분을 크게 전환할 수 있습니다."
                );
            }
            return (
                "You've been navigating life's ups and downs thoughtfully. Your consistency in journaling shows real self-awareness.",
                "Try to carve out 10 minutes each morning for a short walk or stretching — small movements can shift your mood significantly."
            );
        }

        var combined = string.Join("\n- ", recentEntries.Take(7));
        var languageInstruction = language == "ko" ? "Please respond in Korean." : "";
        var prompt = $$"""
            You are a warm, supportive journaling companion (not a therapist). Based on these recent journal entries, 
            write a short, kind emotional summary (1-2 sentences) and one actionable suggestion (1-2 sentences).
            {{languageInstruction}}
            Return ONLY valid JSON in this exact format:
            {"summary": "...", "suggestion": "..."}
            
            Recent entries:
            - {{combined}}
            """;

        var result = await CallGeminiAsync<JsonElement?>(prompt);
        if (result.HasValue)
        {
            var summary = result.Value.GetProperty("summary").GetString() ?? "";
            var suggestion = result.Value.GetProperty("suggestion").GetString() ?? "";
            return (summary, suggestion);
        }

        return language == "ko" 
            ? ("기분 패턴에서 회복탄력성이 엿보입니다.", "이번 주에는 작은 성취를 축하하는 시간을 가져보세요.")
            : ("Your mood patterns show resilience.", "Take a moment to celebrate small wins this week.");
    }

    private async Task<T?> CallGeminiAsync<T>(string prompt)
    {
        try
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-preview:generateContent?key={_apiKey}";
            var body = new
            {
                contents = new[] { new { parts = new[] { new { text = prompt } } } }
            };

            var json = JsonSerializer.Serialize(body);
            var response = await _http.PostAsync(url,
                new StringContent(json, Encoding.UTF8, "application/json"));

            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync();
            var doc = JsonDocument.Parse(responseJson);
            var textContent = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? "";

            // Strip markdown code fences if present
            textContent = textContent.Trim();
            if (textContent.StartsWith("```")) 
            {
                var lines = textContent.Split('\n').Skip(1).ToArray();
                textContent = string.Join('\n', lines.Take(lines.Length - 1));
            }

            return JsonSerializer.Deserialize<T>(textContent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gemini API call failed");
            _logger.LogError(ex, "Gemini API call failed: {message}", ex.Message);
            return default;
        }
    }
}
