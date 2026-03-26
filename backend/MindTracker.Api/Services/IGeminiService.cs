namespace MindTracker.Api.Services;

public interface IGeminiService
{
    Task<List<string>> SuggestTagsAsync(string text, IEnumerable<string> existingTags, string language = "en");
    Task<(string summary, string suggestion)> GenerateInsightAsync(IEnumerable<string> recentEntries, string language = "en");
}
