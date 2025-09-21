import { createContext, useContext } from "react";

export const ScrollRootContext = createContext(null);
export const useScrollRoot = () => useContext(ScrollRootContext);
