import React from "react";
import {Flex, Input, InputGroup, InputLeftElement} from "@chakra-ui/react";
import {SearchIcon} from "@chakra-ui/icons";
import {User} from "@firebase/auth";
import {auto} from "@popperjs/core";

type SearchInputProps = {
	user?: User | null
}
const SearchInput: React.FC<SearchInputProps> = (props) => {
	const {user} = props

	return (
		<Flex flexGrow={1}
		      maxWidth={user ? auto : "600px"}
		      mr={2}
		      align="center">
			<InputGroup>
				<InputLeftElement
					pointerEvents='none'
					// children={<SearchIcon color='gray.400' mb={1}/>}
				>
					<SearchIcon mb={2}/>
				</InputLeftElement>
				<Input
					placeholder='Search reddit'
					fontSize="10pt"
					_placeholder={{color: "gray.500"}}
					_hover={{
						bg: "white",
						border: "1px solid",
						borderColor: "blue.100",
					}}
					_focus={{
						outline: "none",
						border: "1px solid",
						borderColor: "blue.500",
					}}
					height="34px"
					bg="gray.50"
				/>
			</InputGroup>
		</Flex>
	)
}

export default SearchInput