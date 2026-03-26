using Microsoft.EntityFrameworkCore;
using MindTracker.Api.Data;
using MindTracker.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Services ─────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddScoped<IGeminiService, GeminiService>();

// Database
// var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseNpgsql(connectionString));

// Temporary In-Memory Database for test deployment
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("MindTrackerDb"));

// CORS – allow local Vite dev server and production frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevPolicy", policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://mindtracker-env.eba-n8f2ufjt.us-east-1.elasticbeanstalk.com/")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});

var app = builder.Build();

// ── Middleware ───────────────────────────────────────────────────
app.UseCors("DevPolicy");
app.MapControllers();

// ── Auto-migrate & seed on startup ──────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // db.Database.Migrate(); // Not needed for In-Memory
    DbSeeder.Seed(db);
}

var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";

app.MapGet("/", () => "MindTracker API is running 🚀");
app.Run($"http://0.0.0.0:{port}");
