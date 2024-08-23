using DATSCompanion.Shared.Models;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security.AccessControl;
using System.Security.Cryptography;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;

namespace DATSCompanionApp.Helpers
{
    public class TechnicalMetadataGenerator
    {
        public static List<DATSFileInformation> Generate(string folder, IProgress<Tuple<int, string>> progress = null)
        {
            var fileList = Directory.GetFiles(folder, "*.*", SearchOption.AllDirectories);
            ConcurrentBag<DATSFileInformation> fileDetailsBag = new ConcurrentBag<DATSFileInformation>();

            int totalFiles = fileList.Length;
            int processedFiles = 0;

            Parallel.ForEach(fileList, file =>
            {
                FileInfo fileInfo = new FileInfo(file);
                DATSFileInformation details = new DATSFileInformation
                {
                    Path = fileInfo.FullName,
                    FileName = fileInfo.Name,
                    Checksum = GetFileChecksum(file),
                    DateCreated = fileInfo.CreationTime,
                    DateModified = fileInfo.LastWriteTime,
                    DateAccessed = fileInfo.LastAccessTime,
                    DateLastSaved = fileInfo.LastWriteTime,
                    Owner = "", // GetOwner(file),
                    Computer = Environment.MachineName,
                    ContentType = GetMimeType(file),
                    AssociatedProgramName = GetAssociatedProgramName(file),
                    SizeInBytes = fileInfo.Length
                };
                fileDetailsBag.Add(details);
                // Increment the processed files counter and report progress
                int currentCount = Interlocked.Increment(ref processedFiles);
                progress?.Report(Tuple.Create((currentCount * 100) / totalFiles, fileInfo.Name));
            });

            return fileDetailsBag.ToList();
        }

        static string GetOwner(string filePath)
        {
            FileInfo fileInfo = new FileInfo(filePath);
            FileSecurity fileSecurity = fileInfo.GetAccessControl();
            IdentityReference identityReference = fileSecurity.GetOwner(typeof(NTAccount));
            return identityReference.ToString();
        }

        static string GetMimeType(string extension)
        {
            switch (extension.ToLower())
            {
                case ".txt": return "text/plain";
                case ".htm":
                case ".html": return "text/html";
                case ".css": return "text/css";
                case ".js": return "application/javascript";
                case ".json": return "application/json";
                case ".xml": return "application/xml";
                case ".png": return "image/png";
                case ".jpg":
                case ".jpeg": return "image/jpeg";
                case ".gif": return "image/gif";
                case ".bmp": return "image/bmp";
                case ".wav": return "audio/wav";
                case ".mp3": return "audio/mpeg";
                case ".ogg": return "audio/ogg";
                case ".mp4": return "video/mp4";
                case ".avi": return "video/x-msvideo";
                default: return "application/octet-stream";
            }
        }

        static string GetAssociatedProgramName(string filePath)
        {
            StringBuilder progName = new StringBuilder(255);
            uint progNameLength = (uint)progName.Capacity;

            AssocQueryString(AssocF.Verify, AssocStr.FriendlyAppName, Path.GetExtension(filePath), null, progName, ref progNameLength);

            return progName.ToString();
        }

        [DllImport("Shlwapi.dll", CharSet = CharSet.Auto)]
        private static extern uint AssocQueryString(AssocF flags, AssocStr str, string pszAssoc, string pszExtra, StringBuilder pszOut, ref uint pcchOut);

        [Flags]
        private enum AssocF
        {
            Init_NoRemapCLSID = 0x1,
            Init_ByExeName = 0x2,
            Open_ByExeName = 0x2,
            Init_DefaultToStar = 0x4,
            Init_DefaultToFolder = 0x8,
            NoUserSettings = 0x10,
            NoTruncate = 0x20,
            Verify = 0x40,
            RemapRunDll = 0x80,
            NoFixUps = 0x100,
            IgnoreBaseClass = 0x200
        }

        private enum AssocStr
        {
            Command = 1,
            Executable,
            FriendlyDocName,
            FriendlyAppName,
            NoOpen,
            ShellNewValue,
            DDECommand,
            DDEIfExec,
            DDEApplication,
            DDETopic,
            InfoTip,
            QuickTip,
            TileInfo,
            ContentType,
            DefaultIcon,
            ShellExtension,
            DropTarget,
            DelegateExecute,
            SupportedUriProtocols,
            Max
        }
        private static string GetFileChecksum(string filePath)
        {
            using (FileStream stream = File.OpenRead(filePath))
            {
                SHA1 sha1 = SHA1.Create();
                byte[] hash = sha1.ComputeHash(stream);
                StringBuilder sb = new StringBuilder();
                foreach (byte b in hash)
                {
                    sb.Append(b.ToString("x2"));
                }
                return sb.ToString();
            }
        }
    }
}
