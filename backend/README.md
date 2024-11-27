## Testing a Protected Endpoint

If an endpoint in the `express.ts` or a router file has the `protectedRoute()` middleware, it requires the call to the endpoint to include the `Authorization` header with the value `Bearer <token>` where `<token>` is a valid access token.

To call one of these endpoints you must open the desktop application in development mode (using `npm run dev`) and copy the access token from the top toolbar menu tab `Developer` after logging in.

This access token can then be used in the `Authorization` header on your request with the value `Bearer <token>`.

<br />

## Test File List

There are two endpoints you can test.

1. `POST` `/filelist` - This creates a file list entry in the database, as well as a transfer entry in the database if `application` and `accession` numbers are provided, creates the file list file, and sends it via email.

2. `POST` `/filelist/test` - This only tests the creation of the file and does not create any database entries or send an email.

### POST /filelist

You can test the creation of a file list ARS662 by following these steps.

1. Set the `Authorization` header.

2. Set the body of the request as:

``` JSON
{
  "outputFileType": "excel",
  "metadata": {
    "folders": {
      "D:/test/Folder1": {
        "schedule": "123456",
        "classification": "654321-10",
        "file": "",
        "opr": true,
        "startDate": "2024/01/01",
        "endDate": "2024/12/31",
        "soDate": "2024/02/01",
        "fdDate": "2024/12/01"
      },
      "D:/test/Folder2": {
        "schedule": "654321",
        "classification": "123456-20",
        "file": "",
        "opr": false,
        "startDate": "2024/01/01",
        "endDate": "2024/12/31",
        "soDate": "2024/02/01",
        "fdDate": "2024/12/01"
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
}
```

<br />

### POST /filelist/test

You can test the creation of an excel file list ARS662 by following these steps.

1. Set the `<token>` in the `Authorization` header below and then run the command in your terminal:

``` Bash
curl -X POST http://localhost:3200/filelist/test \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <token>" \
-d '{
  "outputFileType": "excel",
  "metadata": {
    "folders": {
      "D:/test/Folder1": {
        "schedule": "123456",
        "classification": "654321-10",
        "file": "",
        "opr": true,
        "startDate": "2024/01/01",
        "endDate": "2024/12/31",
        "soDate": "2024/02/01",
        "fdDate": "2024/12/01"
      },
      "D:/test/Folder2": {
        "schedule": "654321",
        "classification": "123456-20",
        "file": "",
        "opr": false,
        "startDate": "2024/01/01",
        "endDate": "2024/12/31",
        "soDate": "2024/02/01",
        "fdDate": "2024/12/01"
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