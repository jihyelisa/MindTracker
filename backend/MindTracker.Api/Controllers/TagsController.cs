using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MindTracker.Api.Data;
using MindTracker.Api.DTOs;

namespace MindTracker.Api.Controllers;

[ApiController]
[Route("api/tags")]
public class TagsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TagsController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/tags
    [HttpGet]
    public async Task<ActionResult<List<TagDto>>> GetTags()
    {
        var tags = await _db.Tags.OrderBy(t => t.Name).ToListAsync();
        return Ok(tags.Select(t => new TagDto(t.Id, t.Name)));
    }
}
