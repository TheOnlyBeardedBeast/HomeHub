using HomeHub.Events.Contexts;
using HomeHub.Hub.Contexts;
using HomeHub.Lists.Contexts;
using HomeHub.Notes.Contexts;
using HomeHub.Users.Contexts;
using HomeHub.Users.Security;
using HumeHub.Tasks.Contexts;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace HomeHub.Hub.Hosting;

public static class ServiceRegistration
{
    /// <summary>Registers gRPC, data access, and the infrastructure shared by the hub.</summary>
    public static IServiceCollection AddHomeHubServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddGrpc();
        services.AddGrpcReflection();
        services.AddMemoryCache();
        services.AddHttpClient();
        services.AddHubCors();
        services.AddHubData(configuration);
        services.AddScoped<CurrentUser>();
        return services;
    }

    private static void AddHubCors(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
                policy.AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .WithExposedHeaders("Grpc-Status", "Grpc-Message", "Grpc-Status-Details-Bin"));
        });
    }

    private static void AddHubData(this IServiceCollection services, IConfiguration configuration)
    {
        // The database is the only file that lives outside the (single-file) application.
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            connectionString = new SqliteConnectionStringBuilder
            {
                DataSource = AppDataPaths.DatabasePath(),
            }.ToString();
        }

        services.AddDbContext<HubDbContext>(options => options.UseSqlite(connectionString));

        // The gRPC services depend on per-domain interfaces; all resolve to the single HubDbContext.
        services.AddScoped<IEventDbContext>(sp => sp.GetRequiredService<HubDbContext>());
        services.AddScoped<ITaskDbContext>(sp => sp.GetRequiredService<HubDbContext>());
        services.AddScoped<INoteDbContext>(sp => sp.GetRequiredService<HubDbContext>());
        services.AddScoped<IListDbContext>(sp => sp.GetRequiredService<HubDbContext>());
        services.AddScoped<IUserDbContext>(sp => sp.GetRequiredService<HubDbContext>());
    }
}
