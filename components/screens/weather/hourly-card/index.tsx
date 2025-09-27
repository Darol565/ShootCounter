import React, { useContext } from "react";
import { Pressable, ActivityIndicator, Image as RNImage, useColorScheme } from "react-native";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { ThemeContext } from "@react-navigation/core";
import { useBle } from "@/contexts/BleProvider";

const targetPng = require("@/assets/images/target.png");

interface IHourlyCard {
    icon: any;
    text: string;
    currentUpdate: string;
    lastUpdate: string;
    arrowDownIcon?: boolean;
    arrowUpIcon?: boolean;
}

const HourlyCard = ({
                        icon,
                        text,
                        currentUpdate,
                        lastUpdate,
                        arrowDownIcon,
                        arrowUpIcon,
                    }: IHourlyCard) => {
    const theme = useContext<any>(ThemeContext);
    const scheme = useColorScheme();
    const isDark = theme?.colorMode ? theme.colorMode === "dark" : scheme === "dark";

    const { device, today, yesterday, scanning, ready, error, startScanAndConnect, disconnect } = useBle();

    return (
        <VStack className="p-3 rounded-2xl bg-background-100 flex-1 items-left gap-4">
            <HStack className="gap-2 items-center">
                <Box className="h-7 w-7 bg-background-50 rounded-full items-center justify-center">
                    <RNImage
                        source={targetPng}
                        style={{ width: 16, height: 16, tintColor: isDark ? "#FFFFFF" : "#000000" }}
                        resizeMode="contain"
                    />
                </Box>
                <Text className="text-typography-400 font-dm-sans-regular">Schüsse heute</Text>
            </HStack>

            <VStack className="flex-1 gap-1">
                <Text className="text-typography-900 font-dm-sans-regular text-[28px]">
                    {today}
                </Text>
                <Text className="text-typography-500 font-dm-sans-regular">
                    Schüsse gestern: {yesterday}
                </Text>
            </VStack>

            <HStack className="items-center gap-3">
                {!device ? (
                    <Pressable
                        onPress={startScanAndConnect}
                        disabled={!ready || scanning}
                        style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 12,
                            backgroundColor: isDark ? "#2a2a2a" : "#e7e7e7",
                            opacity: (!ready || scanning) ? 0.6 : 1
                        }}
                    >
                        <Text className="font-dm-sans-regular">
                            {ready ? (scanning ? "Suche läuft…" : "Verbinden") : "Bluetooth aus"}
                        </Text>
                    </Pressable>
                ) : (
                    <Pressable
                        onPress={disconnect}
                        style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 12,
                            backgroundColor: isDark ? "#2a2a2a" : "#e7e7e7"
                        }}
                    >
                        <Text className="font-dm-sans-regular">Trennen</Text>
                    </Pressable>
                )}

                {scanning && <ActivityIndicator />}

                <Text className="text-typography-500 font-dm-sans-regular">
                    {error
                        ? `Fehler: ${error}`
                        : device
                            ? `Verbunden: ${device.name ?? device.id}`
                            : scanning
                                ? "Suche…"
                                : ready
                                    ? "Nicht verbunden"
                                    : "Bluetooth aus"}
                </Text>
            </HStack>
        </VStack>
    );
};

export default HourlyCard;
