using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DATSCompanionService.Interfaces
{
    public interface IBroadcastService
    {
        void NotifyClients(string payload);

    }

}
