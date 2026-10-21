using HomeHub.Events.Services;
using HomeHub.Events.Contexts;
using HomeHub.Events.Endpoints;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Grpc.AspNetCore.Web;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel for HTTP/1 and HTTP/2 support
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenLocalhost(5000, listenOptions =>
    {
        listenOptions.Protocols = Microsoft.AspNetCore.Server.Kestrel.Core.HttpProtocols.Http1AndHttp2;
    });
    serverOptions.ListenLocalhost(5001, listenOptions =>
    {
        listenOptions.Protocols = Microsoft.AspNetCore.Server.Kestrel.Core.HttpProtocols.Http1AndHttp2;
    });
});

// Add services to the container.
builder.Services.AddGrpc();
builder.Services.AddGrpcReflection();
builder.Services.AddOpenApi();
builder.Services.AddDbContext<EventDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Apply database migrations on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<EventDbContext>();
    dbContext.Database.Migrate();
}

// Configure the HTTP request pipeline.
app.UseGrpcWeb();
app.MapOpenApi();
app.MapScalarApiReference();
app.MapEventsEndpoints();
app.MapGrpcService<EventHub>().EnableGrpcWeb();
app.MapGrpcReflectionService();
app.MapGet("/", () => "Communication with gRPC endpoints must be made through a gRPC client. To learn how to create a client, visit: https://go.microsoft.com/fwlink/?linkid=2086909");

app.Run();
