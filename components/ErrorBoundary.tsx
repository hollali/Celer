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
        <View className="flex-1 items-center justify-center bg-white dark:bg-dark-bg px-6">
          <Text className="text-xl font-JakartaBold text-gray-900 dark:text-dark-text text-center">
            {this.props.fallbackTitle || "Something went wrong"}
          </Text>
          <Text className="text-sm font-JakartaMedium text-gray-500 dark:text-dark-text-secondary text-center mt-2">
            {this.state.error?.message || "An unexpected error occurred"}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null })}
            className="mt-6 bg-primary-500 rounded-full px-6 py-3"
          >
            <Text className="text-white font-JakartaBold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
