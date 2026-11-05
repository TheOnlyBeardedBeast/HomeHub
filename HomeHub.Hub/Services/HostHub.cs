using System.Data;
using Google.Protobuf;
using Grpc.Core;
using HomeHub.Host;
using HomeHub.Hub.Contexts;
using HomeHub.Users.Security;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace HomeHub.Hub.Services;

public class HostHub : HostService.HostServiceBase
{
    private const int ChunkSize = 64 * 1024;

    private readonly HubDbContext _dbContext;
    private readonly CurrentUser _currentUser;

    public HostHub(HubDbContext dbContext, CurrentUser currentUser)
    {
        _dbContext = dbContext;
        _currentUser = currentUser;
    }

    public override Task<GetDatabaseInfoResponse> GetDatabaseInfo(
        GetDatabaseInfoRequest request,
        ServerCallContext context)
    {
        _currentUser.RequireAdmin();

        return Task.FromResult(new GetDatabaseInfoResponse
        {
            Path = _dbContext.Database.GetDbConnection().DataSource
        });
    }

    public override async Task BackupDatabase(
        BackupDatabaseRequest request,
        IServerStreamWriter<DatabaseBackupChunk> responseStream,
        ServerCallContext context)
    {
        _currentUser.RequireAdmin();

        var backupPath = Path.Combine(
            Path.GetTempPath(), $"homehub-backup-{Guid.NewGuid():N}.db");
        try
        {
            await CreateSnapshotAsync(backupPath, context.CancellationToken);
            if (!OperatingSystem.IsWindows())
            {
                File.SetUnixFileMode(
                    backupPath, UnixFileMode.UserRead | UnixFileMode.UserWrite);
            }

            await using var file = new FileStream(
                backupPath,
                FileMode.Open,
                FileAccess.Read,
                FileShare.Read,
                ChunkSize,
                FileOptions.Asynchronous | FileOptions.SequentialScan);

            var buffer = new byte[ChunkSize];
            int read;
            while ((read = await file.ReadAsync(buffer.AsMemory(), context.CancellationToken)) > 0)
            {
                await responseStream.WriteAsync(new DatabaseBackupChunk
                {
                    Data = ByteString.CopyFrom(buffer, 0, read)
                });
            }
        }
        finally
        {
            File.Delete(backupPath);
        }
    }

    private async Task CreateSnapshotAsync(string destinationPath, CancellationToken cancellationToken)
    {
        var connection = (SqliteConnection)_dbContext.Database.GetDbConnection();
        var wasOpen = connection.State == ConnectionState.Open;
        if (!wasOpen)
        {
            await connection.OpenAsync(cancellationToken);
        }

        try
        {
            var destinationConnectionString = new SqliteConnectionStringBuilder
            {
                DataSource = destinationPath
            }.ToString();

            await using var destination = new SqliteConnection(destinationConnectionString);
            await destination.OpenAsync(cancellationToken);
            connection.BackupDatabase(destination);
        }
        finally
        {
            if (!wasOpen)
            {
                await connection.CloseAsync();
            }
        }
    }
}
