import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    // @ts-expect-error — generic helper used for cross-tree navigation from outside the tree
    navigationRef.navigate(name, params);
  }
}
