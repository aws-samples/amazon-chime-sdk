import { Flex, Heading } from "amazon-chime-sdk-component-library-react";
import React from "react";
import { useAppState } from "../../../providers/AppStateProvider";

const DashboardScreen = () => {
  const { joineeType } = useAppState();
  return (
    <Flex container layout="fill-space-centered">
      <Flex mb="2rem" mr={{ md: "2rem" }} px="1rem">
        <Heading level={4} tag="h1" mb={2}>
          {`${joineeType} Dashboard`}
        </Heading>
      </Flex>
    </Flex>
  );
};

export default DashboardScreen;
