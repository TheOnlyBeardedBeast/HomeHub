using HomeHub.Hub.Hosting;

// A single-file publish extracts its bundled content next to the running assembly, so the
// content root follows AppContext.BaseDirectory rather than the launch directory.
var builder = WebApplication.CreateBuilder(
    new WebApplicationOptions { Args = args, ContentRootPath = AppContext.BaseDirectory });

builder.ConfigureHomeHubKestrel();
builder.Services.AddHomeHubServices(builder.Configuration);

var app = builder.Build();

app.InitializeHomeHub();
app.UseHomeHubPipeline();
app.MapHomeHubEndpoints();

app.Run();
