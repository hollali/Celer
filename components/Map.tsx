import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { WebView } from "react-native-webview";

import { calculateRegion, generateMarkersFromData } from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { MarkerData } from "@/types/type";

const LEAFLET_JS = require("@/lib/leafletAssets").LEAFLET_JS;
const LEAFLET_CSS = require("@/lib/leafletAssets").LEAFLET_CSS;

function buildMapHtml(): string {
  let parts: string[] = [];
  parts.push("<!DOCTYPE html><html><head>");
  parts.push('<meta charset="utf-8">');
  parts.push(
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">',
  );
  parts.push("<style>");
  parts.push(LEAFLET_CSS);
  parts.push("* { margin: 0; padding: 0; box-sizing: border-box; }");
  parts.push("html, body, #map { width: 100%; height: 100%; overflow: hidden; }");
  parts.push("</style>");
  parts.push("</head><body>");
  parts.push('<div id="map"></div>');
  parts.push("<script>");
  parts.push(LEAFLET_JS);
  parts.push("<\/script>");
  parts.push("<script>");
  parts.push('var map = L.map("map", {');
  parts.push("  zoomControl: false,");
  parts.push("  maxBounds: [[4.5, -3.3], [11.2, 1.2]],");
  parts.push("  maxBoundsViscosity: 1.0,");
  parts.push("  minZoom: 6,");
  parts.push("  maxZoom: 18,");
  parts.push("  worldCopyJump: false");
  parts.push("}).setView([5.6037, -0.1870], 12);");
  parts.push('L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {');
  parts.push("  maxZoom: 19,");
  parts.push('  attribution: "© OpenStreetMap contributors"');
  parts.push("}).addTo(map);");
  parts.push("var userMarker = null, userCircle = null, driverMarkers = {}, destMarker = null;");
  parts.push("function createIcon(color, imageUrl) {");
  parts.push(
    '  if (imageUrl) return L.divIcon({ className: "custom-marker", html: "<div style=\\"width:36px;height:36px;border-radius:50%;border:3px solid " + color + ";box-shadow:0 2px 6px rgba(0,0,0,0.3);overflow:hidden;background:white;\\"><img src=\\"" + imageUrl + "\\" style=\\"width:100%;height:100%;object-fit:cover;\\" /></div>", iconSize: [36, 36], iconAnchor: [18, 18] });',
  );
  parts.push(
    '  return L.divIcon({ className: "custom-marker", html: "<div style=\\"width:28px;height:28px;border-radius:50%;background:" + color + ";border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);\\"></div>", iconSize: [28, 28], iconAnchor: [14, 14] });',
  );
  parts.push("}");
  parts.push(
    'var userIcon = L.divIcon({ className: "user-marker", html: "<div style=\\"width:18px;height:18px;border-radius:50%;background:#4285F4;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);\\"></div>", iconSize: [18, 18], iconAnchor: [9, 9] });',
  );
  parts.push(
    'var destIcon = L.divIcon({ className: "dest-marker", html: "<div style=\\"width:32px;height:32px;border-radius:50% 50% 50% 0;background:#E74C3C;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);\\"></div>", iconSize: [32, 32], iconAnchor: [16, 32] });',
  );
  parts.push("var ready = false, pendingMessage = null;");
  parts.push("function handleMessage(data) {");
  parts.push(
    '  if (data.center) { if (data.type === "init") map.setView([data.center.lat, data.center.lng], data.center.zoom); else map.panTo([data.center.lat, data.center.lng], { animate: true, duration: 0.5 }); }',
  );
  parts.push("  if (data.userLat && data.userLng) {");
  parts.push("    if (!userMarker) {");
  parts.push(
    "      userMarker = L.marker([data.userLat, data.userLng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);",
  );
  parts.push(
    '      userCircle = L.circle([data.userLat, data.userLng], { radius: 50, color: "#4285F4", fillColor: "#4285F4", fillOpacity: 0.1, weight: 1 }).addTo(map);',
  );
  parts.push(
    "      map.setView([data.userLat, data.userLng], 14, { animate: true, duration: 1.0 });",
  );
  parts.push("    } else {");
  parts.push("      userMarker.setLatLng([data.userLat, data.userLng]);");
  parts.push("      userCircle.setLatLng([data.userLat, data.userLng]);");
  parts.push("    }");
  parts.push("  }");
  parts.push("  if (data.markers) {");
  parts.push("    var seen = {};");
  parts.push("    data.markers.forEach(function(m) {");
  parts.push("      seen[m.id] = true;");
  parts.push('      var color = m.selected ? "#0286FF" : "#AAAAAA";');
  parts.push("      if (driverMarkers[m.id]) {");
  parts.push("        driverMarkers[m.id].setLatLng([m.lat, m.lng]);");
  parts.push("        driverMarkers[m.id].setIcon(createIcon(color, m.profile_image_url));");
  parts.push("      } else {");
  parts.push(
    "        driverMarkers[m.id] = L.marker([m.lat, m.lng], { icon: createIcon(color, m.profile_image_url) }).addTo(map);",
  );
  parts.push("      }");
  parts.push("    });");
  parts.push("    Object.keys(driverMarkers).forEach(function(id) {");
  parts.push(
    "      if (!seen[id]) { map.removeLayer(driverMarkers[id]); delete driverMarkers[id]; }",
  );
  parts.push("    });");
  parts.push("  }");
  parts.push("  if (data.destination) {");
  parts.push(
    "    if (destMarker) destMarker.setLatLng([data.destination.lat, data.destination.lng]);",
  );
  parts.push(
    "    else destMarker = L.marker([data.destination.lat, data.destination.lng], { icon: destIcon, zIndexOffset: 500 }).addTo(map);",
  );
  parts.push("  }");
  parts.push("}");
  parts.push("function onMessage(event) {");
  parts.push(
    "  try { var data = JSON.parse(event.data); if (ready) handleMessage(data); else pendingMessage = data; } catch(e) {}",
  );
  parts.push("}");
  parts.push('document.addEventListener("message", onMessage);');
  parts.push('window.addEventListener("message", onMessage);');
  parts.push(
    "map.whenReady(function() { map.invalidateSize(); ready = true; if (pendingMessage) { handleMessage(pendingMessage); pendingMessage = null; } });",
  );
  parts.push("<\/script></body></html>");
  return parts.join("\n");
}

const MAP_HTML = buildMapHtml();

const Map = () => {
  const { userLatitude, userLongitude, destinationLatitude, destinationLongitude } =
    useLocationStore();

  const { drivers, selectedDriver } = useDriverStore();

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [mapError, setMapError] = useState(false);
  const webViewRef = useRef<WebView>(null);

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
    if (!webViewRef.current) return;

    const markerData = markers.map((m) => ({
      id: m.id,
      lat: m.latitude,
      lng: m.longitude,
      title: m.title,
      selected: selectedDriver === m.id,
      profile_image_url: m.profile_image_url || "",
    }));

    const message = JSON.stringify({
      type: "update",
      center: region
        ? { lat: region.latitude, lng: region.longitude, zoom: region.zoomLevel }
        : null,
      markers: markerData,
      userLat: userLatitude,
      userLng: userLongitude,
      destination:
        destinationLatitude && destinationLongitude
          ? { lat: destinationLatitude, lng: destinationLongitude }
          : null,
    });

    webViewRef.current.postMessage(message);
  }, [
    markers,
    selectedDriver,
    region,
    destinationLatitude,
    destinationLongitude,
    userLatitude,
    userLongitude,
  ]);

  if (mapError) {
    return (
      <View style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center bg-general-500">
          <Text className="font-JakartaMedium text-secondary-700">Map unavailable</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        source={{ html: MAP_HTML, baseUrl: "" }}
        style={{ flex: 1 }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        accessibilityLabel="Map showing your location and nearby drivers"
        onMessage={(event) => {}}
        onError={(e) => {
          console.log("WebView error:", e);
          setMapError(true);
        }}
        onLoadEnd={() => {
          setTimeout(() => {
            const markerData = markers.map((m) => ({
              id: m.id,
              lat: m.latitude,
              lng: m.longitude,
              title: m.title,
              selected: selectedDriver === m.id,
              profile_image_url: m.profile_image_url || "",
            }));
            const initMessage = JSON.stringify({
              type: "init",
              userLat: userLatitude,
              userLng: userLongitude,
              center: region
                ? { lat: region.latitude, lng: region.longitude, zoom: region.zoomLevel }
                : null,
              markers: markerData,
              destination:
                destinationLatitude && destinationLongitude
                  ? { lat: destinationLatitude, lng: destinationLongitude }
                  : null,
            });
            webViewRef.current?.postMessage(initMessage);
          }, 1500);
        }}
      />
    </View>
  );
};

export default Map;
