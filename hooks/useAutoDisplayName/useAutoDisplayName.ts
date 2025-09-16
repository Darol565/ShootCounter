import { useEffect, useState } from "react";
import * as Device from "expo-device";

const GENERIC = [
    "iphone","ipad","ipod","android","pixel","galaxy","samsung","huawei","honor",
    "xiaomi","redmi","oneplus","nothing","google","motorola","moto","oppo","vivo","realme"
];

function normalize(s: string) {
    return s.replace(/\u2019/g, "'").trim();
}

function guessNameFromDeviceName(dn?: string | null): string | null {
    if (!dn) return null;
    const s = normalize(dn);

    // „Dave's iPhone“
    const mPoss = s.match(/^(.+?)'s\b/i);
    if (mPoss) return mPoss[1].trim();

    // „iPhone von Dave“
    const mVon = s.match(/\bvon\s+(.+?)$/i);
    if (mVon) return mVon[1].trim();

    // Erstes Wort, falls kein Brand
    const first = s.split(/[\s-]+/)[0];
    if (first && !GENERIC.includes(first.toLowerCase())) return first;

    // Wort vor „Phone/Handy/Telefon“
    const mPre = s.match(/(\S+)\s+(?:phone|handy|telefon)/i);
    if (mPre) return mPre[1];

    return null;
}

export function useAutoDisplayName(fallback = "Friend") {
    const [name, setName] = useState(fallback);

    useEffect(() => {
        const n = Device.deviceName ?? null;
        const g = guessNameFromDeviceName(n);
        if (g && g.length >= 2) setName(g);
    }, []);

    return name;
}
