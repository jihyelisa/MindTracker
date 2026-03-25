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
        _apiKey = config["GeminiApiKey"];
        _logger = logger;
    }

    private bool IsConfigured => !string.IsNullOrWhiteSpace(_apiKey);

    public async Task<List<string>> SuggestTagsAsync(string text)
    {
        if (!IsConfigured)
        {
            // Return mock tags when no API key is set
            return new List<string> { "work", "reflection", "gratitude" };
        }

        var prompt = $"""
            You are a helpful journaling assistant. Based on the following journal entry, suggest 3-5 short, lowercase tags 
            that describe the themes, emotions, or activities mentioned. Return ONLY a JSON array of strings.
            
            Journal entry: "{text}"
            
            Return format: ["tag1", "tag2", "tag3"]
            """;

        return await CallGeminiAsync<List<string>>(prompt) ?? new List<string> { "reflection" };
    }

    public async Task<(string summary, string suggestion)> GenerateInsightAsync(IEnumerable<string> recentEntries)
    {
        if (!IsConfigured)
        {
            return (
                "You've been navigating life's ups and downs thoughtfully. Your consistency in journaling shows real self-awareness.",
                "Try to carve out 10 minutes each morning for a short walk or stretching — small movements can shift your mood significantly."
            );
        }

        var combined = string.Join("\n- ", recentEntries.Take(7));
        var prompt = $$"""
            You are a warm, supportive journaling companion (not a therapist). Based on these recent journal entries, 
            write a short, kind emotional summary (1-2 sentences) and one actionable suggestion (1-2 sentences).
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

        return ("Your mood patterns show resilience.", "Take a moment to celebrate small wins this week.");
    }

    private async Task<T?> CallGeminiAsync<T>(string prompt)
    {
        try
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={_apiKey}";
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
            return default;
        }
    }
}
