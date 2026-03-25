namespace MindTracker.Api.Models;

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<EntryTag> EntryTags { get; set; } = new List<EntryTag>();
}
