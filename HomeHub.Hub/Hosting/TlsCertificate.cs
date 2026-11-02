using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;

namespace HomeHub.Hub.Hosting;

/// <summary>
/// Loads a configured PFX or creates a persisted self-signed certificate for the HTTPS
/// listener. The generated certificate covers the current LAN addresses plus the hostnames
/// from <c>Tls:HostNames</c> (for example a NetBird DNS name). It is regenerated when a
/// required name is missing, so reinstall <c>homehub.crt</c> after changing the list.
/// </summary>
public static class TlsCertificate
{
    public static string SelfSignedCertificatePath =>
        Path.Combine(AppDataPaths.DataFolder(), "tls", "homehub.crt");

    private static string SelfSignedPfxPath =>
        Path.Combine(AppDataPaths.DataFolder(), "tls", "homehub.pfx");

    public static X509Certificate2 LoadOrCreate(IConfiguration configuration)
    {
        var configuredPath = configuration["Tls:CertificatePath"];
        if (!string.IsNullOrWhiteSpace(configuredPath))
        {
            return X509CertificateLoader.LoadPkcs12FromFile(
                configuredPath, configuration["Tls:CertificatePassword"]);
        }

        var addresses = LocalAddresses();
        var (customAddresses, customNames) = ParseHostNames(configuration["Tls:HostNames"]);
        var requiredAddresses = addresses.Concat(customAddresses).ToList();
        var requiredNames = RequiredNames(customNames);

        if (File.Exists(SelfSignedPfxPath))
        {
            var existing = X509CertificateLoader.LoadPkcs12FromFile(SelfSignedPfxPath, null);
            if (existing.NotAfter > DateTime.Now.AddDays(30)
                && HasNames(existing, requiredAddresses, requiredNames))
            {
                return existing;
            }

            existing.Dispose();
        }

        using var key = RSA.Create(2048);
        var request = new CertificateRequest(
            "CN=HomeHub", key, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
        request.CertificateExtensions.Add(new X509BasicConstraintsExtension(true, false, 0, true));
        request.CertificateExtensions.Add(
            new X509KeyUsageExtension(
                X509KeyUsageFlags.DigitalSignature
                    | X509KeyUsageFlags.KeyEncipherment
                    | X509KeyUsageFlags.KeyCertSign,
                true));
        request.CertificateExtensions.Add(
            new X509EnhancedKeyUsageExtension(
                new OidCollection { new("1.3.6.1.5.5.7.3.1") }, false));

        var names = new SubjectAlternativeNameBuilder();
        foreach (var name in requiredNames)
        {
            names.AddDnsName(name);
        }
        foreach (var address in requiredAddresses.Distinct())
        {
            names.AddIpAddress(address);
        }
        request.CertificateExtensions.Add(names.Build());

        using var selfSigned = request.CreateSelfSigned(
            DateTimeOffset.UtcNow.AddDays(-1), DateTimeOffset.UtcNow.AddYears(1));
        var certificate = X509CertificateLoader.LoadPkcs12(
            selfSigned.Export(X509ContentType.Pkcs12), null);

        Directory.CreateDirectory(Path.GetDirectoryName(SelfSignedPfxPath)!);
        File.WriteAllBytes(SelfSignedPfxPath, certificate.Export(X509ContentType.Pkcs12));
        File.WriteAllText(
            SelfSignedCertificatePath,
            "-----BEGIN CERTIFICATE-----\n"
                + Convert.ToBase64String(
                    certificate.Export(X509ContentType.Cert),
                    Base64FormattingOptions.InsertLineBreaks)
                + "\n-----END CERTIFICATE-----\n");
        return certificate;
    }

    private static List<IPAddress> LocalAddresses()
    {
        var addresses = new List<IPAddress> { IPAddress.Loopback, IPAddress.IPv6Loopback };
        foreach (var networkInterface in NetworkInterface.GetAllNetworkInterfaces())
        {
            if (networkInterface.OperationalStatus != OperationalStatus.Up
                || networkInterface.NetworkInterfaceType == NetworkInterfaceType.Loopback)
            {
                continue;
            }

            foreach (var unicast in networkInterface.GetIPProperties().UnicastAddresses)
            {
                var address = unicast.Address;
                if (address.AddressFamily is not (AddressFamily.InterNetwork or AddressFamily.InterNetworkV6)
                    || address.IsIPv6LinkLocal
                    || addresses.Contains(address))
                {
                    continue;
                }

                addresses.Add(address);
            }
        }

        return addresses;
    }

    private static bool HasNames(
        X509Certificate2 certificate,
        IReadOnlyCollection<IPAddress> addresses,
        IReadOnlyCollection<string> dnsNames)
    {
        var extension = certificate.Extensions["2.5.29.17"];
        if (extension is null)
        {
            return false;
        }

        var names = new X509SubjectAlternativeNameExtension(extension.RawData, extension.Critical);
        var presentAddresses = names.EnumerateIPAddresses().ToList();
        var presentNames = names.EnumerateDnsNames()
            .Select(name => name.TrimEnd('.'))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        return addresses.All(presentAddresses.Contains)
            && dnsNames.All(presentNames.Contains);
    }

    private static IReadOnlyCollection<string> RequiredNames(IReadOnlyCollection<string> customNames) =>
        new[] { "localhost", Environment.MachineName }
            .Concat(customNames)
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

    /// <summary>
    /// Accepts comma/semicolon separated hostnames, IPs, or full URLs
    /// (e.g. <c>homehub.netbird.cloud,https://tablet.example:5443</c>).
    /// </summary>
    private static (List<IPAddress> Addresses, List<string> Names) ParseHostNames(string? value)
    {
        var addresses = new List<IPAddress>();
        var names = new List<string>();
        foreach (var entry in (value ?? string.Empty).Split(
                     [',', ';'],
                     StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            var host = ExtractHost(entry);
            if (string.IsNullOrWhiteSpace(host))
            {
                continue;
            }

            if (IPAddress.TryParse(host.Trim('[', ']'), out var address))
            {
                if (!addresses.Contains(address))
                {
                    addresses.Add(address);
                }
            }
            else if (!names.Contains(host, StringComparer.OrdinalIgnoreCase))
            {
                names.Add(host);
            }
        }

        return (addresses, names);
    }

    private static string ExtractHost(string value)
    {
        if (Uri.TryCreate(value, UriKind.Absolute, out var uri)
            && !string.IsNullOrWhiteSpace(uri.Host))
        {
            return uri.Host.Trim('[', ']');
        }

        var text = value.Trim();
        if (text.StartsWith('['))
        {
            var end = text.IndexOf(']');
            return end > 0 ? text[1..end] : text;
        }

        // Bare "host:port" (not an IPv6 literal, which contains several colons).
        if (text.Count(c => c == ':') == 1)
        {
            var separator = text.LastIndexOf(':');
            if (int.TryParse(text[(separator + 1)..], out _))
            {
                return text[..separator];
            }
        }

        return text;
    }
}
