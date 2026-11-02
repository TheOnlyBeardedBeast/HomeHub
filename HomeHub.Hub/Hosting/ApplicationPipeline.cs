using Grpc.AspNetCore.Web;
using HomeHub.Events.Endpoints;
using HomeHub.Events.Services;
using HomeHub.Hub.Authentication;
using HomeHub.Hub.Contexts;
using HomeHub.Integrations.Services;
using HomeHub.Lists.Services;
using HomeHub.Notes.Services;
using HomeHub.Tasks.Services;
using HomeHub.Users.Services;
using Microsoft.EntityFrameworkCore;

namespace HomeHub.Hub.Hosting;

public static class ApplicationPipeline
{
    /// <summary>Warns about missing auth configuration and applies pending migrations.</summary>
    public static void InitializeHomeHub(this WebApplication app)
    {
        if (string.IsNullOrWhiteSpace(app.Configuration["Authentication:AdminApiKey"]))
        {
            app.Logger.LogWarning(
                "Authentication:AdminApiKey is not configured; admin-only user management is disabled. "
                    + "Set it in appsettings.json or via the Authentication__AdminApiKey environment variable.");
        }

        if (app.Configuration.GetValue("Tls:Enabled", false))
        {
            app.Logger.LogInformation(
                "HTTPS enabled on port {Port} (certificate: {Certificate})",
                app.Configuration.GetValue("Tls:Port", 5443),
                app.Configuration["Tls:CertificatePath"] ?? TlsCertificate.SelfSignedCertificatePath);
        }

        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<HubDbContext>();
        app.Logger.LogInformation(
            "Using database at {DatabasePath}",
            dbContext.Database.GetDbConnection().DataSource);
        dbContext.Database.Migrate();
    }

    public static void UseHomeHubPipeline(this WebApplication app)
    {
        app.UseCors();
        // The SPA is served from wwwroot; the API-key middleware only guards the hub API.
        app.UseDefaultFiles();
        app.UseStaticFiles();
        app.UseMiddleware<ApiKeyAuthenticationMiddleware>();
        app.UseGrpcWeb();
    }

    public static void MapHomeHubEndpoints(this WebApplication app)
    {
        app.MapGet("/api/version", () => Results.Ok(new { version = VersionInfo.Version }));
        app.MapEventsEndpoints();
        app.MapGrpcService<EventHub>().EnableGrpcWeb();
        app.MapGrpcService<TaskHub>().EnableGrpcWeb();
        app.MapGrpcService<NoteHub>().EnableGrpcWeb();
        app.MapGrpcService<ListHub>().EnableGrpcWeb();
        app.MapGrpcService<UserHub>().EnableGrpcWeb();
        app.MapGrpcService<WeatherHub>().EnableGrpcWeb();
        app.MapGrpcService<QuoteHub>().EnableGrpcWeb();
        app.MapGrpcReflectionService();
        // Fallback for client-side routes (e.g. /calendar) when the SPA is present.
        app.MapFallbackToFile("index.html");
    }
}
