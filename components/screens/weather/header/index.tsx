import React, {useContext} from "react";
import {HStack} from "@/components/ui/hstack";
import {Icon, SearchIcon} from "@/components/ui/icon";
import {VStack} from "@/components/ui/vstack";
import {Box} from "@/components/ui/box";
import {ImageBackground} from "@/components/ui/image-background";
import {Image} from "@/components/ui/image";
import {ThemeContext} from "@/contexts/theme-context";
import Animated, {
    interpolate,
    useAnimatedStyle,
} from "react-native-reanimated";

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
                                Hey, Dave
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
                                January 18, 16:14
                            </Animated.Text>
                        </VStack>
                    </HStack>
                </Animated.View>
        </Box>
    );
};

export default Header;
