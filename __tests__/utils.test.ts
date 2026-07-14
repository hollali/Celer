import { formatTime, formatDate, sortRides } from "@/lib/utils";

describe("formatTime", () => {
  it("formats minutes under 60", () => {
    expect(formatTime(7)).toBe("7 min");
  });

  it("formats zero", () => {
    expect(formatTime(0)).toBe("0 min");
  });

  it("formats exact minutes under 60", () => {
    expect(formatTime(45)).toBe("45 min");
  });

  it("formats hours and minutes", () => {
    expect(formatTime(90)).toBe("1h 30m");
  });

  it("formats exact hours", () => {
    expect(formatTime(120)).toBe("2h");
  });

  it("rounds fractional minutes", () => {
    expect(formatTime(7.4)).toBe("7 min");
  });
});

describe("formatDate", () => {
  it("formats a valid date string", () => {
    const result = formatDate("2025-01-15T10:30:00Z");
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });
});

describe("sortRides", () => {
  const mockRides = [
    { ride_id: 1, created_at: "2025-01-20", ride_time: 10 },
    { ride_id: 2, created_at: "2025-01-22", ride_time: 12 },
    { ride_id: 3, created_at: "2025-01-18", ride_time: 8 },
  ] as any[];

  it("does not mutate the original array", () => {
    const original = [...mockRides];
    sortRides(mockRides);
    expect(mockRides).toEqual(original);
  });

  it("returns sorted rides descending by date", () => {
    const result = sortRides(mockRides);
    expect(result).toHaveLength(3);
    expect(result[0].ride_id).toBe(2);
    expect(result[1].ride_id).toBe(1);
    expect(result[2].ride_id).toBe(3);
  });
});
