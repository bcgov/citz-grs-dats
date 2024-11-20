## Test File List Creation

You can test the creation of an excel file list ARS662 by following these steps.

1. **TEMPORARILY** remove `protectedRoute(),` from the line `app.use("/filelist", protectedRoute(), filelistRouter);` in `express.ts`. This will allow you to call the endpoint without requiring authentication.

2. In a terminal run the following command and you will find the output file in the directory you ran the command in as `output.xlsx`.

``` Bash
curl -X POST http://localhost:3200/filelist/test \
-H "Content-Type: application/json" \
-d '{
  "outputFileType": "excel",
  "metadata": {
    "folders": {
      "D:/test/Folder1": {
        "schedule": "123456",
        "classification": "654321-10",
        "file": "",
        "opr": true,
        "startDate": "01-01-2024",
        "endDate": "12-31-2024",
        "soDate": "02-01-2024",
        "fdDate": "12-01-2024"
      },
      "D:/test/Folder2": {
        "schedule": "654321",
        "classification": "123456-20",
        "file": "",
        "opr": false,
        "startDate": "03-01-2024",
        "endDate": "11-30-2024",
        "soDate": "04-01-2024",
        "fdDate": "10-31-2024"
      }
    },
    "files": {
      "D:/test/Folder1": [
        {
          "filepath": "/path/to/folder1/file1.txt",
          "filename": "file1.txt",
          "size": "12MB",
          "birthtime": "2024-11-01T10:00:00Z",
          "lastModified": "2024-11-10T12:00:00Z",
          "lastAccessed": "2024-11-15T15:00:00Z",
          "checksum": "abcd1234"
        },
        {
          "filepath": "/path/to/folder1/file2.txt",
          "filename": "file2.txt",
          "size": "2MB",
          "birthtime": "2024-11-02T10:00:00Z",
          "lastModified": "2024-11-11T12:00:00Z",
          "lastAccessed": "2024-11-16T15:00:00Z",
          "checksum": "efgh5678"
        }
      ],
      "D:/test/Folder2": [
        {
          "filepath": "/path/to/folder2/file3.txt",
          "filename": "file3.txt",
          "size": "3MB",
          "birthtime": "2024-11-03T10:00:00Z",
          "lastModified": "2024-11-12T12:00:00Z",
          "lastAccessed": "2024-11-17T15:00:00Z",
          "checksum": "ijkl91011"
        }
      ]
    },
    "admin": {
      "accession": "1234567",
      "application": "7654321"
    }
  }
}' -o output.xlsx
```