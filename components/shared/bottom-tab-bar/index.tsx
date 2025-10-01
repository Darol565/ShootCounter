import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
    SettingsIcon,
    ActiveSettingsIcon,
} from "@/components/shared/icon";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import React, { useContext } from "react";
import { Image as RNImage, ImageSourcePropType, Platform } from "react-native";
import { Icon } from "@/components/ui/icon";
import { ThemeContext } from "@/contexts/theme-context";

const targetPng = require("@/assets/images/target.png");

// SVG-Komponente
type VectorIcon = React.ElementType;
// Bildquelle (PNG, require(...), {uri: ...})
type ImageIcon = ImageSourcePropType;

interface TabItem {
    name: string;
    label: string;
    path: string;
    inActiveIcon: VectorIcon | ImageIcon;
    icon: VectorIcon | ImageIcon;
}

// Prüfen, ob es eine Bildquelle (für <Image source=...>) ist
function isImageSource(x: any): x is ImageIcon {
    // require(...) -> number | object; Remote -> { uri: string }
    return (
        typeof x === "number" ||
        (x && typeof x === "object" && ("uri" in x || "width" in x || "height" in x))
    );
}

const tabItems: TabItem[] = [
    {
        name: "(weather)",
        label: "Home",
        path: "(weather)",
        inActiveIcon: targetPng, // PNG
        icon: targetPng,         // PNG
    },
    {
        name: "settings",
        label: "Settings",
        path: "settings",
        inActiveIcon: SettingsIcon,      // SVG
        icon: ActiveSettingsIcon,        // SVG
    },
];

function BottomTabBar(props: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const { colorMode }: any = useContext(ThemeContext);
    const isDark = colorMode === "dark";

    // Farben fürs PNG-Tint
    const activeTint = isDark ? "#60A5FA" : "#1E40AF";
    const inactiveTint = "#9CA3AF";

    return (
        <Box className="bg-background-0">
            <HStack
                className="bg-background-0 pt-4 px-7 rounded-t-3xl min-h-[78px]"
                style={{
                    paddingBottom: Platform.OS === "ios" ? insets.bottom : 16,
                }}
                space="md"
            >
                {tabItems.map((item) => {
                    const isActive = props.state.routeNames[props.state.index] === item.path;
                    const iconToRender: VectorIcon | ImageIcon = isActive ? item.icon : item.inActiveIcon;

                    return (
                        <Pressable
                            key={item.name}
                            className="flex-1 items-center justify-center"
                            onPress={() => props.navigation.navigate(item.path as never)}
                        >
                            {isImageSource(iconToRender) ? (
                                <RNImage
                                    source={iconToRender}
                                    style={{
                                        width: 24,
                                        height: 24,
                                        tintColor: isActive ? activeTint : inactiveTint,
                                    }}
                                    resizeMode="contain"
                                />
                            ) : (
                                <Icon
                                    as={iconToRender as VectorIcon}
                                    size="xl"
                                    className={
                                        isActive
                                            ? "fill-primary-800 text-primary-800"
                                            : "text-background-500"
                                    }
                                />
                            )}

                            <Text
                                size="xs"
                                className={`mt-1 font-medium ${
                                    isActive ? "text-primary-800" : "text-background-500"
                                }`}
                            >
                                {item.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </HStack>
        </Box>
    );
}

export default BottomTabBar;
