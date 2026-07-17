import { setAuthToken, fetchAPI } from "@/lib/fetch";

beforeEach(() => {
  setAuthToken(null);
  jest.restoreAllMocks();
});

describe("fetchAPI", () => {
  it("makes a GET request", async () => {
    const mockData = { data: [{ id: 1 }] };
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await fetchAPI("/(api)/driver");
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      "/(api)/driver",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("attaches Authorization header when token is set", async () => {
    setAuthToken("test_token_123");
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    await fetchAPI("/(api)/ride");
    expect(global.fetch).toHaveBeenCalledWith(
      "/(api)/ride",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test_token_123",
        }),
      }),
    );
  });

  it("does not attach Authorization when token is null", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    await fetchAPI("/(api)/ride");
    const callArgs = (global.fetch as jest.Mock).mock.calls[0];
    const headers = callArgs[1].headers;
    expect(headers.Authorization).toBeUndefined();
  });

  it("throws on non-ok response", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response);

    await expect(fetchAPI("/(api)/ride")).rejects.toThrow("HTTP error! status: 401");
  });

  it("throws on network error", async () => {
    jest.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network failure"));

    await expect(fetchAPI("/(api)/ride")).rejects.toThrow("Network failure");
  });
});
