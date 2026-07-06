import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import JobDetailsScreen from "../screens/JobDetailsScreen";
import RoofAccessScreen from "../screens/RoofAccessScreen";
import RoofAreasListScreen from "../screens/RoofAreasListScreen";
import RoofAreaDetailScreen from "../screens/RoofAreaDetailScreen";
import OutcomeScreen from "../screens/OutcomeScreen";
import MaintenanceScreen from "../screens/MaintenanceScreen";
import FindingsScreen from "../screens/FindingsScreen";
import MakeSafeScreen from "../screens/MakeSafeScreen";
import AccessoriesScreen from "../screens/AccessoriesScreen";
import ReviewSubmitScreen from "../screens/ReviewSubmitScreen";
import ReportPreviewScreen from "../screens/ReportPreviewScreen";

export type RootStackParamList = {
  JobDetails: undefined;
  RoofAccess: undefined;
  RoofAreasList: undefined;
  RoofAreaDetail: { roofAreaId: string };
  Outcome: undefined;
  Maintenance: undefined;
  Findings: undefined;
  MakeSafe: undefined;
  Accessories: undefined;
  ReviewSubmit: undefined;
  ReportPreview: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Linear flow matching the product spec's section order (3.1 through 4).
 * A real app will likely want a tab bar or a "jump to any section" summary
 * screen once there's more than one working session per inspection — this
 * linear stack is the right starting shape for getting the flow correct
 * first, not the final navigation structure.
 */
export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="JobDetails" component={JobDetailsScreen} options={{ title: "Job details" }} />
        <Stack.Screen name="RoofAccess" component={RoofAccessScreen} options={{ title: "Roof access" }} />
        <Stack.Screen name="RoofAreasList" component={RoofAreasListScreen} options={{ title: "Roof areas" }} />
        <Stack.Screen name="RoofAreaDetail" component={RoofAreaDetailScreen} options={{ title: "Roof area" }} />
        <Stack.Screen name="Outcome" component={OutcomeScreen} options={{ title: "Outcome" }} />
        <Stack.Screen name="Maintenance" component={MaintenanceScreen} options={{ title: "Maintenance" }} />
        <Stack.Screen name="Findings" component={FindingsScreen} options={{ title: "Findings" }} />
        <Stack.Screen name="MakeSafe" component={MakeSafeScreen} options={{ title: "Make safe" }} />
        <Stack.Screen name="Accessories" component={AccessoriesScreen} options={{ title: "Roof-top services" }} />
        <Stack.Screen name="ReviewSubmit" component={ReviewSubmitScreen} options={{ title: "Review & submit" }} />
        <Stack.Screen name="ReportPreview" component={ReportPreviewScreen} options={{ title: "Report preview" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
