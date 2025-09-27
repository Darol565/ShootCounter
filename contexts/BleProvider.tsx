import React, { createContext, useContext } from "react";
import { useShootCounterBle } from "../hooks/ble/useShootCounterBle";

type Ctx = ReturnType<typeof useShootCounterBle>;
const BleCtx = createContext<Ctx | null>(null);

export const BleProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const value = useShootCounterBle();
    return <BleCtx.Provider value={value}>{children}</BleCtx.Provider>;
};

export function useBle() {
    const ctx = useContext(BleCtx);
    if (!ctx) throw new Error("useBle must be used within BleProvider");
    return ctx;
}
