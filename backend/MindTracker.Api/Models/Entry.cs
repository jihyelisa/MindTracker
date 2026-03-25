namespace MindTracker.Api.Models;

public class Entry
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime Date { get; set; }
    public int Mood { get; set; } // 1–5
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<EntryTag> EntryTags { get; set; } = new List<EntryTag>();
}
