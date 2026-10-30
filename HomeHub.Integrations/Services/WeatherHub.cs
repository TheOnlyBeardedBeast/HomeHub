using System.Globalization;
using System.Text.Json;
using Grpc.Core;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace HomeHub.Integrations.Services;

/// <summary>
/// Current conditions and today's outlook from weatherapi.com. The API key stays on the
/// server and the upstream response is cached for an hour, so displays can poll cheaply.
/// </summary>
public class WeatherHub : WeatherService.WeatherServiceBase
{
    private const string CacheKey = "weather:current";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(1);

    private readonly IMemoryCache _cache;
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<WeatherHub> _logger;

    public WeatherHub(
        IMemoryCache cache,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<WeatherHub> logger)
    {
        _cache = cache;
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public override async Task<GetWeatherResponse> GetWeather(
        GetWeatherRequest request,
        ServerCallContext context)
    {
        if (_cache.TryGetValue<Weather>(CacheKey, out var cached) && cached is not null)
        {
            return new GetWeatherResponse { Weather = cached };
        }

        var apiKey = _configuration["Weather:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return new GetWeatherResponse();
        }

        var location = _configuration["Weather:Location"];
        if (string.IsNullOrWhiteSpace(location))
        {
            location = "auto:ip";
        }

        try
        {
            var client = _httpClientFactory.CreateClient();
            var url = "https://api.weatherapi.com/v1/forecast.json" +
                      $"?key={Uri.EscapeDataString(apiKey)}" +
                      $"&q={Uri.EscapeDataString(location)}" +
                      "&days=1&aqi=no&alerts=no";
            using var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("WeatherAPI returned {StatusCode}", response.StatusCode);
                return new GetWeatherResponse();
            }

            using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            var root = document.RootElement;
            var current = root.GetProperty("current");
            var condition = current.GetProperty("condition");
            var today = root.GetProperty("forecast").GetProperty("forecastday")[0];
            var day = today.GetProperty("day");
            var astro = today.GetProperty("astro");

            var hourly = today.GetProperty("hour").EnumerateArray()
                .Select(hour => new HourlyTemperature
                {
                    Time = hour.GetProperty("time").GetString() ?? string.Empty,
                    TemperatureC = hour.GetProperty("temp_c").GetDouble(),
                });

            var weather = new Weather
            {
                Location = root.GetProperty("location").GetProperty("name").GetString() ?? string.Empty,
                TemperatureC = current.GetProperty("temp_c").GetDouble(),
                FeelsLikeC = current.GetProperty("feelslike_c").GetDouble(),
                Condition = condition.GetProperty("text").GetString() ?? string.Empty,
                IconUrl = condition.GetProperty("icon").GetString() ?? string.Empty,
                HighC = day.GetProperty("maxtemp_c").GetDouble(),
                LowC = day.GetProperty("mintemp_c").GetDouble(),
                ChanceOfRain = day.GetProperty("daily_chance_of_rain").GetInt32(),
                WindKph = current.GetProperty("wind_kph").GetDouble(),
                Humidity = current.GetProperty("humidity").GetInt32(),
                Sunrise = Clock(astro.GetProperty("sunrise").GetString()),
                Sunset = Clock(astro.GetProperty("sunset").GetString()),
                MoonPhase = astro.GetProperty("moon_phase").GetString() ?? string.Empty,
                MoonIllumination = Percent(astro.GetProperty("moon_illumination")),
            };
            weather.Hourly.AddRange(hourly);

            _cache.Set(CacheKey, weather, CacheDuration);
            return new GetWeatherResponse { Weather = weather };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Weather lookup failed");
            return new GetWeatherResponse();
        }
    }

    /// <summary>WeatherAPI uses a 12-hour clock; the house runs on a 24-hour one.</summary>
    private static string Clock(string? value) =>
        DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out var time)
            ? time.ToString("HH:mm", CultureInfo.InvariantCulture)
            : value ?? string.Empty;

    private static int Percent(JsonElement value) =>
        value.ValueKind == JsonValueKind.Number
            ? value.GetInt32()
            : int.TryParse(value.GetString(), out var parsed) ? parsed : 0;
}
