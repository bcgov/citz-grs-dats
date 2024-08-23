using DATSCompanionApp;
using System;
using System.Collections.Concurrent;
using System.Net;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

public class WebSocketServerCommunicator : IServiceCommunicator
{
    private readonly HttpListener _httpListener;
    private readonly ConcurrentBag<WebSocket> _clients;

    public WebSocketServerCommunicator(string uriPrefix)
    {
        _httpListener = new HttpListener();
        _httpListener.Prefixes.Add(uriPrefix);
        _clients = new ConcurrentBag<WebSocket>();
    }

    public async Task StartAsync(CancellationToken cancellationToken = default)
    {
        _httpListener.Start();
        Console.WriteLine($"WebSocket server started at {_httpListener.Prefixes}");

        while (!cancellationToken.IsCancellationRequested)
        {
            // Wait for a client to connect
            HttpListenerContext httpContext = await _httpListener.GetContextAsync();

            if (httpContext.Request.IsWebSocketRequest)
            {
                // Accept the WebSocket connection
                HttpListenerWebSocketContext webSocketContext = await httpContext.AcceptWebSocketAsync(null);
                WebSocket webSocket = webSocketContext.WebSocket;

                Console.WriteLine("Client connected");

                // Add the client to the collection
                _clients.Add(webSocket);

                // Start listening for messages from the client
                _ = Task.Run(() => ListenForMessagesAsync(webSocket, cancellationToken));
            }
            else
            {
                // Respond with 400 Bad Request if it's not a WebSocket request
                httpContext.Response.StatusCode = 400;
                httpContext.Response.Close();
            }
        }
    }

    private async Task ListenForMessagesAsync(WebSocket webSocket, CancellationToken cancellationToken)
    {
        byte[] buffer = new byte[1024];

        try
        {
            while (webSocket.State == WebSocketState.Open && !cancellationToken.IsCancellationRequested)
            {
                WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), cancellationToken);

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", cancellationToken);
                    Console.WriteLine("WebSocket connection closed");
                    _clients.TryTake(out webSocket); // Remove client on close
                }
                else
                {
                    string receivedMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    Console.WriteLine($"Received: {receivedMessage}");
                }
            }
        }
        catch (WebSocketException ex)
        {
            Console.WriteLine($"WebSocket exception: {ex.Message}");
            _clients.TryTake(out webSocket); // Remove client on error
        }
    }

    public Task PostMessage(string message)
    {
        byte[] messageBuffer = Encoding.UTF8.GetBytes(message);

        foreach (var client in _clients)
        {
            if (client.State == WebSocketState.Open)
            {
                // Send the message to each connected client
                _ = client.SendAsync(new ArraySegment<byte>(messageBuffer), WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }
        return Task.CompletedTask;
    }
}
