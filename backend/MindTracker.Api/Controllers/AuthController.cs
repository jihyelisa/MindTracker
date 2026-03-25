using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MindTracker.Api.Data;
using MindTracker.Api.DTOs;

namespace MindTracker.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;

    public AuthController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/auth/demo
    // Returns the demo user for auto-login
    [HttpGet("demo")]
    public async Task<ActionResult<UserDto>> GetDemoUser()
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.IsDemo);
        if (user == null)
            return NotFound(new { message = "Demo user not found. Please seed the database." });

        return Ok(new UserDto(user.Id, user.Name, user.Email, user.IsDemo));
    }
}
