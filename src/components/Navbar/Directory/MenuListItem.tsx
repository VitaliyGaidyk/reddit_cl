import React from 'react';
import {IconType} from "react-icons";
import {MenuItem} from "@chakra-ui/menu";
import {Flex, Icon, Image} from "@chakra-ui/react";
import useDirectory from "@/hooks/useDirectory";

type MenuListItemProps = {
	displayText: string,
	link: string,
	icon: IconType
	iconColor: string
	imageURL?: string
}

const MenuListItem: React.FC<MenuListItemProps> = (props) => {
	const {displayText, link, icon, iconColor, imageURL} = props
	const {onSelectedMenuItem} = useDirectory()

	return (
		<MenuItem width="100%"
		          fontSize="10pt"
		          _hover={{bg: "gray.100"}}
		          onClick={() => onSelectedMenuItem({
			          displayText,
			          imageURL,
			          link,
			          icon,
			          iconColor,
		          })}
		>
			<Flex align="center">
				{imageURL ? (
					<Image src={imageURL}
					       borderRadius="full"
					       boxSize="10px"
					       mr={2}/>
				) : (
					<Icon as={icon} fontSize={20} mr={2} color={iconColor}/>
				)}
				{displayText}
			</Flex>
		</MenuItem>
	);
};

export default MenuListItem;