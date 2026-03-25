namespace MindTracker.Api.Models;

public class EntryTag
{
    public int EntryId { get; set; }
    public Entry Entry { get; set; } = null!;

    public int TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}
