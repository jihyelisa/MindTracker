namespace MindTracker.Api.DTOs;

public record TagDto(int Id, string Name);

public record EntryDto(
    int Id,
    DateTime Date,
    int Mood,
    string Text,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<TagDto> Tags
);

public record CreateEntryRequest(DateTime Date, int Mood, string Text, List<int> TagIds, List<string>? TagNames = null);
public record UpdateEntryRequest(int Mood, string Text, List<int> TagIds, List<string>? TagNames = null);

public record UserDto(int Id, string Name, string Email, bool IsDemo);
public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Name, string Email, string Password);

public record WeeklySummaryDto(double AverageMood, int Streak, int TotalEntries);

public record MoodDistributionDto(int Mood, int Count);

public record AiInsightDto(string Summary, string Suggestion);
public record AiTagsDto(List<string> Tags);
