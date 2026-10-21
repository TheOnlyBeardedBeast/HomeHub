using Grpc.AspNetCore.Web;
using HomeHub.Tasks.Services;
using HumeHub.Tasks.Contexts;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddGrpc();
builder.Services.AddGrpcReflection();

// Add DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Host=localhost;Database=tasks;Username=postgres;Password=postgres";
builder.Services.AddDbContext<TaskDbContext>(options =>
    options.UseNpgsql(connectionString));

var app = builder.Build();

app.UseGrpcWeb();

app.MapGrpcReflectionService();
app.MapGrpcService<TaskHub>();

app.MapGet("/", () => "gRPC server is running. Use grpcurl to list services.");

app.Run();
