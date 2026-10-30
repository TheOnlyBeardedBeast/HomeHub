namespace HomeHub.Hub.Hosting;

/// <summary>
/// OS-appropriate location for files that must outlive the application binary. The app data
/// folder is resolved explicitly per platform: <c>%LOCALAPPDATA%</c> on Windows,
/// <c>~/Library/Application Support</c> on macOS, and <c>$XDG_DATA_HOME</c> (or
/// <c>~/.local/share</c>) on Linux.
/// </summary>
public static class AppDataPaths
{
    public static string DatabasePath()
    {
        var folder = Path.Combine(AppDataFolder(), "HomeHub");
        Directory.CreateDirectory(folder);
        return Path.Combine(folder, "homehub.db");
    }

    private static string AppDataFolder()
    {
        if (OperatingSystem.IsWindows())
        {
            var local = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            return string.IsNullOrWhiteSpace(local)
                ? Path.Combine(HomeDirectory(), "AppData", "Local")
                : local;
        }

        if (OperatingSystem.IsMacOS())
        {
            return Path.Combine(HomeDirectory(), "Library", "Application Support");
        }

        var dataHome = Environment.GetEnvironmentVariable("XDG_DATA_HOME");
        return string.IsNullOrWhiteSpace(dataHome)
            ? Path.Combine(HomeDirectory(), ".local", "share")
            : dataHome;
    }

    private static string HomeDirectory()
    {
        var profile = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
        if (!string.IsNullOrWhiteSpace(profile))
        {
            return profile;
        }

        var home = Environment.GetEnvironmentVariable("HOME");
        if (!string.IsNullOrWhiteSpace(home))
        {
            return home;
        }

        // No home directory is available; keep the data next to the application rather than fail.
        return AppContext.BaseDirectory;
    }
}
