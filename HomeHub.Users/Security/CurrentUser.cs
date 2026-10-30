using Grpc.Core;
using GrpcStatusCode = Grpc.Core.StatusCode;

namespace HomeHub.Users.Security;

/// <summary>
/// Request-scoped identity populated by the API key middleware in HomeHub.Hub.
/// </summary>
public class CurrentUser
{
    public Guid? UserId { get; set; }

    public string? FullName { get; set; }

    public bool IsAdmin { get; set; }

    public Guid RequireUserId() =>
        UserId ?? throw new RpcException(new Status(
            GrpcStatusCode.PermissionDenied,
            "A user API key is required for this operation."));

    public void RequireAdmin()
    {
        if (!IsAdmin)
        {
            throw new RpcException(new Status(
                GrpcStatusCode.PermissionDenied,
                "The admin API key is required for this operation."));
        }
    }
}
