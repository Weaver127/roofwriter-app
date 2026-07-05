import React from "react";
import { StatusBar } from "expo-status-bar";
import { InspectionProvider } from "./src/state/InspectionContext";
import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <InspectionProvider>
      <StatusBar style="auto" />
      <RootNavigator />
    </InspectionProvider>
  );
}
