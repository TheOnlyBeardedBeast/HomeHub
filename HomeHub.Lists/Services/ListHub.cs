using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using HomeHub.Lists.Contexts;
using HomeHub.Users.Security;
using Microsoft.EntityFrameworkCore;
using GrpcStatusCode = Grpc.Core.StatusCode;
using ListEntity = HomeHub.Lists.Entities.List;
using ListProto = HomeHub.Lists.List;

namespace HomeHub.Lists.Services;

public class ListHub : ListService.ListServiceBase
{
    private readonly IListDbContext _dbContext;
    private readonly CurrentUser _currentUser;

    public ListHub(IListDbContext dbContext, CurrentUser currentUser)
    {
        _dbContext = dbContext;
        _currentUser = currentUser;
    }

    public override async Task<CreateListResponse> CreateList(CreateListRequest request, ServerCallContext context)
    {
        if (request.List == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "List cannot be null"));
        }

        var listEntity = new ListEntity
        {
            Id = Guid.NewGuid(),
            Title = request.List.Title,
            Content = request.List.Content.ToArray(),
            CreatedBy = _currentUser.RequireUserId(),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Lists.Add(listEntity);
        await _dbContext.SaveChangesAsync();

        return new CreateListResponse
        {
            Id = listEntity.Id.ToString()
        };
    }

    public override async Task<GetListResponse> GetList(GetListRequest request, ServerCallContext context)
    {
        if (string.IsNullOrEmpty(request.Id))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "List ID cannot be null or empty"));
        }

        if (!Guid.TryParse(request.Id, out var listId))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "List ID must be a valid GUID"));
        }

        var listEntity = await _dbContext.Lists.FindAsync(listId);
        if (listEntity == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.NotFound, $"List with ID {listId} not found"));
        }

        return new GetListResponse
        {
            List = MapToProtoList(listEntity)
        };
    }

    public override async Task<Empty> UpdateList(UpdateListRequest request, ServerCallContext context)
    {
        if (request.List == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "List cannot be null"));
        }

        if (string.IsNullOrEmpty(request.List.Id))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "List ID cannot be null or empty"));
        }

        if (!Guid.TryParse(request.List.Id, out var listId))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "List ID must be a valid GUID"));
        }

        var listEntity = await _dbContext.Lists.FindAsync(listId);
        if (listEntity == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.NotFound, $"List with ID {listId} not found"));
        }

        // CreatedBy and CreatedAt are immutable.
        listEntity.Title = request.List.Title;
        listEntity.Content = request.List.Content.ToArray();
        listEntity.UpdatedAt = DateTime.UtcNow;

        _dbContext.Lists.Update(listEntity);
        await _dbContext.SaveChangesAsync();

        return new Empty();
    }

    public override async Task<Empty> DeleteList(DeleteListRequest request, ServerCallContext context)
    {
        if (string.IsNullOrEmpty(request.Id))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "List ID cannot be null or empty"));
        }

        if (!Guid.TryParse(request.Id, out var listId))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "List ID must be a valid GUID"));
        }

        var listEntity = await _dbContext.Lists.FindAsync(listId);
        if (listEntity == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.NotFound, $"List with ID {listId} not found"));
        }

        _dbContext.Lists.Remove(listEntity);
        await _dbContext.SaveChangesAsync();

        return new Empty();
    }

    public override async Task<ListListsResponse> ListLists(ListListsRequest request, ServerCallContext context)
    {
        var lists = await _dbContext.Lists.OrderBy(l => l.Title).ToListAsync();
        var response = new ListListsResponse();
        response.Lists.AddRange(lists.Select(MapToProtoList));

        return response;
    }

    private static ListProto MapToProtoList(ListEntity listEntity)
    {
        var protoList = new ListProto
        {
            Id = listEntity.Id.ToString(),
            Title = listEntity.Title,
            CreatedBy = listEntity.CreatedBy.ToString(),
            CreatedAt = Timestamp.FromDateTime(listEntity.CreatedAt)
        };

        protoList.Content.AddRange(listEntity.Content);

        if (listEntity.UpdatedAt.HasValue)
        {
            protoList.UpdatedAt = Timestamp.FromDateTime(listEntity.UpdatedAt.Value);
        }

        return protoList;
    }
}
