using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration.Install;
using System.Linq;
using System.ServiceProcess;
using System.Threading.Tasks;

namespace DATSCompanionService
{
    [RunInstaller(true)]
    public partial class DATSCompanionServiceInstaller : System.Configuration.Install.Installer
    {
        public DATSCompanionServiceInstaller()
        {
            InitializeComponent();
            ServiceProcessInstaller processInstaller = new ServiceProcessInstaller();
            ServiceInstaller serviceInstaller = new ServiceInstaller();

            processInstaller.Account = ServiceAccount.LocalSystem;
            serviceInstaller.ServiceName = "DATSCompanionService";
            serviceInstaller.Description = "A DATS BC Service";
            serviceInstaller.StartType = ServiceStartMode.Automatic;

            Installers.Add(processInstaller);
            Installers.Add(serviceInstaller);
        }
    }
}
