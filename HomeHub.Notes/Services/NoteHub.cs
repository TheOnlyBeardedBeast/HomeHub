using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using HomeHub.Notes.Contexts;
using HomeHub.Users.Security;
using Microsoft.EntityFrameworkCore;
using GrpcStatusCode = Grpc.Core.StatusCode;
using NoteEntity = HomeHub.Notes.Entities.Note;
using NoteProto = HomeHub.Notes.Note;

namespace HomeHub.Notes.Services;

public class NoteHub : NoteService.NoteServiceBase
{
    private readonly INoteDbContext _dbContext;
    private readonly CurrentUser _currentUser;

    public NoteHub(INoteDbContext dbContext, CurrentUser currentUser)
    {
        _dbContext = dbContext;
        _currentUser = currentUser;
    }

    public override async Task<CreateNoteResponse> CreateNote(CreateNoteRequest request, ServerCallContext context)
    {
        if (request.Note == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Note cannot be null"));
        }

        var noteEntity = new NoteEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Note.Title,
            Content = request.Note.Content,
            CreatedBy = _currentUser.RequireUserId(),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Notes.Add(noteEntity);
        await _dbContext.SaveChangesAsync();

        return new CreateNoteResponse
        {
            Id = noteEntity.Id.ToString()
        };
    }

    public override async Task<GetNoteResponse> GetNote(GetNoteRequest request, ServerCallContext context)
    {
        if (string.IsNullOrEmpty(request.Id))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Note ID cannot be null or empty"));
        }

        if (!Guid.TryParse(request.Id, out var noteId))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Note ID must be a valid GUID"));
        }

        var noteEntity = await _dbContext.Notes.FindAsync(noteId);
        if (noteEntity == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.NotFound, $"Note with ID {noteId} not found"));
        }

        return new GetNoteResponse
        {
            Note = MapToProtoNote(noteEntity)
        };
    }

    public override async Task<Empty> UpdateNote(UpdateNoteRequest request, ServerCallContext context)
    {
        if (request.Note == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Note cannot be null"));
        }

        if (string.IsNullOrEmpty(request.Note.Id))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Note ID cannot be null or empty"));
        }

        if (!Guid.TryParse(request.Note.Id, out var noteId))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Note ID must be a valid GUID"));
        }

        var noteEntity = await _dbContext.Notes.FindAsync(noteId);
        if (noteEntity == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.NotFound, $"Note with ID {noteId} not found"));
        }

        // CreatedBy and CreatedAt are immutable.
        noteEntity.Title = request.Note.Title;
        noteEntity.Content = request.Note.Content;
        noteEntity.UpdatedAt = DateTime.UtcNow;

        _dbContext.Notes.Update(noteEntity);
        await _dbContext.SaveChangesAsync();

        return new Empty();
    }

    public override async Task<Empty> DeleteNote(DeleteNoteRequest request, ServerCallContext context)
    {
        if (string.IsNullOrEmpty(request.Id))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Note ID cannot be null or empty"));
        }

        if (!Guid.TryParse(request.Id, out var noteId))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Note ID must be a valid GUID"));
        }

        var noteEntity = await _dbContext.Notes.FindAsync(noteId);
        if (noteEntity == null)
        {
            throw new RpcException(new Status(GrpcStatusCode.NotFound, $"Note with ID {noteId} not found"));
        }

        _dbContext.Notes.Remove(noteEntity);
        await _dbContext.SaveChangesAsync();

        return new Empty();
    }

    public override async Task<ListNotesResponse> ListNotes(ListNotesRequest request, ServerCallContext context)
    {
        var notes = await _dbContext.Notes
            .OrderByDescending(n => n.UpdatedAt ?? n.CreatedAt)
            .ToListAsync();

        var response = new ListNotesResponse();
        response.Notes.AddRange(notes.Select(MapToProtoNote));

        return response;
    }

    public override async Task<SearchNotesResponse> SearchNotes(SearchNotesRequest request, ServerCallContext context)
    {
        if (string.IsNullOrEmpty(request.Query))
        {
            throw new RpcException(new Status(GrpcStatusCode.InvalidArgument, "Search query cannot be null or empty"));
        }

        var query = request.Query.ToLower();
        var notes = await _dbContext.Notes
            .Where(n => n.Title.ToLower().Contains(query) || n.Content.ToLower().Contains(query))
            .OrderByDescending(n => n.UpdatedAt ?? n.CreatedAt)
            .ToListAsync();

        var response = new SearchNotesResponse();
        response.Notes.AddRange(notes.Select(MapToProtoNote));

        return response;
    }

    #region Helper Methods

    private static NoteProto MapToProtoNote(NoteEntity noteEntity)
    {
        var protoNote = new NoteProto
        {
            Id = noteEntity.Id.ToString(),
            Title = noteEntity.Title,
            Content = noteEntity.Content,
            CreatedBy = noteEntity.CreatedBy.ToString(),
            CreatedAt = Timestamp.FromDateTime(noteEntity.CreatedAt)
        };

        if (noteEntity.UpdatedAt.HasValue)
        {
            protoNote.UpdatedAt = Timestamp.FromDateTime(noteEntity.UpdatedAt.Value);
        }

        return protoNote;
    }

    #endregion
}
