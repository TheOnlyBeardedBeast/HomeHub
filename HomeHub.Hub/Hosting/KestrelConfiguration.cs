using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.AspNetCore.Server.Kestrel.Https;

namespace HomeHub.Hub.Hosting;

public static class KestrelConfiguration
{
    private const int Http1Port = 5000;
    private const int Http2Port = 5001;

    /// <summary>
    /// Plaintext Kestrel cannot negotiate HTTP/1.1 and HTTP/2 on one port (no ALPN), so
    /// HTTP/1.1 (gRPC-Web and the ICS download) and HTTP/2 (gRPC) get separate listeners.
    /// ListenAnyIP keeps the hub reachable from display devices on the LAN. When TLS is
    /// enabled an additional HTTPS listener serves both protocols via ALPN.
    /// </summary>
    public static void ConfigureHomeHubKestrel(this WebApplicationBuilder builder)
    {
        X509Certificate2? certificate = null;
        if (builder.Configuration.GetValue("Tls:Enabled", false))
        {
            certificate = TlsCertificate.LoadOrCreate(builder.Configuration);
        }

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

            if (certificate is not null)
            {
                serverOptions.ListenAnyIP(
                    builder.Configuration.GetValue("Tls:Port", 5443),
                    listenOptions =>
                    {
                        listenOptions.Protocols = HttpProtocols.Http1AndHttp2;
                        listenOptions.UseHttps(certificate);
                    });
            }
        });
    }
}
