import { icons } from "@/constants";
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { Image, ImageSourcePropType, Platform, View } from "react-native";
import { useTheme } from "@/lib/ThemeContext";

const TabIcon = ({
  source,
  focused,
}: {
  source: ImageSourcePropType;
  focused: boolean;
}) => (
  <View
    className={`rounded-full w-12 h-12 items-center justify-center ${
      focused ? "bg-general-400" : ""
    }`}
  >
    <Image
      source={source}
      tintColor={focused ? "#ffffff" : "#9ca3af"}
      resizeMode="contain"
      className="w-7 h-7"
    />
  </View>
);

export default function Layout() {
  const { isDark, useLiquidGlass } = useTheme();

  const tabBarStyle: any = {
    backgroundColor: useLiquidGlass ? "transparent" : isDark ? "#1C1C1E" : "#333333",
    borderRadius: 50,
    paddingBottom: 0,
    overflow: "hidden",
    marginHorizontal: 20,
    marginBottom: 20,
    height: 78,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    position: "absolute",
  };

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "white",
        tabBarShowLabel: false,
        tabBarStyle,
        tabBarBackground: useLiquidGlass
          ? () => (
              <BlurView
                intensity={80}
                tint={isDark ? "systemMaterialDark" : "systemUltraThinMaterialLight"}
                style={{
                  flex: 1,
                  borderRadius: 50,
                  overflow: "hidden",
                }}
              />
            )
          : undefined,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.home} focused={focused} />
          ),
          tabBarAccessibilityLabel: "Home tab — shows your location and nearby drivers",
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: "Rides",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.list} focused={focused} />
          ),
          tabBarAccessibilityLabel: "Rides tab — view your ride history and payments",
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.chat} focused={focused} />
          ),
          tabBarAccessibilityLabel: "Chat tab — messages with drivers and support",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.profile} focused={focused} />
          ),
          tabBarAccessibilityLabel: "Profile tab — account settings and preferences",
        }}
      />
    </Tabs>
  );
}
