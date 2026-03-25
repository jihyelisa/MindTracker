using MindTracker.Api.Models;

namespace MindTracker.Api.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Users.Any()) return; // Already seeded

        // ── Demo user ──────────────────────────────────────────────
        var demoUser = new User
        {
            Name = "Demo User",
            Email = "demo@mindtracker.app",
            IsDemo = true,
            CreatedAt = DateTime.UtcNow.AddDays(-21)
        };
        db.Users.Add(demoUser);
        db.SaveChanges();

        // ── Tags ───────────────────────────────────────────────────
        var tagNames = new[]
        {
            "work", "sleep", "exercise", "family", "social",
            "stress", "gratitude", "nature", "food", "creative"
        };
        var tags = tagNames.Select(n => new Tag { Name = n }).ToList();
        db.Tags.AddRange(tags);
        db.SaveChanges();

        Tag T(string name) => tags.First(t => t.Name == name);

        // ── Entries – 3 weeks of sample data ─────────────────────
        var now = DateTime.UtcNow.Date;
        var entries = new List<(int daysAgo, int mood, string text, string[] tagNames)>
        {
            (21, 3, "Just a regular Monday. Work was fine, nothing special.", new[]{"work"}),
            (20, 2, "Felt a bit off today. Didn't sleep well last night.", new[]{"sleep","stress"}),
            (19, 4, "Had a great gym session in the morning. Energy boost!", new[]{"exercise"}),
            (18, 3, "Caught up with family over dinner. Nice but tiring.", new[]{"family"}),
            (17, 5, "Best day this week! Great news at work and sunshine outside.", new[]{"work","nature"}),
            (16, 4, "Relaxing Saturday, cooked a new recipe and watched a movie.", new[]{"food","creative"}),
            (15, 3, "Quiet Sunday. Did some reading and light stretching.", new[]{"nature"}),
            (14, 2, "Monday blues hit hard. Lots of meetings and no progress.", new[]{"work","stress"}),
            (13, 3, "Better than yesterday. Small wins at work.", new[]{"work"}),
            (12, 4, "Went for a walk after dinner. Feeling more grounded.", new[]{"nature","exercise"}),
            (11, 5, "Spent time with old friends. Lots of laughs and good food.", new[]{"social","food"}),
            (10, 3, "Tired but productive. Finished a big task at work.", new[]{"work"}),
            (9, 2, "Feeling a bit anxious about upcoming deadline.", new[]{"stress","work"}),
            (8, 4, "Deadline done! Celebrated with a nice meal.", new[]{"work","food","gratitude"}),
            (7, 4, "Weekend walk in the park. Grateful for small moments.", new[]{"nature","gratitude"}),
            (6, 3, "Lazy Sunday but felt okay. Rested well.", new[]{"sleep"}),
            (5, 2, "Rainy and cold. Mood dipped a bit.", new[]{"stress"}),
            (4, 3, "Worked from home. More focused, less commute stress.", new[]{"work"}),
            (3, 4, "Called mom and had a long chat. Warmed my heart.", new[]{"family","gratitude"}),
            (2, 5, "Yoga in the morning, productive afternoon. Great day overall.", new[]{"exercise","creative"}),
            (1, 4, "Finished the week strong. Looking forward to the weekend.", new[]{"work","gratitude"}),
        };

        foreach (var (daysAgo, mood, text, tNames) in entries)
        {
            var entry = new Entry
            {
                UserId = demoUser.Id,
                Date = now.AddDays(-daysAgo),
                Mood = mood,
                Text = text,
                CreatedAt = now.AddDays(-daysAgo),
                UpdatedAt = now.AddDays(-daysAgo)
            };
            db.Entries.Add(entry);
            db.SaveChanges();

            foreach (var tn in tNames)
            {
                db.EntryTags.Add(new EntryTag { EntryId = entry.Id, TagId = T(tn).Id });
            }
            db.SaveChanges();
        }
    }
}
