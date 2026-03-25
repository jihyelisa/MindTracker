using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MindTracker.Api.Data;
using MindTracker.Api.DTOs;
using MindTracker.Api.Models;

namespace MindTracker.Api.Controllers;

[ApiController]
[Route("api/entries")]
public class EntriesController : ControllerBase
{
    private readonly AppDbContext _db;

    public EntriesController(AppDbContext db)
    {
        _db = db;
    }

    private static EntryDto ToDto(Entry e) => new(
        e.Id,
        e.Date,
        e.Mood,
        e.Text,
        e.CreatedAt,
        e.UpdatedAt,
        e.EntryTags.Select(et => new TagDto(et.Tag.Id, et.Tag.Name)).ToList()
    );

    // GET /api/entries?userId=1&moodFilter=3&limit=50
    [HttpGet]
    public async Task<ActionResult<List<EntryDto>>> GetEntries(
        [FromQuery] int userId,
        [FromQuery] int? moodFilter,
        [FromQuery] int limit = 50)
    {
        var query = _db.Entries
            .Include(e => e.EntryTags).ThenInclude(et => et.Tag)
            .Where(e => e.UserId == userId);

        if (moodFilter.HasValue)
            query = query.Where(e => e.Mood == moodFilter.Value);

        var entries = await query
            .OrderByDescending(e => e.Date)
            .Take(limit)
            .ToListAsync();

        return Ok(entries.Select(ToDto));
    }

    // GET /api/entries/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<EntryDto>> GetEntry(int id)
    {
        var entry = await _db.Entries
            .Include(e => e.EntryTags).ThenInclude(et => et.Tag)
            .FirstOrDefaultAsync(e => e.Id == id);

        return entry == null ? NotFound() : Ok(ToDto(entry));
    }

    // POST /api/entries
    [HttpPost]
    public async Task<ActionResult<EntryDto>> CreateEntry([FromBody] CreateEntryRequest req, [FromQuery] int userId)
    {
        if (req.Mood < 1 || req.Mood > 5)
            return BadRequest(new { message = "Mood must be between 1 and 5" });

        var entry = new Entry
        {
            UserId = userId,
            Date = req.Date.Date,
            Mood = req.Mood,
            Text = req.Text,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Entries.Add(entry);
        await _db.SaveChangesAsync();

        // Apply tags
        foreach (var tagId in req.TagIds.Distinct())
        {
            _db.EntryTags.Add(new EntryTag { EntryId = entry.Id, TagId = tagId });
        }
        await _db.SaveChangesAsync();

        var created = await _db.Entries
            .Include(e => e.EntryTags).ThenInclude(et => et.Tag)
            .FirstAsync(e => e.Id == entry.Id);

        return CreatedAtAction(nameof(GetEntry), new { id = entry.Id }, ToDto(created));
    }

    // PUT /api/entries/{id}
    [HttpPut("{id:int}")]
    public async Task<ActionResult<EntryDto>> UpdateEntry(int id, [FromBody] UpdateEntryRequest req)
    {
        var entry = await _db.Entries
            .Include(e => e.EntryTags)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (entry == null) return NotFound();

        entry.Mood = req.Mood;
        entry.Text = req.Text;
        entry.UpdatedAt = DateTime.UtcNow;

        // Replace tags
        _db.EntryTags.RemoveRange(entry.EntryTags);
        foreach (var tagId in req.TagIds.Distinct())
        {
            _db.EntryTags.Add(new EntryTag { EntryId = entry.Id, TagId = tagId });
        }
        await _db.SaveChangesAsync();

        var updated = await _db.Entries
            .Include(e => e.EntryTags).ThenInclude(et => et.Tag)
            .FirstAsync(e => e.Id == id);

        return Ok(ToDto(updated));
    }

    // DELETE /api/entries/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteEntry(int id)
    {
        var entry = await _db.Entries.FindAsync(id);
        if (entry == null) return NotFound();

        _db.Entries.Remove(entry);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // GET /api/entries/summary?userId=1
    [HttpGet("summary")]
    public async Task<ActionResult<WeeklySummaryDto>> GetWeeklySummary([FromQuery] int userId)
    {
        var cutoff = DateTime.UtcNow.Date.AddDays(-7);
        var weekEntries = await _db.Entries
            .Where(e => e.UserId == userId && e.Date >= cutoff)
            .OrderBy(e => e.Date)
            .ToListAsync();

        double avg = weekEntries.Any() ? weekEntries.Average(e => e.Mood) : 0;

        // Calculate streak (consecutive days with entries up to today)
        var allDates = await _db.Entries
            .Where(e => e.UserId == userId)
            .Select(e => e.Date.Date)
            .Distinct()
            .OrderByDescending(d => d)
            .ToListAsync();

        int streak = 0;
        var checkDate = DateTime.UtcNow.Date;
        foreach (var date in allDates)
        {
            if (date == checkDate || date == checkDate.AddDays(-1))
            {
                streak++;
                checkDate = date;
            }
            else break;
        }

        return Ok(new WeeklySummaryDto(Math.Round(avg, 1), streak, weekEntries.Count));
    }

    // GET /api/entries/stats?userId=1
    [HttpGet("stats")]
    public async Task<ActionResult> GetStats([FromQuery] int userId, [FromQuery] int days = 30)
    {
        var cutoff = DateTime.UtcNow.Date.AddDays(-days);
        var entries = await _db.Entries
            .Include(e => e.EntryTags).ThenInclude(et => et.Tag)
            .Where(e => e.UserId == userId && e.Date >= cutoff)
            .OrderBy(e => e.Date)
            .ToListAsync();

        var moodDistribution = entries
            .GroupBy(e => e.Mood)
            .Select(g => new MoodDistributionDto(g.Key, g.Count()))
            .OrderBy(m => m.Mood)
            .ToList();

        var moodTrend = entries
            .Select(e => new { date = e.Date.ToString("yyyy-MM-dd"), mood = e.Mood })
            .ToList();

        var tagAnalysis = entries
            .SelectMany(e => e.EntryTags)
            .GroupBy(et => et.Tag.Name)
            .Select(g => new { tag = g.Key, count = g.Count() })
            .OrderByDescending(t => t.count)
            .ToList();

        return Ok(new { moodDistribution, moodTrend, tagAnalysis });
    }
}
