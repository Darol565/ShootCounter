import React, {useContext} from "react";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {Image as RNImage, useColorScheme} from "react-native";
import {ThemeContext} from "@react-navigation/core";


interface IHourlyCard {
  icon: any;
  text: string;
  currentUpdate: string;
  lastUpdate: string;
  arrowDownIcon?: boolean;
  arrowUpIcon?: boolean;
}

const targetPng = require("@/assets/images/target.png");
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
    const isDark = theme?.colorMode
        ? theme.colorMode === "dark"
        : scheme === "dark";
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
          />        </Box>
        <Text className="text-typography-400 font-dm-sans-regular">
          Schüsse heute
        </Text>
      </HStack>

      <VStack className="flex-1 gap-2">*-

        <Text className="text-typography-900 font-dm-sans-regular text-[28px]">
          {currentUpdate}
        </Text>
      </VStack>
    </VStack>

  );
};

export default HourlyCard;
