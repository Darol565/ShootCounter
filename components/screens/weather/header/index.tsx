import React, { useContext, useEffect, useState } from "react";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { ThemeContext } from "@/contexts/theme-context";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAutoDisplayName } from "@/hooks/useAutoDisplayName/useAutoDisplayName";
import { Modal, Pressable, TextInput, Text, View } from "react-native";

function useNow(intervalMs = 30000) {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);
    return now;
}

// generische Namen ignorieren (werden wie "kein Name" behandelt)
const GENERIC = new Set([
    "friend", "user", "iphone", "ipad", "ipod", "android", "pixel", "galaxy",
    "samsung", "huawei", "honor", "xiaomi", "redmi", "oneplus", "nothing",
    "google", "motorola", "moto", "oppo", "vivo", "realme", "device", "phone"
]);
const isGenericName = (s?: string | null) =>
    !s || GENERIC.has(s.trim().toLowerCase());

const Header = ({ height }: { height: number }) => {
    const { colorMode }: any = useContext(ThemeContext);
    const isDark = colorMode === "dark";

    // Font-Animation
    const locationTextStyle = useAnimatedStyle(() => ({
        fontSize: interpolate(height, [340, 140], [20, 16]),
    }));
    const dateTextStyle = useAnimatedStyle(() => ({
        fontSize: interpolate(height, [340, 140], [16, 14]),
    }));

    // Name: Auto-Erkennung (ohne Fallback) + Persistenz
    const autoName = useAutoDisplayName(""); // leerer Fallback
    const [name, setName] = useState<string>("");
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState("");

    useEffect(() => {
        (async () => {
            const saved = (await AsyncStorage.getItem("displayName"))?.trim();
            if (saved && !isGenericName(saved)) {
                setName(saved);
                return;
            }
            // nur setzen, wenn autoName nicht generisch ist
            if (!isGenericName(autoName)) {
                setName(autoName.trim());
            } else {
                setName(""); // erzwingt "Add name"
            }
        })();
    }, [autoName]);

    const saveName = async (n: string) => {
        const t = n.replace(/\s+/g, " ").trim();
        if (!t || isGenericName(t)) {
            // nichts speichern, wenn leer/zu generisch
            setName("");
            await AsyncStorage.removeItem("displayName");
            return;
        }
        setName(t);
        await AsyncStorage.setItem("displayName", t);
    };

    // Datum
    const now = useNow(30000);
    const dateStr = now.toLocaleDateString("de-CH", {
        timeZone: "Europe/Zurich",
        month: "long",
        day: "2-digit",
    });

    const canSave = draft.replace(/\s+/g, " ").trim().length >= 2;

    return (
        <Box className="bg-background-0 rounded-b-3xl overflow-hidden flex-1">
            <Animated.View
                style={{
                    paddingHorizontal: 16,
                    flexDirection: "column",
                    paddingTop: 60,
                    paddingBottom: 10,
                }}
            >
                <HStack className="justify-between">
                    <VStack className="gap-2">
                        {name ? (
                            <Animated.Text
                                style={[
                                    { fontFamily: "dm-sans-medium", color: isDark ? "#F2EDFF" : "#4a367d" },
                                    locationTextStyle,
                                ]}
                            >
                                {`Hey, ${name}`}
                            </Animated.Text>
                        ) : (
                            <Pressable onPress={() => { setDraft(""); setOpen(true); }}>
                                <Animated.Text
                                    style={[
                                        {
                                            fontFamily: "dm-sans-medium",
                                            textDecorationLine: "underline",
                                            color: isDark ? "#F2EDFF" : "#4a367d",
                                        },
                                        locationTextStyle,
                                    ]}
                                >
                                    Namen hinzufügen
                                </Animated.Text>
                            </Pressable>
                        )}

                        <Animated.Text
                            style={[
                                { fontFamily: "dm-sans-regular", color: isDark ? "#E5E5E5" : "#302354" },
                                dateTextStyle,
                            ]}
                        >
                            {dateStr}
                        </Animated.Text>
                    </VStack>
                </HStack>
            </Animated.View>

            {/* Modal für Name-Eingabe */}
            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" }}>
                    <View style={{ width: "86%", borderRadius: 12, padding: 16, backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF" }}>
                        <Text style={{ fontFamily: "dm-sans-medium", fontSize: 16, marginBottom: 8, color: isDark ? "#F2EDFF" : "#302354" }}>
                            Name eingeben
                        </Text>

                        <TextInput
                            value={draft}
                            onChangeText={setDraft}
                            placeholder="z. B. Dave"
                            autoCapitalize="words"
                            autoCorrect={false}
                            returnKeyType="done"
                            onSubmitEditing={() => {
                                if (canSave) {
                                    saveName(draft);
                                    setOpen(false);
                                    setDraft("");
                                }
                            }}
                            style={{
                                borderWidth: 1,
                                borderColor: isDark ? "#3A3A3C" : "#D1D5DB",
                                borderRadius: 12,
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                fontSize: 16,
                                fontFamily: "dm-sans-regular",
                                color: isDark ? "#F2EDFF" : "#111827",
                            }}
                            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                        />

                        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
                            <Pressable onPress={() => { setOpen(false); setDraft(""); }} style={{ paddingVertical: 10, paddingHorizontal: 12, marginRight: 8 }}>
                                <Text style={{ color: isDark ? "#E5E5E5" : "#4a367d", fontFamily: "dm-sans-medium" }}>Abbrechen</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    if (canSave) {
                                        saveName(draft);
                                        setOpen(false);
                                        setDraft("");
                                    }
                                }}
                                disabled={!canSave}
                                style={{
                                    paddingVertical: 10,
                                    paddingHorizontal: 14,
                                    borderRadius: 10,
                                    backgroundColor: canSave ? "#4a367d" : "#9CA3AF",
                                }}
                            >
                                <Text style={{ color: "#fff", fontFamily: "dm-sans-medium" }}>Speichern</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </Box>
    );
};

export default Header;
