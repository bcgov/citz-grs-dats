using System;
using System.Collections.Generic;

namespace DATSCompanion.Shared.Models
{
    public class MessageContract<T>
    {
        public DATSSource Source { get; set; }

        public DATSActions Action { get; set; }

        public T Payload { get; set; }
    }

    public class ReportProgress
    {
        public double Progress { get; set; }

        public string Message { get; set; }
        public long BytesUploaded { get; set; }
        public long BytesRemaining { get; set; }
        public string ETA { get; set; }
        public long TotalBytes { get; set; }
    }
    public class DATSFileInformation
    {
        public string Path { get; set; }
        public string FileName { get; set; }
        public string Checksum { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime DateModified { get; set; }
        public DateTime DateAccessed { get; set; }
        public DateTime DateLastSaved { get; set; }
        public string AssociatedProgramName { get; set; }
        public string Owner { get; set; }
        public string Computer { get; set; }
        public string ContentType { get; set; }

        public long SizeInBytes { get; set; }
    }
    public class DATSFileDetails
    {
        public string Path { get; set; }

        public int FileCount { get; set; }

        public int FolderCount { get; set; }
        public long SizeInBytes { get; set; }
       
        public List<DATSFileInformation> Files { get; set; } = new List<DATSFileInformation>();
    }

    public class DATSFileCheck
    {
        public string[] Paths { get; set; }
    }
    public class DATSFileToUpload
    {
        public string TransferId { get; set; }

        public string Id { get; set; }

        public DATSUploadPackage[] Package { get; set; }

        public string UploadUrl { get; set; }
        public string ApplicationNumber { get; set; }
        public string AccessionNumber { get; set; }
    }

    public class DATSUploadPackage
    {
        public string Path { get; set; }
        public string Classification { get; set; }

        public string Note { get; set; }
    }
    public class Error
    {
        public string Message { get; set; }

    }

    public enum DATSSource
    {
        Desktop,
        Web,
        Service
    }
    public enum DATSActions
    {
        FolderSelected,
        FileSelected,
        MultipleFilesSelected,
        FileInformation,
        Cancelled,
        Progress,
        Error,
        Completed,
        FolderUpload,
        CheckFolder,
        FileFolderExists,
        FileFolderNotExists,
        HealthCheck,
        Healthy,
        ErrorDesktop,

        UploadProgress,
        UploadSuccessfull

    }

}
