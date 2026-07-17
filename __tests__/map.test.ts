import { generateMarkersFromData, calculateRegion } from "@/lib/map";
import { MarkerData } from "@/types/type";

describe("generateMarkersFromData", () => {
  const drivers = [
    {
      id: 1,
      first_name: "Kwame",
      last_name: "Asante",
      rating: 4.8,
      car_seats: 4,
      profile_image_url: "",
      car_image_url: "",
      latitude: 5.6,
      longitude: -0.19,
      title: "Kwame Asante",
    },
    {
      id: 2,
      first_name: "Ama",
      last_name: "Boateng",
      rating: 4.6,
      car_seats: 5,
      profile_image_url: "",
      car_image_url: "",
      latitude: 5.6,
      longitude: -0.19,
      title: "Ama Boateng",
    },
  ];

  it("generates markers for each driver", () => {
    const markers = generateMarkersFromData({
      data: drivers,
      userLatitude: 5.6,
      userLongitude: -0.19,
    });

    expect(markers).toHaveLength(2);
  });

  it("assigns correct driver data to markers", () => {
    const markers = generateMarkersFromData({
      data: drivers,
      userLatitude: 5.6,
      userLongitude: -0.19,
    });

    expect(markers[0].id).toBe(1);
    expect(markers[0].title).toBe("Kwame Asante");
    expect(markers[0].first_name).toBe("Kwame");
    expect(markers[0].last_name).toBe("Asante");
    expect(markers[0].car_seats).toBe(4);
    expect(markers[0].rating).toBe(4.8);
  });

  it("generates non-zero latitude and longitude", () => {
    const markers = generateMarkersFromData({
      data: drivers,
      userLatitude: 5.6,
      userLongitude: -0.19,
    });

    markers.forEach((m) => {
      expect(m.latitude).not.toBe(0);
      expect(m.longitude).not.toBe(0);
    });
  });

  it("handles empty data", () => {
    const markers = generateMarkersFromData({
      data: [],
      userLatitude: 5.6,
      userLongitude: -0.19,
    });

    expect(markers).toHaveLength(0);
  });
});

describe("calculateRegion", () => {
  it("returns default Accra region when no coordinates provided", () => {
    const result = calculateRegion({
      userLatitude: null,
      userLongitude: null,
      destinationLatitude: null,
      destinationLongitude: null,
    });

    expect(result).toEqual({
      latitude: 5.6037,
      longitude: -0.187,
      zoomLevel: 12,
    });
  });

  it("returns region centered on user location", () => {
    const result = calculateRegion({
      userLatitude: 5.6,
      userLongitude: -0.19,
      destinationLatitude: null,
      destinationLongitude: null,
    });

    expect(result).not.toBeNull();
    expect(result!.latitude).toBe(5.6);
    expect(result!.longitude).toBe(-0.19);
    expect(result!.zoomLevel).toBeGreaterThan(0);
  });

  it("returns region including destination when provided", () => {
    const result = calculateRegion({
      userLatitude: 5.6,
      userLongitude: -0.19,
      destinationLatitude: 5.65,
      destinationLongitude: -0.25,
    });

    expect(result).not.toBeNull();
    expect(result!.latitude).toBeGreaterThan(5.5);
    expect(result!.latitude).toBeLessThan(5.7);
    expect(result!.longitude).toBeGreaterThan(-0.3);
    expect(result!.longitude).toBeLessThan(-0.1);
  });
});
