using DATSCompanion.Shared.Models;
using System.IO.Pipes;
using System.Runtime.InteropServices;

namespace DATSCompanionApp
{
    internal static class Program
    {
        /// <summary>
        ///  The main entry point for the application.
        /// </summary>
        private const string appName = Constants.AppName;

        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm(args));
        }
    }
}