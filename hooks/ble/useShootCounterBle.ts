import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BleManager, Characteristic, Device, State, Subscription, BleError } from "react-native-ble-plx";
import { Platform, PermissionsAndroid } from "react-native";
import { Buffer } from "buffer";
import { BLE_NAME, SERVICE_UUID, TODAY_UUID, YESTERDAY_UUID, RX_UUID } from "./constants";

function ymdToday(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`; // YYYYMMDD
}
const asciiB64 = (s: string) => Buffer.from(s, "ascii").toString("base64");
const leToU32 = (b: Buffer) => ((b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 0);

export function useShootCounterBle() {
    const manager = useMemo(() => new BleManager(), []);
    const [device, setDevice] = useState<Device | null>(null);
    const [today, setToday] = useState<number>(0);
    const [yesterday, setYesterday] = useState<number>(0);
    const [scanning, setScanning] = useState(false);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const notifySubRef = useRef<Subscription | null>(null);
    const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const resyncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const sub = manager.onStateChange((s) => setReady(s === State.PoweredOn), true);
        return () => sub.remove();
    }, [manager]);

    useEffect(() => {
        return () => {
            try { notifySubRef.current?.remove(); } catch {}
            if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
            if (resyncTimerRef.current) clearInterval(resyncTimerRef.current);
            manager.destroy();
        };
    }, [manager]);

    const reqAndroidPerms = async () => {
        if (Platform.OS !== "android") return true;
        const res = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return Object.values(res).every(v => v === PermissionsAndroid.RESULTS.GRANTED);
    };

    const readU32 = async (d: Device, svc: string, ch: string) => {
        const c = await d.readCharacteristicForService(svc, ch);
        if (!c?.value) return 0;
        const buf = Buffer.from(c.value, "base64");
        return buf.length >= 4 ? leToU32(buf) : 0;
    };

    const sendDateSync = useCallback(async (d: Device) => {
        const msg = `DATE:${ymdToday()}`;
        await d.writeCharacteristicWithResponseForService(
            SERVICE_UUID, RX_UUID, asciiB64(msg)
        );
    }, []);

    const attachNotify = useCallback(async (d: Device) => {
        // Erst Datum syncen -> sauberer Rollover auf dem ESP
        try { await sendDateSync(d); } catch {}
        // Danach beide Tageswerte lesen
        const t = await readU32(d, SERVICE_UUID, TODAY_UUID);
        const y = await readU32(d, SERVICE_UUID, YESTERDAY_UUID);
        setToday(t); setYesterday(y);

        // alte Subscription schließen
        try { notifySubRef.current?.remove(); } catch {}
        notifySubRef.current = d.monitorCharacteristicForService(
            SERVICE_UUID,
            TODAY_UUID,
            (err: BleError | null, characteristic: Characteristic | null) => {
                if (err || !characteristic?.value) return;
                const buf = Buffer.from(characteristic.value, "base64");
                if (buf.length >= 4) setToday(leToU32(buf));
            }
        );

        // alle 5 Minuten Datum neu syncen (falls App lange offen bleibt)
        if (resyncTimerRef.current) clearInterval(resyncTimerRef.current);
        resyncTimerRef.current = setInterval(() => {
            sendDateSync(d).catch(() => {});
            // yesterday neu lesen, falls rollover stattfand
            d.readCharacteristicForService(SERVICE_UUID, YESTERDAY_UUID)
                .then(c => { if (c?.value) setYesterday(leToU32(Buffer.from(c.value, "base64"))); })
                .catch(() => {});
        }, 5 * 60 * 1000);
    }, [sendDateSync]);

    const connectTo = useCallback(async (d: Device) => {
        const dd = await (await d.connect()).discoverAllServicesAndCharacteristics();
        setDevice(dd);
        await attachNotify(dd);
        setError(null);
        return dd;
    }, [attachNotify]);

    const stopScan = useCallback(() => {
        try { manager.stopDeviceScan(); } catch {}
        if (scanTimeoutRef.current) { clearTimeout(scanTimeoutRef.current); scanTimeoutRef.current = null; }
        setScanning(false);
    }, [manager]);

    const scanOnce = useCallback((useServiceFilter: boolean, timeoutMs: number) => {
        return new Promise<Device | null>((resolve) => {
            const filter = useServiceFilter ? [SERVICE_UUID] : null;
            const to = setTimeout(() => { try { manager.stopDeviceScan(); } catch {} resolve(null); }, timeoutMs);
            manager.startDeviceScan(filter, { allowDuplicates: false }, (scanErr, d) => {
                if (scanErr) { clearTimeout(to); try { manager.stopDeviceScan(); } catch {} resolve(null); return; }
                if (!d) return;
                const name = d.name || (d as any).localName;
                const hasSvc = (d.serviceUUIDs || []).some(u => u?.toUpperCase() === SERVICE_UUID);
                const nameOK = !!name && (name === BLE_NAME || name.includes(BLE_NAME));
                if ((useServiceFilter && hasSvc) || (!useServiceFilter && nameOK)) {
                    clearTimeout(to); try { manager.stopDeviceScan(); } catch {} resolve(d);
                }
            });
        });
    }, [manager]);

    const startScanAndConnect = useCallback(async () => {
        if (scanning || device) return;
        setError(null);

        const st = await manager.state();
        if (st !== State.PoweredOn) { setError("Bluetooth ist ausgeschaltet"); return; }
        if (!(await reqAndroidPerms())) { setError("Bluetooth-Berechtigungen fehlen"); return; }

        setScanning(true);
        scanTimeoutRef.current = setTimeout(() => {
            stopScan();
            if (!device) setError(`Kein Gerät "${BLE_NAME}" gefunden`);
        }, 15000);

        let found = await scanOnce(true, 6000);
        if (!found) found = await scanOnce(false, 8000);

        if (scanTimeoutRef.current) { clearTimeout(scanTimeoutRef.current); scanTimeoutRef.current = null; }

        if (!found) { stopScan(); setError(`Kein Gerät "${BLE_NAME}" gefunden`); return; }

        try { await connectTo(found); }
        catch (e: any) { setError(e?.message || "Verbindung fehlgeschlagen"); setTimeout(() => startScanAndConnect().catch(()=>{}), 800); }
        finally { stopScan(); }
    }, [manager, device, scanning, stopScan, scanOnce, connectTo]);

    const disconnect = useCallback(async () => {
        try { notifySubRef.current?.remove(); } catch {}
        notifySubRef.current = null;
        if (resyncTimerRef.current) { clearInterval(resyncTimerRef.current); resyncTimerRef.current = null; }
        if (device) { try { await manager.cancelDeviceConnection(device.id); } catch {} }
        setDevice(null);
    }, [device, manager]);

    useEffect(() => {
        if (!device) return;
        const sub = manager.onDeviceDisconnected(device.id, () => {
            setDevice(null);
            if (resyncTimerRef.current) { clearInterval(resyncTimerRef.current); resyncTimerRef.current = null; }
            setTimeout(() => startScanAndConnect().catch(()=>{}), 800);
        });
        return () => { try { sub.remove(); } catch {} };
    }, [device, manager, startScanAndConnect]);

    return { ready, scanning, device, today, yesterday, error, startScanAndConnect, disconnect };
}
