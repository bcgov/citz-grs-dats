import { callTransferEndpoint } from "@/modules/transfer/utils";
import {
  HTTP_STATUS_CODES,
  HttpError,
} from "@bcgov/citz-imb-express-utilities";

jest.mock("@/config", () => ({
  ENV: { INTERNAL_BACKEND_URL: "https://mock-backend.com" },
}));

// Mock fetch globally
import fetchMock from "jest-fetch-mock";
fetchMock.enableMocks();

describe("callTransferEndpoint", () => {
  const mockProps = {
    token: "mockToken",
    standardTransferZipBuffer: Buffer.from("mock data"),
    standardTransferZipChecksum: "mockChecksum",
    accession: "mockAccession",
    application: "mockApplication",
  };

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  // Test case: Successful API call
  it("should successfully call the transfer endpoint and return response data", async () => {
    const mockResponse = {
      message: "Success",
      data: { id: "123" },
      success: true,
    };
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

    const result = await callTransferEndpoint(mockProps);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://mock-backend.com/transfer",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer mockToken",
        }),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  // Test case: API call failure
  it("should throw HttpError when API call fails", async () => {
    fetchMock.mockRejectOnce(new Error("Network error"));

    await expect(callTransferEndpoint(mockProps)).rejects.toThrow(
      new HttpError(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, "Network error")
    );
  });
});
