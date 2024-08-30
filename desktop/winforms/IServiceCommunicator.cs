using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DATSCompanionApp
{
    public interface IServiceCommunicator
    {
        Task PostMessage(string message);
        Task StartAsync(CancellationToken cancellationToken = default);
        Task<string> PostAndReceiveMessage(string message);
    }
}
