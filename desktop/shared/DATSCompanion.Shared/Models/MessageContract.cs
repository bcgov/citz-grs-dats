namespace DATSCompanion.Shared.Models
{
    public class MessageContract<T>
    {
        public DATSSource Source { get; set; }

        public DATSActions Action { get; set; }

        public T Payload { get; set; }
    }

    public class DATSFileInformation
    {
        public string Path { get; set; }

        public int FileCount { get; set; }

        public int FolderCount { get; set; }
        public long SizeInBytes { get; set; }

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
        Error
    }

}
