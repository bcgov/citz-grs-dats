using DATSCompanion.Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Tasks;

namespace DATSCompanionApp
{
    public class WebSocketServiceCommunicator : IServiceCommunicator
    {
        public void PostMessage(string message)
        {
            Uri serverUri = new Uri($"{Constants.WebSocketListener}{Constants.DesktopSocketEndpoint}");
            using (ClientWebSocket webSocket = new ClientWebSocket())
            {
                try
                {
                    // Connect to the WebSocket server
                    var connectTask = webSocket.ConnectAsync(serverUri, CancellationToken.None);
                    connectTask.Wait();
                    Console.WriteLine("Connected to the WebSocket server.");

                    // Send a message to the server
                    ArraySegment<byte> bytesToSend = new ArraySegment<byte>(Encoding.UTF8.GetBytes(message));
                    var sendTask = webSocket.SendAsync(bytesToSend, WebSocketMessageType.Text, true, CancellationToken.None);
                    sendTask.Wait();
                    Console.WriteLine("Message sent to the server.");

                    //// Receive a message from the server
                    //byte[] buffer = new byte[1024];
                    //ArraySegment<byte> bytesReceived = new ArraySegment<byte>(buffer);
                    //WebSocketReceiveResult result = await webSocket.ReceiveAsync(bytesReceived, CancellationToken.None);
                    //string response = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    //Console.WriteLine("Message received from server: " + response);

                    // Close the WebSocket connection
                    var closeTask = webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Client closing", CancellationToken.None);
                    closeTask.Wait();
                    Console.WriteLine("WebSocket connection closed.");
                }
                catch (WebSocketException e)
                {
                    Console.WriteLine("WebSocket error: " + e.Message);
                }
            }
        }
    }
}
