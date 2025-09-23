// app/index.tsx
import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
    const [target, setTarget] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const n = await AsyncStorage.getItem("displayName");
            setTarget(n && n.trim() ? "/(tabs)" : "/name");
        })();
    }, []);

    if (!target) return null; // kurzer Splash/Loading
    return <Redirect href={"/"} />;
}
