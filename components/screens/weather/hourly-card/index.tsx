import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Platform, PermissionsAndroid, ActivityIndicator, Pressable } from "react-native";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Image as RNImage, useColorScheme } from "react-native";
import { ThemeContext } from "@react-navigation/core";
import { BleManager, Device, State } from "react-native-ble-plx";
import { Buffer } from "buffer";

interface IHourlyCard {
    icon: any;
    text: string;
    currentUpdate: string;
    lastUpdate: string;
    arrowDownIcon?: boolean;
    arrowUpIcon?: boolean;
}

const targetPng = require("@/assets/images/target.png");

// BLE UUIDs (müssen mit deinem ESP32-Code übereinstimmen)
const SERVICE_UUID = "B5F90001-AA8A-4B0B-9F3C-7A3B29C0E001";
const SHOTS_UUID   = "B5F90002-AA8A-4B0B-9F3C-7A3B29C0E001";

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

    const manager = useRef(new BleManager()).current;
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const [shotCount, setShotCount] = useState<number>(Number(currentUpdate) || 0);
    const [scanning, setScanning] = useState<boolean>(false);

    // Buffer für Base64-Dekodierung bereitstellen (falls global nicht gesetzt)
    // @ts-ignore
    if (!(global as any).Buffer) { (global as any).Buffer = Buffer; }

    useEffect(() => {
        return () => {
            manager.destroy();
        };
    }, [manager]);

    const requestAndroidPermissions = async () => {
        if (Platform.OS !== "android") return true;
        const res = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            // Für Android < 12 ist Location teils nötig
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return Object.values(res).every(v => v === PermissionsAndroid.RESULTS.GRANTED);
    };

    const decodeUInt32LE = (b: Buffer) =>
        ((b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 0);

    const startScanAndConnect = useCallback(async () => {
        if (!(await requestAndroidPermissions())) return;
        if (scanning || connectedDevice) return;
        setScanning(true);

        const sub = manager.onStateChange(async (state) => {
            if (state !== State.PoweredOn) return;
            manager.startDeviceScan(null, { allowDuplicates: false }, async (error, device) => {
                if (error) { setScanning(false); return; }
                if (!device) return;

                const hasService = (device.serviceUUIDs || []).some(u => u?.toUpperCase() === SERVICE_UUID);
                if (device.name?.includes("ShootCounter") || hasService) {
                    manager.stopDeviceScan();
                    try {
                        const d = await device.connect();
                        const dd = await d.discoverAllServicesAndCharacteristics();
                        setConnectedDevice(dd);

                        // Initial lesen
                        const c0 = await dd.readCharacteristicForService(SERVICE_UUID, SHOTS_UUID);
                        if (c0?.value) {
                            const buf = Buffer.from(c0.value, "base64");
                            if (buf.length >= 4) setShotCount(decodeUInt32LE(buf));
                        }

                        // Live-Updates
                        dd.monitorCharacteristicForService(SERVICE_UUID, SHOTS_UUID, (err, c) => {
                            if (err || !c?.value) return;
                            const buf = Buffer.from(c.value, "base64");
                            if (buf.length >= 4) setShotCount(decodeUInt32LE(buf));
                        });
                    } finally {
                        setScanning(false);
                    }
                }
            });
            sub.remove();
        }, true);
    }, [manager, scanning, connectedDevice]);

    const disconnect = useCallback(async () => {
        if (!connectedDevice) return;
        try { await manager.cancelDeviceConnection(connectedDevice.id); } catch {}
        setConnectedDevice(null);
    }, [connectedDevice, manager]);

    return (
        <VStack className="p-3 rounded-2xl bg-background-100 flex-1 items-left gap-4">
            <HStack className="gap-2 items-center">
                <Box className="h-7 w-7 bg-background-50 rounded-full items-center justify-center">
                    <RNImage
                        source={targetPng}
                        style={{
                            width: 16,
                            height: 16,
                            tintColor: isDark ? "#FFFFFF" : "#000000",
                        }}
                        resizeMode="contain"
                    />
                </Box>
                <Text className="text-typography-400 font-dm-sans-regular">
                    Schüsse heute
                </Text>
            </HStack>

            <VStack className="flex-1 gap-2">
                <Text className="text-typography-900 font-dm-sans-regular text-[28px]">
                    {shotCount}
                </Text>

                <HStack className="items-center gap-3">
                    {!connectedDevice ? (
                        <Pressable onPress={startScanAndConnect} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, backgroundColor: isDark ? "#2a2a2a" : "#e7e7e7" }}>
                            <Text className="font-dm-sans-regular">Verbinden</Text>
                        </Pressable>
                    ) : (
                        <Pressable onPress={disconnect} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, backgroundColor: isDark ? "#2a2a2a" : "#e7e7e7" }}>
                            <Text className="font-dm-sans-regular">Trennen</Text>
                        </Pressable>
                    )}

                    {scanning && <ActivityIndicator />}
                    <Text className="text-typography-500 font-dm-sans-regular">
                        {connectedDevice ? (connectedDevice.name ?? connectedDevice.id) : (scanning ? "Suche läuft..." : "Nicht verbunden")}
                    </Text>
                </HStack>
            </VStack>
        </VStack>
    );
};

export default HourlyCard;