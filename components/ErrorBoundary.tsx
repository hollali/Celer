import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallbackTitle?: string },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallbackTitle?: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-dark-bg">
          <Text className="text-center font-JakartaBold text-xl text-gray-900 dark:text-dark-text">
            {this.props.fallbackTitle || "Something went wrong"}
          </Text>
          <Text className="mt-2 text-center font-JakartaMedium text-sm text-gray-500 dark:text-dark-text-secondary">
            {this.state.error?.message || "An unexpected error occurred"}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null })}
            className="mt-6 rounded-full bg-primary-500 px-6 py-3"
          >
            <Text className="font-JakartaBold text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
