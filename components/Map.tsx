import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from "react-native-maps";

import { calculateDriverTimes, calculateRegion, generateMarkersFromData } from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";

const Map = () => {
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const { drivers, selectedDriver } = useDriverStore();

  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  useEffect(() => {
    if (Array.isArray(drivers) && drivers.length > 0) {
      if (!userLatitude || !userLongitude) return;

      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });

      setMarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude]);

  useEffect(() => {
    if (
      markers.length > 0 &&
      destinationLatitude &&
      destinationLongitude
    ) {
      calculateDriverTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }).then((driversWithTimes) => {
        if (driversWithTimes) {
          useDriverStore.setState({ drivers: driversWithTimes as MarkerData[] });
        }
      });
    }
  }, [markers, destinationLatitude, destinationLongitude]);

  if (!userLatitude || !userLongitude) {
    return (
      <View className="flex justify-between items-center w-full rounded-2xl h-[300px]">
        <ActivityIndicator size="small" color="#000" />
        <Text>Loading map...</Text>
      </View>
    );
  }

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 16,
      }}
      region={region}
      showsUserLocation={true}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          pinColor={selectedDriver === marker.id ? "#0286FF" : "#AAAAAA"}
        />
      ))}
    </MapView>
  );
};

export default Map;
