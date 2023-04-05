import React from 'react';
import {Button, Flex, Link} from "@chakra-ui/react";

const NotFound: React.FC = () => {
	return (
		<Flex
			direction="column"
			justifyContent="center"
			alignItems="center"
			minHeight="60vh"
		>
			Sorry, that community does not exist or has been banned
			<Link href="/"
			      _hover={{textDecor: "none"}}
			>
				<Button mt={4}>GO HOME</Button>
			</Link>
		</Flex>
	);
};

export default NotFound;