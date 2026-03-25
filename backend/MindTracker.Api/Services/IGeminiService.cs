namespace MindTracker.Api.Services;

public interface IGeminiService
{
    Task<List<string>> SuggestTagsAsync(string text);
    Task<(string summary, string suggestion)> GenerateInsightAsync(IEnumerable<string> recentEntries);
}
