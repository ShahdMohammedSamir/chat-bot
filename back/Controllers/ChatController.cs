using Microsoft.AspNetCore.Mvc;
using testchat.Models;
using testchat.Services;

namespace testchat.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly OpenAIService _aiService;

        public ChatController(OpenAIService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ChatRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.UserMessage))
            {
                return BadRequest(new
                {
                    Error = "Invalid request",
                    Details = "Message cannot be empty"
                });
            }

            try
            {
                var response = await _aiService.GetChatResponse(request.UserMessage);
                return Ok(new ChatMessage
                {
                    UserMessage = request.UserMessage,
                    BotResponse = response
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Error = "Chat service unavailable",
                    Details = ex.Message
                });
            }
        }
    }

    // DTO 
    public class ChatRequest
    {
        public string UserMessage { get; set; }
    }

}
