import React, {useContext, useEffect, useState} from "react";
import {HStack} from "@/components/ui/hstack";
import {VStack} from "@/components/ui/vstack";
import {Box} from "@/components/ui/box";
import {ThemeContext} from "@/contexts/theme-context";
import Animated, {
    interpolate,
    useAnimatedStyle,
} from "react-native-reanimated";
import {useAutoDisplayName} from "@/hooks/useAutoDisplayName/useAutoDisplayName";

function useNow(intervalMs = 30000) {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);
    return now;
}

const Header = ({height}: { height: number }) => {
    const {colorMode}: any = useContext(ThemeContext);

    // Update all interpolation ranges to match new height values
    const locationTextStyle = useAnimatedStyle(() => ({
        fontSize: interpolate(
            height,
            [340, 140], // Updated from [340, 170]
            [20, 16]
        ),
    }));

    const dateTextStyle = useAnimatedStyle(() => ({
        fontSize: interpolate(
            height,
            [340, 140], // Updated from [340, 170]
            [16, 14]
        ),
    }));

    // The following styles are commented out as they are not currently used in the component.
    // If needed, they can be uncommented and integrated accordingly.
    // const temperatureTextStyle = useAnimatedStyle(() => ({
    //     fontSize: interpolate(
    //         height,
    //         [340, 140], // Updated from [340, 170]
    //         [112, 40]
    //     ),
    //     marginLeft: interpolate(
    //         height,
    //         [340, 140], // Updated from [340, 170]
    //         [0, 15]
    //     ),
    // }));
    //
    // const feelsLikeTextStyle = useAnimatedStyle(() => ({
    //     fontSize: interpolate(
    //         height,
    //         [340, 140], // Updated from [340, 170]
    //         [18, 14]
    //     ),
    // }));
    //
    // const weatherTextStyle = useAnimatedStyle(() => ({
    //     fontSize: interpolate(
    //         height,
    //         [340, 140], // Updated from [340, 170]
    //         [20, 14]
    //     ),
    // }));

    const displayName = useAutoDisplayName("User");

    const now = useNow(30000); // 30s-Update ohne Sekunden
    const dateStr = now.toLocaleDateString("de-CH", {
        timeZone: "Europe/Zurich",
        month: "long",
        day: "2-digit",
    });

    // If you want to include the time string, you can uncomment the following lines
    // and integrate `timeStr` into the component as needed.
    // const timeStr = now.toLocaleTimeString("de-CH", {
    //     timeZone: "Europe/Zurich",
    //     hour: "2-digit",
    //     minute: "2-digit",
    //     hour12: false,
    // });

    return (
        <Box className="bg-background-0 rounded-b-3xl overflow-hidden flex-1">
                <Animated.View
                    style={[
                        {
                            paddingHorizontal: 16,
                            flexDirection: "column",
                            paddingTop: 60,
                            paddingBottom: 10

                        },
                    ]}
                >
                    <HStack className="justify-between">
                        <VStack className="gap-2">
                            <Animated.Text
                                style={[
                                    {
                                        fontFamily: "dm-sans-medium",
                                        color: colorMode === "dark" ? "#F2EDFF" : "#4a367d",
                                    },
                                    locationTextStyle,
                                ]}
                            >
                                {`Hey, ${displayName}`}
                            </Animated.Text>
                            <Animated.Text
                                style={[
                                    {
                                        fontFamily: "dm-sans-regular",
                                        color: colorMode === "dark" ? "#E5E5E5" : "#302354",
                                    },
                                    dateTextStyle,
                                ]}
                            >
                                {dateStr}
                            </Animated.Text>
                        </VStack>
                    </HStack>
                </Animated.View>
        </Box>
    );
};

export default Header;
