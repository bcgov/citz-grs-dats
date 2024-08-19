using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

namespace DATSCompanion.Shared
{
    public static class Win32Lib
    {
        // Function to get the network path
        [DllImport("mpr.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern int WNetGetUniversalName(
            string lpLocalPath,
            int dwInfoLevel,
            IntPtr lpBuffer,
            ref int lpBufferSize);

        public static string GetNetworkPath(string localPath)
        {
            const int UNIVERSAL_NAME_INFO_LEVEL = 1;
            const int ERROR_MORE_DATA = 234;

            int bufferSize = 660;
            IntPtr buffer = Marshal.AllocHGlobal(bufferSize);

            try
            {
                int result = WNetGetUniversalName(localPath, UNIVERSAL_NAME_INFO_LEVEL, buffer, ref bufferSize);

                if (result == ERROR_MORE_DATA)
                {
                    buffer = Marshal.ReAllocHGlobal(buffer, (IntPtr)bufferSize);
                    result = WNetGetUniversalName(localPath, UNIVERSAL_NAME_INFO_LEVEL, buffer, ref bufferSize);
                }

                if (result == 0)
                {
                    // Manually calculate where the path starts in the buffer
                    int offset = 8; // 8 bytes offset, after the initial header
                    string networkPath = Marshal.PtrToStringUni(buffer + offset);

                    return networkPath;
                }
                else
                {
                    return null;
                }
            }
            finally
            {
                Marshal.FreeHGlobal(buffer);
            }
        }
    }
}

