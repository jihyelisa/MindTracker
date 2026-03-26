using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MindTracker.Api.Data;
using MindTracker.Api.DTOs;
using MindTracker.Api.Services;

namespace MindTracker.Api.Controllers;

[ApiController]
[Route("api/ai")]
public class AiController : ControllerBase
{
    private readonly IGeminiService _gemini;
    private readonly AppDbContext _db;

    public AiController(IGeminiService gemini, AppDbContext db)
    {
        _gemini = gemini;
        _db = db;
    }

    // POST /api/ai/tag-suggestions
    [HttpPost("tag-suggestions")]
    public async Task<ActionResult<AiTagsDto>> SuggestTags([FromBody] TagSuggestionRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Text))
            return BadRequest(new { message = "Text is required" });

        var existingTags = await _db.Tags.Select(t => t.Name).ToListAsync();
        var tags = await _gemini.SuggestTagsAsync(req.Text, existingTags, req.Language);
        return Ok(new AiTagsDto(tags));
    }

    // POST /api/ai/insight
    [HttpPost("insight")]
    public async Task<ActionResult<AiInsightDto>> GenerateInsight([FromBody] InsightRequest req)
    {
        // Load recent entry texts for this user
        var recentEntries = await _db.Entries
            .Where(e => e.UserId == req.UserId)
            .OrderByDescending(e => e.Date)
            .Take(7)
            .Select(e => $"[{e.Date:MMM d}] Mood: {e.Mood}/5 — {e.Text}")
            .ToListAsync();

        if (!recentEntries.Any())
            return Ok(new AiInsightDto(
                req.Language == "ko" ? "일기를 써서 개인화된 통찰을 얻어보세요!" : "Start journaling to get personalized insights!",
                req.Language == "ko" ? "오늘 첫 번째 기록을 남겨보세요." : "Try logging your first entry today."
            ));

        var (summary, suggestion) = await _gemini.GenerateInsightAsync(recentEntries, req.Language);
        return Ok(new AiInsightDto(summary, suggestion));
    }
}

public record TagSuggestionRequest(string Text, string Language = "en");
public record InsightRequest(int UserId, string Language = "en");
