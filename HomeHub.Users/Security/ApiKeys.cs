using System.Security.Cryptography;
using System.Text;

namespace HomeHub.Users.Security;

public static class ApiKeys
{
    private const int WordCount = 6;
    private const string WordListResource = "HomeHub.Users.Security.wordlist.txt";

    private static readonly string[] Words = LoadWords();

    // Six words from the BIP39 list give 66 bits of entropy — plenty for a
    // household key — and are far easier to read aloud or type than hex.
    public static string Generate() =>
        string.Join('-', Enumerable.Range(0, WordCount)
            .Select(_ => Words[RandomNumberGenerator.GetInt32(Words.Length)]));

    public static string Hash(string apiKey) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(apiKey)));

    private static string[] LoadWords()
    {
        using var stream = typeof(ApiKeys).Assembly.GetManifestResourceStream(WordListResource)
            ?? throw new InvalidOperationException($"Missing embedded word list '{WordListResource}'.");
        using var reader = new StreamReader(stream);
        return reader.ReadToEnd()
            .Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }
}
