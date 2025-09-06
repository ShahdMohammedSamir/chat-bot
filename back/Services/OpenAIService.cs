using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace testchat.Services
{
    public class OpenAIService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _apiUrl;

        public OpenAIService(IConfiguration config)
        {
            _httpClient = new HttpClient();
            _apiKey = config["OpenRouter:ApiKey"] ?? throw new ArgumentNullException("API key not configured");
            _apiUrl = config["OpenRouter:ApiUrl"] ?? "https://openrouter.ai/api/v1/chat/completions";

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            _httpClient.DefaultRequestHeaders.Add("HTTP-Referer", "http://localhost:3000");
            _httpClient.DefaultRequestHeaders.Add("X-Title", "My Chat App");
        }

        public async Task<string> GetChatResponse(string message)
        {
            try
            {
                var requestData = new
                {
                    model = "deepseek/deepseek-chat",
                    messages = new[] { new { role = "user", content = message } }
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(requestData),
                    Encoding.UTF8,
                    "application/json");

                var response = await _httpClient.PostAsync(_apiUrl, content);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"API request failed: {response.StatusCode} - {responseBody}");
                }

                using var doc = JsonDocument.Parse(responseBody);
                return doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString() ?? "No response content";
            }
            catch (Exception ex)
            {
                throw new Exception("Error getting chat response: " + ex.Message);
            }
        }
    }
}
