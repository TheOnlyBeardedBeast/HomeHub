using System.Security.Cryptography;
using System.Text;
using HomeHub.Users.Contexts;
using HomeHub.Users.Security;
using Microsoft.EntityFrameworkCore;

namespace HomeHub.Hub.Authentication;

/// <summary>
/// Authenticates every protected request with an <c>x-api-key</c> header.
/// A matching user key populates <see cref="CurrentUser"/> with that user's id;
/// the configured admin key grants admin-only operations.
/// </summary>
public sealed class ApiKeyAuthenticationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly string? _adminApiKey;

    public ApiKeyAuthenticationMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        _next = next;
        _adminApiKey = configuration["Authentication:AdminApiKey"];
    }

    public async Task InvokeAsync(HttpContext context, IUserDbContext users, CurrentUser currentUser)
    {
        if (IsPublicPath(context.Request.Path))
        {
            await _next(context);
            return;
        }

        var apiKey = context.Request.Headers["x-api-key"].ToString();
        if (string.IsNullOrEmpty(apiKey))
        {
            await RejectAsync(context, "An x-api-key header is required.");
            return;
        }

        if (!string.IsNullOrEmpty(_adminApiKey) && AdminKeyMatches(apiKey))
        {
            currentUser.IsAdmin = true;
            await _next(context);
            return;
        }

        var hash = ApiKeys.Hash(apiKey);
        var user = await users.Users.FirstOrDefaultAsync(u => u.HashedApiKey == hash);
        if (user == null)
        {
            await RejectAsync(context, "Invalid API key.");
            return;
        }

        currentUser.UserId = user.Id;
        currentUser.FullName = user.FullName;
        await _next(context);
    }

    private bool AdminKeyMatches(string apiKey)
    {
        var provided = Encoding.UTF8.GetBytes(apiKey);
        var expected = Encoding.UTF8.GetBytes(_adminApiKey!);
        return provided.Length == expected.Length &&
               CryptographicOperations.FixedTimeEquals(provided, expected);
    }

    /// <summary>
    /// Only the hub API is protected. The SPA (index, assets, client-side routes) is public;
    /// browsers cannot attach an API key before the app has loaded.
    /// </summary>
    private static bool IsPublicPath(PathString path)
    {
        var value = path.Value ?? string.Empty;
        return !value.StartsWith("/HomeHub.", StringComparison.OrdinalIgnoreCase)
            && !value.StartsWith("/grpc.", StringComparison.OrdinalIgnoreCase)
            && !(value == "/api" || value.StartsWith("/api/", StringComparison.OrdinalIgnoreCase));
    }

    private static async Task RejectAsync(HttpContext context, string message)
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        context.Response.Headers.WWWAuthenticate = "ApiKey";
        context.Response.ContentType = "text/plain";
        await context.Response.WriteAsync(message);
    }
}
