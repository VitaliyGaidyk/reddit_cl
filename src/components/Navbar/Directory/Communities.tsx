import React, {useState} from 'react';
import CreateCommunityModal from "@/components/Modal/CreateCommunity/CreateCommunityModal";
import {MenuItem} from "@chakra-ui/menu";
import {Box, Flex, Icon, Text} from "@chakra-ui/react";
import {GrAdd} from "react-icons/gr"
import {useRecoilValue} from "recoil";
import {communityState} from "@/atoms/communitiesAtom";
import MenuListItem from "@/components/Navbar/Directory/MenuListItem";
import {FaReddit} from "react-icons/fa"

const Communities: React.FC = () => {
	const [open, setOpen] = useState(false)
	const mySnippets = useRecoilValue(communityState).mySnippets

	return (
		<>
			<CreateCommunityModal open={open}
			                      handleClose={() => setOpen(false)}/>
			<Box mt={3} mb={4}>
				<Text pl={3} mb={1} fontSize="7pt" fontWeight={500}
				      color="gray.500"
				>
					Moderating
				</Text>
				{mySnippets.filter(index => index.isModerate).map((snippet) => (
					<MenuListItem key={snippet.communityId}
					              displayText={`r/${snippet.communityId}`}
					              link={`/r/${snippet.communityId}`}
					              icon={FaReddit}
					              iconColor="brand.100"
					              imageURL={snippet.imageURL}
					/>
				))}
			</Box>
			<Box mt={3} mb={4}>
				<Text pl={3} mb={1} fontSize="7pt" fontWeight={500}
				      color="gray.500"
				>
					My Communities
				</Text>
				<MenuItem width="100%"
				          fontSize="10pt"
				          _hover={{bg: "gray.100"}}
				          onClick={() => {
					          setOpen(true)
				          }}
				>
					<Flex align="center">
						<Icon fontSize={20}
						      mr={2}
						      as={GrAdd}
						/>
						Create community
					</Flex>
				</MenuItem>
				{mySnippets.map((snippet) => (
					<MenuListItem key={snippet.communityId}
					              displayText={`r/${snippet.communityId}`}
					              link={`/r/${snippet.communityId}`}
					              icon={FaReddit}
					              iconColor={"blue.500"}
					              imageURL={snippet.imageURL}
					/>
				))}
			</Box>
		</>
	);
};

export default Communities;