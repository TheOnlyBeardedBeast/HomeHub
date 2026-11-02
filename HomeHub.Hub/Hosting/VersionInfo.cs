using System.Reflection;

namespace HomeHub.Hub.Hosting;

/// <summary>
/// The version stamped by the release build (<c>-p:Version</c>), without the source
/// revision metadata the SDK appends. Falls back to "unknown" for local builds.
/// </summary>
public static class VersionInfo
{
    public static string Version { get; } = Resolve();

    private static string Resolve()
    {
        var version = typeof(VersionInfo).Assembly
            .GetCustomAttribute<AssemblyInformationalVersionAttribute>()?
            .InformationalVersion;
        return string.IsNullOrWhiteSpace(version) ? "unknown" : version.Split('+')[0];
    }
}
