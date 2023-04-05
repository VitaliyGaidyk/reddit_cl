import React, {useState} from 'react';
import {
	Box,
	Button, Checkbox, Flex, Icon, Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay, Stack, Text
} from "@chakra-ui/react";
import {BsFillEyeFill, BsFillPersonFill} from "react-icons/bs"
import {HiLockClosed} from "react-icons/hi"
import {doc, serverTimestamp} from "@firebase/firestore";
import {auth, firestore} from "@/firebase/clientApp";
import {useAuthState} from "react-firebase-hooks/auth";
import {runTransaction} from "@firebase/firestore";
import {useRouter} from "next/router";
import useDirectory from "@/hooks/useDirectory";

type CreateCommunityModalProps = {
	open: boolean,
	handleClose: () => void
}
const CreateCommunityModal: React.FC<CreateCommunityModalProps> = (props) => {
	const [user] = useAuthState(auth)
	const {open, handleClose} = props
	const [communityName, setCommunityName] = useState("")
	const [charsRemaining, setCharsRemaining] = useState(21)
	const [communityType, setCommunityType] = useState("public")
	const [error, setError] = useState("")
	const [loading, setLoading] = useState(false)
	const router = useRouter()
	const {toggleMenuOpen} = useDirectory()

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.value.length > 21) return
		setCommunityName(event.target.value)
		setCharsRemaining(21 - event.target.value.length)
	}

	const onCommunityTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setCommunityType(event.target.name)
	}
	const handleCreateCommunity = async () => {
		const format = /[ `!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/;

		if (format.test(communityName) || communityName.length < 3) {
			if (error) setError("")
			setError("Community names must be between 3 - 21 characters, and can only contains later, numbers and underscore")
			return
		}

		setLoading(true)

		try {
			const communityDocRef = doc(firestore, "communities", communityName)

			await runTransaction(firestore, async (transaction) => {
				const communityDoc = await transaction.get(communityDocRef)

				if (communityDoc.exists()) {
					throw new Error(`Sorry, r/${communityName} is taken. Try another`)
				}

				transaction.set(communityDocRef, {
					creatorId: user?.uid,
					createAt: serverTimestamp(),
					numberOfMembers: 1,
					privacyType: communityType,
				})

				transaction.set(doc(firestore, `users/${user?.uid}/communitySnippets`, communityName), {
					communityId: communityName,
					isModerator: true,
				})
			})

			handleClose()
			toggleMenuOpen()
			router.push(`r/${communityName}`)
		} catch (error: any) {
			console.log("handleCreateCommunityError", error)
			setError(error.message)
		}

		setLoading(false)
	}

	return (
		<>
			<Modal isOpen={open}
			       onClose={handleClose}
			       size="lg"
			>
				<ModalOverlay/>
				<ModalContent>
					<ModalHeader display="flex"
					             flexDirection="column"
					             fontSize={15}
					             padding={3}
					>
						Create a community
					</ModalHeader>
					<Box pl={3} pr={3}>
						<ModalCloseButton/>
						<ModalBody display="flex"
						           flexDirection="column"
						           padding="10px 0"
						>
							<Text fontWeight={600}
							      fontSize={15}>
								Name
							</Text>
							<Text fontSize={11} color="gray.500">
								Community names including capitalization cannot be changed
							</Text>
							<Text position="relative"
							      top="28px"
							      left="10px"
							      width="20px"
							      color="gray.400"
							>
								r/
							</Text>
							<Input value={communityName}
							       position="relative"
							       size="sm"
							       pl={22}
							       onChange={handleChange}
							/>
							<Text color={charsRemaining === 0 ? "red" : "gray.500"}
							      fontSize={9}
							>
								{charsRemaining} Character remaining
							</Text>
							<Text fontSize="9pt"
							      color="red"
							      pt={1}
							>
								{error}
							</Text>
							<Box mt={4} mb={4}>
								<Text fontWeight={600}
								      fontSize={15}
								>
									Community type
								</Text>
								<Stack>
									<Checkbox name="public"
									          isChecked={communityType === "public"}
									          onChange={onCommunityTypeChange}
									>
										<Flex align="center">
											<Icon as={BsFillPersonFill}
											      color="gray.500"
											      mr={2}
											/>
											<Text fontSize="10pt"
											      mr={1}
											>
												Public
											</Text>
											<Text fontSize="8pt"
											      color="gray.500"
											>
												Anyone can view, post, and comment to this community
											</Text>
										</Flex>
									</Checkbox>
									<Checkbox name="restricted"
									          isChecked={communityType === "restricted"}
									          onChange={onCommunityTypeChange}
									>
										<Flex align="center">
											<Icon as={BsFillEyeFill} color="gray.500" mr={2}/>
											<Text fontSize="10pt"
											      mr={1}
											>
												Restricted
											</Text>
											<Text fontSize="8pt"
											      color="gray.500"
											>
												Anyone can view this community, but only approved users can post
											</Text>
										</Flex>
									</Checkbox>
									<Checkbox name="privet"
									          isChecked={communityType === "privet"}
									          onChange={onCommunityTypeChange}
									>
										<Flex align="center">
											<Icon as={HiLockClosed} color="gray.500" mr={2}/>
											<Text fontSize="10pt"
											      mr={1}
											>
												Privet
											</Text>
											<Text fontSize="8pt"
											      color="gray.500"
											>
												Only approve users can view and submit this
											</Text>
										</Flex>
									</Checkbox>
								</Stack>
							</Box>
						</ModalBody>
					</Box>
					<ModalFooter bg="gray.100" borderRadius="0px 0px 10px 10px">
						<Button colorScheme='blue'
						        mr={3}
						        onClick={handleClose}
						        variant="outline"
						        height="30px"
						>
							Cancel
						</Button>
						<Button height="30px"
						        onClick={handleCreateCommunity}
						        isLoading={loading}
						>
							Create community
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default CreateCommunityModal;