import React from "react";
import {Flex, Image} from "@chakra-ui/react";
import SearchInput from "@/components/Navbar/SearchInput";
import RightContent from "@/components/Navbar/RightContent/RightContent";
import {useAuthState} from "react-firebase-hooks/auth";
import {auth} from "@/firebase/clientApp";
import Directory from "@/components/Navbar/Directory/Directory";
import useDirectory from "@/hooks/useDirectory";
import {defaultMenuItem} from "@/atoms/directoryMenuAtom";

const Navbar: React.FC = () => {
	const [user, loading, error] = useAuthState(auth)
	const {onSelectedMenuItem} = useDirectory()
	return (
		<Flex bg="white"
		      height="44px"
		      padding="6px 12px"
		      justify={{md: "space-between"}}
		>
			<Flex align="center"
			      mr={{base: 0, md: 2}}
			      width={{base: "40px", md: "auto"}}
			      onClick={() => onSelectedMenuItem(defaultMenuItem)}
			      cursor="pointer"
			>
				<Image src="/images/redditFace.svg"
				       height="30px"
				/>
				<Image src="/images/redditText.svg"
				       height="46px"
				       display={{base: "none", md: "unset"}}
				/>
			</Flex>
			{user && <Directory/>}
			<SearchInput user={user}/>
			<RightContent user={user}/>
		</Flex>
	)
}

export default Navbar