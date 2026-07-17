import { create } from "zustand";

import { DriverStore, LocationStore, MarkerData } from "@/types/type";

export const useLocationStore = create<LocationStore>((set) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,
  setUserLocation: ({ latitude, longitude, address }) =>
    set(() => ({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    })),
  setDestinationLocation: ({ latitude, longitude, address }) =>
    set(() => ({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    })),
}));

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [] as MarkerData[],
  selectedDriver: null,
  driversLoading: false,
  setSelectedDriver: (driverId: number) => set(() => ({ selectedDriver: driverId })),
  setDrivers: (drivers: MarkerData[]) => set(() => ({ drivers })),
  setDriversReady: () => set(() => ({ driversLoading: false })),
  clearSelectedDriver: () => set(() => ({ selectedDriver: null, driversLoading: false })),
}));

export const useTabStore = create<{
  tabBarVisible: boolean;
  setTabBarVisible: (visible: boolean) => void;
}>((set) => ({
  tabBarVisible: true,
  setTabBarVisible: (visible) => set(() => ({ tabBarVisible: visible })),
}));
