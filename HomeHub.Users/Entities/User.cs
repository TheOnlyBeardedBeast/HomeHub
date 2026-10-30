namespace HomeHub.Users.Entities;

public enum UserType
{
    /// <summary>A person signed in on their own device.</summary>
    EndUser = 0,

    /// <summary>A shared screen the whole household uses.</summary>
    Display = 1,
}

public class User
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string HashedApiKey { get; set; } = string.Empty;
    public UserType Type { get; set; }
}
