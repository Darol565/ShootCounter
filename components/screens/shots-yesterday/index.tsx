import React, { useContext } from "react";
import { Pressable, ActivityIndicator, Image as RNImage, useColorScheme } from "react-native";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { ThemeContext } from "@/contexts/theme-context";
import {useBle} from "@/contexts/BleProvider";

const targetPng = require("@/assets/images/target.png");

interface IshotsYesterday {
    icon: any;
    text: string;
}

const ShotsYesterday = ({ icon, text }: IshotsYesterday) => {
    const { colorMode }: any = useContext(ThemeContext);
    const scheme = useColorScheme();
    const isDark =
        colorMode ? colorMode === "dark" : scheme === "dark";

    const {
        yesterday,
    } = useBle();

    return (
        <VStack className="py-3 rounded-2xl bg-background-100 gap-3 p-3">
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
                    Schüsse gestern
                </Text>
            </HStack>

            <VStack className="flex-1 gap-1">
                <Text className="text-typography-900 font-dm-sans-regular text-[28px]">
                    {yesterday}
                </Text>
            </VStack>

        </VStack>
    );
};

export default ShotsYesterday;
