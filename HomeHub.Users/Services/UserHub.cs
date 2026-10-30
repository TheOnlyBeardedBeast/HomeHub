using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using HomeHub.Users.Contexts;
using HomeHub.Users.Security;
using Microsoft.EntityFrameworkCore;
using GrpcStatusCode = Grpc.Core.StatusCode;
using UserEntity = HomeHub.Users.Entities.User;
using UserProto = HomeHub.Users.User;
using UserTypeEntity = HomeHub.Users.Entities.UserType;

namespace HomeHub.Users.Services;

public class UserHub : UserService.UserServiceBase
{
    private readonly IUserDbContext _dbContext;
    private readonly CurrentUser _currentUser;

    public UserHub(IUserDbContext dbContext, CurrentUser currentUser)
    {
        _dbContext = dbContext;
        _currentUser = currentUser;
    }

    public override async Task<CreateUserResponse> CreateUser(CreateUserRequest request, ServerCallContext context)
    {
        _currentUser.RequireAdmin();

        var fullName = request.FullName.Trim();
        if (string.IsNullOrEmpty(fullName))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Full name is required"));
        }

        if (!System.Enum.IsDefined(request.Type))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Unknown user type"));
        }

        var apiKey = ApiKeys.Generate();
        var user = new UserEntity
        {
            Id = Guid.NewGuid(),
            FullName = fullName,
            HashedApiKey = ApiKeys.Hash(apiKey),
            Type = (UserTypeEntity)request.Type
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        return new CreateUserResponse
        {
            User = MapToProtoUser(user),
            ApiKey = apiKey
        };
    }

    public override async Task<ListUsersResponse> ListUsers(ListUsersRequest request, ServerCallContext context)
    {
        var users = await _dbContext.Users.OrderBy(u => u.FullName).ToListAsync();

        var response = new ListUsersResponse();
        response.Users.AddRange(users.Select(MapToProtoUser));
        return response;
    }

    public override async Task<GetCurrentUserResponse> GetCurrentUser(GetCurrentUserRequest request, ServerCallContext context)
    {
        if (_currentUser.IsAdmin)
        {
            return new GetCurrentUserResponse { IsAdmin = true };
        }

        var userId = _currentUser.RequireUserId();
        var user = await _dbContext.Users.FindAsync(userId)
            ?? throw new RpcException(new Status(GrpcStatusCode.NotFound, $"User with ID {userId} not found"));

        return new GetCurrentUserResponse
        {
            User = MapToProtoUser(user),
            IsAdmin = false
        };
    }

    public override async Task<Empty> DeleteUser(DeleteUserRequest request, ServerCallContext context)
    {
        _currentUser.RequireAdmin();

        if (!Guid.TryParse(request.Id, out var userId))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "User ID must be a valid GUID"));
        }

        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.NotFound, $"User with ID {userId} not found"));
        }

        _dbContext.Users.Remove(user);
        await _dbContext.SaveChangesAsync();

        return new Empty();
    }

    private static UserProto MapToProtoUser(UserEntity user) => new()
    {
        Id = user.Id.ToString(),
        FullName = user.FullName,
        Type = (UserType)user.Type
    };
}
