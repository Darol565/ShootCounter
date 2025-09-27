import "@/global.css";
import "../polyfills"; // Buffer-Polyfill
import { useContext } from "react";
import {Slot, Stack} from "expo-router";
import { useFonts } from "expo-font";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { StatusBar } from "expo-status-bar";
import { ThemeContext, ThemeProvider } from "@/contexts/theme-context";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { BleProvider } from "@/contexts/BleProvider";

const MainLayout = () => {
  const { colorMode }: any = useContext(ThemeContext);
  const [fontsLoaded] = useFonts({
    "dm-sans-regular": DMSans_400Regular,
    "dm-sans-medium": DMSans_500Medium,
    "dm-sans-bold": DMSans_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GluestackUIProvider mode={colorMode}>
      <StatusBar translucent/>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GluestackUIProvider>
  );
};

export default function RootLayout() {
  return (
      <BleProvider>
          <Slot />
      </BleProvider>
//    <ThemeProvider>
//      <MainLayout />
//    </ThemeProvider>
  );
}
