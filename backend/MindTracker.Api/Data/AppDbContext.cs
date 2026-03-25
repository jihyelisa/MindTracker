using Microsoft.EntityFrameworkCore;
using MindTracker.Api.Models;

namespace MindTracker.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Entry> Entries => Set<Entry>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<EntryTag> EntryTags => Set<EntryTag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Composite PK for join table
        modelBuilder.Entity<EntryTag>()
            .HasKey(et => new { et.EntryId, et.TagId });

        modelBuilder.Entity<EntryTag>()
            .HasOne(et => et.Entry)
            .WithMany(e => e.EntryTags)
            .HasForeignKey(et => et.EntryId);

        modelBuilder.Entity<EntryTag>()
            .HasOne(et => et.Tag)
            .WithMany(t => t.EntryTags)
            .HasForeignKey(et => et.TagId);
    }
}
