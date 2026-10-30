using System.Text.Json;
using Grpc.Core;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace HomeHub.Integrations.Services;

/// <summary>
/// The ZenQuotes quote of the day. No key is required; the upstream response is cached
/// for three hours so every display in the house shares one fetch.
/// </summary>
public class QuoteHub : QuoteService.QuoteServiceBase
{
    private const string CacheKey = "quote:today";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(3);

    private readonly IMemoryCache _cache;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<QuoteHub> _logger;

    public QuoteHub(
        IMemoryCache cache,
        IHttpClientFactory httpClientFactory,
        ILogger<QuoteHub> logger)
    {
        _cache = cache;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public override async Task<GetQuoteResponse> GetQuote(
        GetQuoteRequest request,
        ServerCallContext context)
    {
        if (_cache.TryGetValue<Quote>(CacheKey, out var cached) && cached is not null)
        {
            return new GetQuoteResponse { Quote = cached };
        }

        try
        {
            var client = _httpClientFactory.CreateClient();
            using var response = await client.GetAsync("https://zenquotes.io/api/today");
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("ZenQuotes returned {StatusCode}", response.StatusCode);
                return new GetQuoteResponse();
            }

            using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            var first = document.RootElement[0];
            var text = first.GetProperty("q").GetString();
            var author = first.GetProperty("a").GetString();

            // ZenQuotes reports rate limits with its own name in the author field.
            if (string.IsNullOrWhiteSpace(text) ||
                string.Equals(author, "ZenQuotes.io", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("ZenQuotes returned an error payload");
                return new GetQuoteResponse();
            }

            var quote = new Quote { Text = text, Author = author ?? string.Empty };
            _cache.Set(CacheKey, quote, CacheDuration);
            return new GetQuoteResponse { Quote = quote };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Quote lookup failed");
            return new GetQuoteResponse();
        }
    }
}
