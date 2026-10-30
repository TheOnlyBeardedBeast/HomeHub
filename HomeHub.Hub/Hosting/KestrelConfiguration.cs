using Microsoft.AspNetCore.Server.Kestrel.Core;

namespace HomeHub.Hub.Hosting;

public static class KestrelConfiguration
{
    private const int Http1Port = 5000;
    private const int Http2Port = 5001;

    /// <summary>
    /// Plaintext Kestrel cannot negotiate HTTP/1.1 and HTTP/2 on one port (no ALPN), so
    /// HTTP/1.1 (gRPC-Web and the ICS download) and HTTP/2 (gRPC) get separate listeners.
    /// ListenAnyIP keeps the hub reachable from display devices on the LAN.
    /// </summary>
    public static void ConfigureHomeHubKestrel(this WebApplicationBuilder builder)
    {
        builder.WebHost.ConfigureKestrel(serverOptions =>
        {
            serverOptions.ListenAnyIP(Http1Port, listenOptions =>
            {
                listenOptions.Protocols = HttpProtocols.Http1;
            });
            serverOptions.ListenAnyIP(Http2Port, listenOptions =>
            {
                listenOptions.Protocols = HttpProtocols.Http2;
            });
        });
    }
}
