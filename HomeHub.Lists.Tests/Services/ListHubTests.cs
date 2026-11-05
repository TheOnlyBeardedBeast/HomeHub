using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using HomeHub.Hub.Contexts;
using HomeHub.Lists.Services;
using HomeHub.Users.Security;
using Microsoft.EntityFrameworkCore;
using Xunit;
using ListEntity = HomeHub.Lists.Entities.List;
using ListProto = HomeHub.Lists.List;

namespace HomeHub.Lists.Tests.Services;

public class ListHubTests
{
    private static readonly Guid User1 = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid User2 = Guid.Parse("22222222-2222-2222-2222-222222222222");

    private HubDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<HubDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new HubDbContext(options);
    }

    private static CurrentUser CreateCurrentUser(Guid? userId = null) => new()
    {
        UserId = userId ?? User1,
        FullName = "Test User"
    };

    private static ListHub CreateListHub(HubDbContext dbContext) => new(dbContext, CreateCurrentUser());

    [Fact]
    public async Task CreateList_WithValidList_CreatesListSuccessfully()
    {
        var dbContext = CreateInMemoryDbContext();
        var listHub = CreateListHub(dbContext);

        var request = new CreateListRequest
        {
            List = new ListProto
            {
                Title = "Groceries"
            }
        };
        request.List.Content.AddRange(new[] { "Milk", "Eggs" });

        var response = await listHub.CreateList(request, null!);

        var saved = await dbContext.Lists.SingleAsync();
        Assert.Equal(response.Id, saved.Id.ToString());
        Assert.Equal("Groceries", saved.Title);
        Assert.Equal(new[] { "Milk", "Eggs" }, saved.Content);
        Assert.Equal(User1, saved.CreatedBy);
        Assert.Null(saved.UpdatedAt);
    }

    [Fact]
    public async Task GetList_WithValidId_ReturnsListWithContent()
    {
        var dbContext = CreateInMemoryDbContext();
        var entity = new ListEntity
        {
            Id = Guid.NewGuid(),
            Title = "Wishlist",
            Content = new[] { "Bike", "Tent" },
            CreatedBy = User2,
            CreatedAt = DateTime.UtcNow
        };
        dbContext.Lists.Add(entity);
        await dbContext.SaveChangesAsync();

        var response = await CreateListHub(dbContext).GetList(
            new GetListRequest { Id = entity.Id.ToString() }, null!);

        Assert.Equal("Wishlist", response.List.Title);
        Assert.Equal(new[] { "Bike", "Tent" }, response.List.Content);
        Assert.Equal(User2.ToString(), response.List.CreatedBy);
    }

    [Fact]
    public async Task UpdateList_WithValidList_UpdatesSuccessfully()
    {
        var dbContext = CreateInMemoryDbContext();
        var entity = new ListEntity
        {
            Id = Guid.NewGuid(),
            Title = "Groceries",
            Content = new[] { "Milk" },
            CreatedBy = User1,
            CreatedAt = DateTime.UtcNow
        };
        dbContext.Lists.Add(entity);
        await dbContext.SaveChangesAsync();

        var request = new UpdateListRequest
        {
            List = new ListProto
            {
                Id = entity.Id.ToString(),
                Title = "Weekly groceries",
                CreatedBy = User2.ToString(),
                Version = entity.Version
            }
        };
        request.List.Content.AddRange(new[] { "Milk", "Bread", "Apples" });

        await CreateListHub(dbContext).UpdateList(request, null!);

        var updated = await dbContext.Lists.SingleAsync();
        Assert.Equal("Weekly groceries", updated.Title);
        Assert.Equal(new[] { "Milk", "Bread", "Apples" }, updated.Content);
        Assert.Equal(User1, updated.CreatedBy);
        Assert.NotNull(updated.UpdatedAt);
        Assert.Equal(2, updated.Version);
    }

    [Fact]
    public async Task UpdateList_WithStaleVersion_ThrowsAborted()
    {
        var dbContext = CreateInMemoryDbContext();
        var entity = new ListEntity
        {
            Id = Guid.NewGuid(),
            Title = "Groceries",
            Content = new[] { "Milk" },
            CreatedBy = User1,
            CreatedAt = DateTime.UtcNow
        };
        dbContext.Lists.Add(entity);
        await dbContext.SaveChangesAsync();

        var request = new UpdateListRequest
        {
            List = new ListProto
            {
                Id = entity.Id.ToString(),
                Title = "Stale edit",
                Version = entity.Version + 1
            }
        };

        var exception = await Assert.ThrowsAsync<RpcException>(
            () => CreateListHub(dbContext).UpdateList(request, null!));

        Assert.Equal(StatusCode.Aborted, exception.Status.StatusCode);
        Assert.Equal("Groceries", (await dbContext.Lists.SingleAsync()).Title);
    }

    [Fact]
    public async Task UpdateList_WithStaleVersionAndForce_Overwrites()
    {
        var dbContext = CreateInMemoryDbContext();
        var entity = new ListEntity
        {
            Id = Guid.NewGuid(),
            Title = "Groceries",
            Content = new[] { "Milk" },
            CreatedBy = User1,
            CreatedAt = DateTime.UtcNow
        };
        dbContext.Lists.Add(entity);
        await dbContext.SaveChangesAsync();

        var request = new UpdateListRequest
        {
            Force = true,
            List = new ListProto
            {
                Id = entity.Id.ToString(),
                Title = "Latest shopping",
                Version = entity.Version + 1
            }
        };
        request.List.Content.Add("Bread");

        await CreateListHub(dbContext).UpdateList(request, null!);

        var updated = await dbContext.Lists.SingleAsync();
        Assert.Equal("Latest shopping", updated.Title);
        Assert.Equal(2, updated.Version);
    }

    [Fact]
    public async Task DeleteList_WithValidId_RemovesList()
    {
        var dbContext = CreateInMemoryDbContext();
        var entity = new ListEntity
        {
            Id = Guid.NewGuid(),
            Title = "Groceries",
            Content = new[] { "Milk" },
            CreatedBy = User1,
            CreatedAt = DateTime.UtcNow
        };
        dbContext.Lists.Add(entity);
        await dbContext.SaveChangesAsync();

        await CreateListHub(dbContext).DeleteList(
            new DeleteListRequest { Id = entity.Id.ToString() }, null!);

        Assert.Empty(dbContext.Lists);
    }

    [Fact]
    public async Task SetPriorityList_KeepsExactlyOnePrioritizedFirst()
    {
        var dbContext = CreateInMemoryDbContext();
        var groceries = new ListEntity
        {
            Id = Guid.NewGuid(),
            Title = "Groceries",
            Content = new[] { "Milk" },
            CreatedBy = User1,
            CreatedAt = DateTime.UtcNow
        };
        var packing = new ListEntity
        {
            Id = Guid.NewGuid(),
            Title = "Packing",
            Content = new[] { "Tent" },
            CreatedBy = User1,
            CreatedAt = DateTime.UtcNow
        };
        dbContext.Lists.AddRange(groceries, packing);
        await dbContext.SaveChangesAsync();
        var hub = CreateListHub(dbContext);

        await hub.SetPriorityList(
            new SetPriorityListRequest { Id = packing.Id.ToString(), Prioritized = true }, null!);

        var response = await hub.ListLists(new ListListsRequest(), null!);
        Assert.Equal(packing.Id.ToString(), response.Lists[0].Id);
        Assert.True(response.Lists[0].Prioritized);
        Assert.False(response.Lists[1].Prioritized);

        await hub.SetPriorityList(
            new SetPriorityListRequest { Id = groceries.Id.ToString(), Prioritized = true }, null!);

        response = await hub.ListLists(new ListListsRequest(), null!);
        Assert.Equal(groceries.Id.ToString(), response.Lists[0].Id);
        Assert.True(response.Lists[0].Prioritized);
        Assert.False(response.Lists[1].Prioritized);

        await hub.SetPriorityList(
            new SetPriorityListRequest { Id = groceries.Id.ToString(), Prioritized = false }, null!);

        response = await hub.ListLists(new ListListsRequest(), null!);
        Assert.All(response.Lists, list => Assert.False(list.Prioritized));
    }

    [Fact]
    public async Task ListLists_ReturnsAllLists()
    {
        var dbContext = CreateInMemoryDbContext();
        dbContext.Lists.AddRange(
            new ListEntity
            {
                Id = Guid.NewGuid(),
                Title = "Groceries",
                Content = new[] { "Milk" },
                CreatedBy = User1,
                CreatedAt = DateTime.UtcNow
            },
            new ListEntity
            {
                Id = Guid.NewGuid(),
                Title = "Wishlist",
                Content = new[] { "Bike" },
                CreatedBy = User2,
                CreatedAt = DateTime.UtcNow
            });
        await dbContext.SaveChangesAsync();

        var response = await CreateListHub(dbContext).ListLists(new ListListsRequest(), null!);

        Assert.Equal(2, response.Lists.Count);
        Assert.Contains(response.Lists, l => l.Title == "Groceries" && l.Content.Contains("Milk"));
        Assert.Contains(response.Lists, l => l.Title == "Wishlist" && l.Content.Contains("Bike"));
    }
}
