using Microsoft.EntityFrameworkCore;
using MindTracker.Api.Data;
using MindTracker.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Services ─────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddScoped<IGeminiService, GeminiService>();

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Temporary In-Memory Database for test deployment
// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseInMemoryDatabase("MindTrackerDb"));

// CORS – allow local Vite dev server and production frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevPolicy", policy =>
    {
        policy
            .WithOrigins(
                "https://mindtrackerapi.shop",       // 프론트엔드 커스텀 도메인
                "https://www.mindtrackerapi.shop",   // www 붙은 도메인
                "http://localhost:5173"              // 로컬 개발 환경
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var app = builder.Build();

// ── Middleware ───────────────────────────────────────────────────
app.UseCors("DevPolicy");
app.MapControllers();

// ── Auto-migrate & seed on startup ──────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate(); // Apply migrations on startup
    DbSeeder.Seed(db);
}

var port = Environment.GetEnvironmentVariable("PORT") ?? "5254";

app.MapGet("/", () => "MindTracker API is running 🚀");
app.Run($"http://0.0.0.0:{port}");
