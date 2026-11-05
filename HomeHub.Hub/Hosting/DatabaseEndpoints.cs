using System.Data;
using HomeHub.Hub.Contexts;
using HomeHub.Users.Security;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace HomeHub.Hub.Hosting;

public static class DatabaseEndpoints
{
    private const long MaxRestoreBytes = 128 * 1024 * 1024;
    private const int BufferSize = 64 * 1024;

    public static void MapDatabaseEndpoints(this WebApplication app)
    {
        app.MapPost("/api/database/restore", RestoreAsync);
    }

    private static async Task<IResult> RestoreAsync(
        HttpContext httpContext,
        HubDbContext dbContext,
        CurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        if (!currentUser.IsAdmin)
        {
            return Results.Json(
                new { error = "The admin key is required to restore a backup." },
                statusCode: StatusCodes.Status403Forbidden);
        }

        var sizeFeature = httpContext.Features.Get<IHttpMaxRequestBodySizeFeature>();
        if (sizeFeature is { IsReadOnly: false })
        {
            sizeFeature.MaxRequestBodySize = MaxRestoreBytes;
        }

        if (httpContext.Request.ContentLength is > MaxRestoreBytes)
        {
            return Results.Json(
                new { error = "The backup is too large." },
                statusCode: StatusCodes.Status413PayloadTooLarge);
        }

        var uploadPath = Path.Combine(
            Path.GetTempPath(), $"homehub-restore-{Guid.NewGuid():N}.db");
        try
        {
            await using (var file = new FileStream(
                uploadPath,
                FileMode.CreateNew,
                FileAccess.Write,
                FileShare.None,
                BufferSize,
                FileOptions.Asynchronous))
            {
                if (!OperatingSystem.IsWindows())
                {
                    File.SetUnixFileMode(
                        uploadPath, UnixFileMode.UserRead | UnixFileMode.UserWrite);
                }

                var buffer = new byte[BufferSize];
                long total = 0;
                int read;
                while ((read = await httpContext.Request.Body.ReadAsync(
                    buffer.AsMemory(), cancellationToken)) > 0)
                {
                    total += read;
                    if (total > MaxRestoreBytes)
                    {
                        return Results.Json(
                            new { error = "The backup is too large." },
                            statusCode: StatusCodes.Status413PayloadTooLarge);
                    }

                    await file.WriteAsync(buffer.AsMemory(0, read), cancellationToken);
                }

                if (total == 0)
                {
                    return Results.Json(
                        new { error = "The uploaded file is empty." },
                        statusCode: StatusCodes.Status400BadRequest);
                }
            }

            var validationError = await ValidateAsync(uploadPath, dbContext, cancellationToken);
            if (validationError is not null)
            {
                return Results.Json(
                    new { error = validationError },
                    statusCode: StatusCodes.Status400BadRequest);
            }

            await ApplyAsync(uploadPath, dbContext, cancellationToken);
            return Results.Ok(new { restored = true });
        }
        finally
        {
            File.Delete(uploadPath);
        }
    }

    private static async Task<string?> ValidateAsync(
        string path,
        HubDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var header = new byte[16];
        await using (var file = File.OpenRead(path))
        {
            var read = await file.ReadAsync(header, cancellationToken);
            if (read != header.Length
                || !header.AsSpan().SequenceEqual("SQLite format 3\0"u8))
            {
                return "That file is not a SQLite database.";
            }
        }

        List<string> uploadedMigrations;
        try
        {
            await using var connection = new SqliteConnection(new SqliteConnectionStringBuilder
            {
                DataSource = path,
                Mode = SqliteOpenMode.ReadOnly
            }.ToString());
            await connection.OpenAsync(cancellationToken);

            await using (var integrity = connection.CreateCommand())
            {
                integrity.CommandText = "PRAGMA integrity_check;";
                var result = (string?)await integrity.ExecuteScalarAsync(cancellationToken);
                if (!string.Equals(result, "ok", StringComparison.OrdinalIgnoreCase))
                {
                    return "The backup failed SQLite's integrity check.";
                }
            }

            uploadedMigrations = new List<string>();
            await using var command = connection.CreateCommand();
            command.CommandText =
                "SELECT MigrationId FROM __EFMigrationsHistory ORDER BY MigrationId;";
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                uploadedMigrations.Add(reader.GetString(0));
            }
        }
        catch (SqliteException)
        {
            return "That file is not a HomeHub database.";
        }

        var appliedMigrations = (await dbContext.Database.GetAppliedMigrationsAsync(cancellationToken))
            .OrderBy(migration => migration, StringComparer.Ordinal)
            .ToList();

        return uploadedMigrations.SequenceEqual(appliedMigrations, StringComparer.Ordinal)
            ? null
            : "That backup was made by a different HomeHub version.";
    }

    private static async Task ApplyAsync(
        string path,
        HubDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var destination = (SqliteConnection)dbContext.Database.GetDbConnection();
        var wasOpen = destination.State == ConnectionState.Open;
        if (!wasOpen)
        {
            await destination.OpenAsync(cancellationToken);
        }

        try
        {
            await using var source = new SqliteConnection(new SqliteConnectionStringBuilder
            {
                DataSource = path,
                Mode = SqliteOpenMode.ReadOnly
            }.ToString());
            await source.OpenAsync(cancellationToken);
            source.BackupDatabase(destination);
            dbContext.ChangeTracker.Clear();
        }
        finally
        {
            if (!wasOpen)
            {
                await destination.CloseAsync();
            }
        }
    }
}
