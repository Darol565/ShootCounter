// Buffer-Polyfill für react-native-ble-plx Base64-Decode
import { Buffer } from "buffer";
(global as any).Buffer = Buffer;
