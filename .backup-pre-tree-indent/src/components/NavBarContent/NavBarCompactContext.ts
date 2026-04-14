import { createContext, useContext } from "react";

const NavBarCompactContext = createContext(false);

export const NavBarCompactProvider = NavBarCompactContext.Provider;

/** Returns `true` when rendered inside a `NavBarContent` that is in compact mode. */
export function useNavBarCompact(): boolean {
  return useContext(NavBarCompactContext);
}
