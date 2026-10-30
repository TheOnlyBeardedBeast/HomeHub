using Grpc.Core;
using HomeHub.Hub.Contexts;
using HomeHub.Users.Security;
using HomeHub.Users.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;
using UserEntity = HomeHub.Users.Entities.User;
using UserTypeEntity = HomeHub.Users.Entities.UserType;
using UserTypeProto = HomeHub.Users.UserType;

namespace HomeHub.Users.Tests.Services;

public class UserHubTests
{
    private static readonly Guid User1 = Guid.Parse("11111111-1111-1111-1111-111111111111");

    private HubDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<HubDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new HubDbContext(options);
    }

    private static UserHub CreateUserHub(HubDbContext dbContext, CurrentUser? currentUser = null) =>
        new(dbContext, currentUser ?? new CurrentUser { IsAdmin = true });

    [Fact]
    public async Task CreateUser_WithoutAdminKey_ThrowsPermissionDenied()
    {
        var dbContext = CreateInMemoryDbContext();
        var userHub = CreateUserHub(dbContext, new CurrentUser { UserId = User1 });

        var exception = await Assert.ThrowsAsync<RpcException>(
            () => userHub.CreateUser(new CreateUserRequest { FullName = "Alice" }, null!));

        Assert.Equal(StatusCode.PermissionDenied, exception.Status.StatusCode);
        Assert.Empty(dbContext.Users);
    }

    [Fact]
    public async Task CreateUser_WithAdminKey_ReturnsApiKeyAndStoresOnlyItsHash()
    {
        var dbContext = CreateInMemoryDbContext();
        var userHub = CreateUserHub(dbContext);

        var response = await userHub.CreateUser(new CreateUserRequest { FullName = "  Alice  " }, null!);

        Assert.True(Guid.TryParse(response.User.Id, out _));
        Assert.Equal("Alice", response.User.FullName);
        Assert.NotEmpty(response.ApiKey);

        var saved = await dbContext.Users.SingleAsync();
        Assert.Equal(response.User.Id, saved.Id.ToString());
        Assert.Equal("Alice", saved.FullName);
        Assert.NotEqual(response.ApiKey, saved.HashedApiKey);
        Assert.Equal(ApiKeys.Hash(response.ApiKey), saved.HashedApiKey);
    }

    [Fact]
    public async Task CreateUser_WithBlankName_ThrowsInvalidArgument()
    {
        var dbContext = CreateInMemoryDbContext();
        var userHub = CreateUserHub(dbContext);

        var exception = await Assert.ThrowsAsync<RpcException>(
            () => userHub.CreateUser(new CreateUserRequest { FullName = "   " }, null!));

        Assert.Equal(StatusCode.InvalidArgument, exception.Status.StatusCode);
        Assert.Empty(dbContext.Users);
    }

    [Fact]
    public async Task CreateUser_GeneratesSixWordMnemonicKey()
    {
        var dbContext = CreateInMemoryDbContext();
        var userHub = CreateUserHub(dbContext);

        var first = await userHub.CreateUser(new CreateUserRequest { FullName = "Alice" }, null!);
        var second = await userHub.CreateUser(new CreateUserRequest { FullName = "Bob" }, null!);

        var words = first.ApiKey.Split('-');
        Assert.Equal(6, words.Length);
        Assert.All(words, word => Assert.Matches("^[a-z]{3,8}$", word));
        Assert.NotEqual(first.ApiKey, second.ApiKey);
        Assert.Equal(
            ApiKeys.Hash(first.ApiKey),
            (await dbContext.Users.SingleAsync(u => u.FullName == "Alice")).HashedApiKey);
    }

    [Fact]
    public async Task CreateUser_DefaultsToEndUserType()
    {
        var dbContext = CreateInMemoryDbContext();

        var response = await CreateUserHub(dbContext)
            .CreateUser(new CreateUserRequest { FullName = "Alice" }, null!);

        Assert.Equal(UserTypeProto.EndUser, response.User.Type);
        Assert.Equal(UserTypeEntity.EndUser, (await dbContext.Users.SingleAsync()).Type);
    }

    [Fact]
    public async Task CreateUser_WithDisplayType_StoresAndReturnsDisplay()
    {
        var dbContext = CreateInMemoryDbContext();

        var response = await CreateUserHub(dbContext).CreateUser(
            new CreateUserRequest { FullName = "Kitchen display", Type = UserTypeProto.Display },
            null!);

        Assert.Equal(UserTypeProto.Display, response.User.Type);
        Assert.Equal(UserTypeEntity.Display, (await dbContext.Users.SingleAsync()).Type);
    }

    [Fact]
    public async Task CreateUser_WithUnknownType_ThrowsInvalidArgument()
    {
        var dbContext = CreateInMemoryDbContext();

        var exception = await Assert.ThrowsAsync<RpcException>(
            () => CreateUserHub(dbContext).CreateUser(
                new CreateUserRequest { FullName = "Alice", Type = (UserTypeProto)99 },
                null!));

        Assert.Equal(StatusCode.InvalidArgument, exception.Status.StatusCode);
        Assert.Empty(dbContext.Users);
    }

    [Fact]
    public async Task ListUsers_ReturnsUsersOrderedByName()
    {
        var dbContext = CreateInMemoryDbContext();
        dbContext.Users.AddRange(
            new UserEntity { Id = Guid.NewGuid(), FullName = "Zoe", HashedApiKey = "z" },
            new UserEntity { Id = Guid.NewGuid(), FullName = "Alice", HashedApiKey = "a" });
        await dbContext.SaveChangesAsync();

        var response = await CreateUserHub(dbContext).ListUsers(new ListUsersRequest(), null!);

        Assert.Equal(new[] { "Alice", "Zoe" }, response.Users.Select(u => u.FullName));
    }

    [Fact]
    public async Task ListUsers_ReturnsEachUsersType()
    {
        var dbContext = CreateInMemoryDbContext();
        dbContext.Users.AddRange(
            new UserEntity { Id = Guid.NewGuid(), FullName = "Alice", HashedApiKey = "a" },
            new UserEntity
            {
                Id = Guid.NewGuid(),
                FullName = "Kitchen display",
                HashedApiKey = "k",
                Type = UserTypeEntity.Display
            });
        await dbContext.SaveChangesAsync();

        var response = await CreateUserHub(dbContext).ListUsers(new ListUsersRequest(), null!);

        Assert.Equal(UserTypeProto.EndUser, response.Users.Single(u => u.FullName == "Alice").Type);
        Assert.Equal(
            UserTypeProto.Display,
            response.Users.Single(u => u.FullName == "Kitchen display").Type);
    }

    [Fact]
    public async Task GetCurrentUser_AsAdmin_ReturnsAdminWithoutUser()
    {
        var dbContext = CreateInMemoryDbContext();

        var response = await CreateUserHub(dbContext)
            .GetCurrentUser(new GetCurrentUserRequest(), null!);

        Assert.True(response.IsAdmin);
        Assert.Null(response.User);
    }

    [Fact]
    public async Task GetCurrentUser_AsUser_ReturnsThatUser()
    {
        var dbContext = CreateInMemoryDbContext();
        var user = new UserEntity { Id = User1, FullName = "Alice", HashedApiKey = "a" };
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        var userHub = CreateUserHub(dbContext, new CurrentUser { UserId = User1 });

        var response = await userHub.GetCurrentUser(new GetCurrentUserRequest(), null!);

        Assert.False(response.IsAdmin);
        Assert.Equal(User1.ToString(), response.User.Id);
        Assert.Equal("Alice", response.User.FullName);
    }

    [Fact]
    public async Task DeleteUser_WithAdminKey_RemovesUser()
    {
        var dbContext = CreateInMemoryDbContext();
        var user = new UserEntity { Id = User1, FullName = "Alice", HashedApiKey = "a" };
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        await CreateUserHub(dbContext).DeleteUser(new DeleteUserRequest { Id = User1.ToString() }, null!);

        Assert.Empty(dbContext.Users);
    }

    [Fact]
    public async Task DeleteUser_WithoutAdminKey_ThrowsPermissionDenied()
    {
        var dbContext = CreateInMemoryDbContext();
        var user = new UserEntity { Id = User1, FullName = "Alice", HashedApiKey = "a" };
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        var userHub = CreateUserHub(dbContext, new CurrentUser { UserId = User1 });

        var exception = await Assert.ThrowsAsync<RpcException>(
            () => userHub.DeleteUser(new DeleteUserRequest { Id = User1.ToString() }, null!));

        Assert.Equal(StatusCode.PermissionDenied, exception.Status.StatusCode);
        Assert.Single(dbContext.Users);
    }

    [Fact]
    public async Task DeleteUser_WithInvalidId_ThrowsInvalidArgument()
    {
        var dbContext = CreateInMemoryDbContext();

        var exception = await Assert.ThrowsAsync<RpcException>(
            () => CreateUserHub(dbContext).DeleteUser(new DeleteUserRequest { Id = "nope" }, null!));

        Assert.Equal(StatusCode.InvalidArgument, exception.Status.StatusCode);
    }

    [Fact]
    public async Task DeleteUser_WithUnknownId_ThrowsNotFound()
    {
        var dbContext = CreateInMemoryDbContext();

        var exception = await Assert.ThrowsAsync<RpcException>(
            () => CreateUserHub(dbContext).DeleteUser(
                new DeleteUserRequest { Id = Guid.NewGuid().ToString() }, null!));

        Assert.Equal(StatusCode.NotFound, exception.Status.StatusCode);
    }
}
