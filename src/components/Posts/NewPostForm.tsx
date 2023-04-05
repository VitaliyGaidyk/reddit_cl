import React, {useState} from 'react';
import {Alert, AlertDescription, AlertIcon, AlertTitle, Flex, Icon, Text} from "@chakra-ui/react";
import {IoDocumentText, IoImageOutline} from "react-icons/io5";
import {BsLink45Deg, BsMic} from "react-icons/bs";
import {BiPoll} from "react-icons/bi";
import TabItem from "@/components/Posts/TabItem";
import TextInputs from "@/components/Posts/PostForm/TextInputs";
import ImageUpload from "@/components/Posts/PostForm/ImageUpload";
import {Post} from "@/atoms/postAtoms";
import {User} from "@firebase/auth";
import {useRouter} from "next/router";
import {addDoc, collection, serverTimestamp, Timestamp, updateDoc} from "@firebase/firestore";
import {firestore, storage} from "@/firebase/clientApp";
import {getDownloadURL, ref, uploadString} from "@firebase/storage";
import useSelectFile from "@/hooks/useSelectFile";

const formTabs: TabItemProp[] = [
	{title: "Post", icon: IoDocumentText},
	{title: "Images & video", icon: IoImageOutline},
	{title: "Link", icon: BsLink45Deg},
	{title: "Poll", icon: BiPoll},
	{title: "Talk", icon: BsMic},
]

type NewPostFormProps = {
	user: User
	communityImageURL?: string
}

export type TabItemProp = {
	title: string,
	icon: typeof Icon.arguments
}
const NewPostForm: React.FC<NewPostFormProps> = (props) => {
	const {user, communityImageURL} = props
	const router = useRouter()
	const [selectedTab, setSelectedTab] = useState(formTabs[0].title)
	const [textInputs, setTextInputs] = useState({
		title: "",
		body: "",
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(false)
	const {onSelectFile, setSelectedFile, selectedFile} = useSelectFile()

	const handleCreatePost = async () => {
		const {communityId} = router.query
		//create new post

		const newPost: Post = {
			communityId: communityId as string,
			communityImageURL: communityImageURL || "",
			creatorId: user?.uid,
			creatorDisplayName: user.email!.split('@'[0]),
			title: textInputs.title,
			body: textInputs.body,
			numberOfComments: 0,
			voteStatus: 0,
			createdAt: serverTimestamp() as Timestamp
		}
		setLoading(true)

		try {
			//store post in db
			const postDocRef = await addDoc(collection(firestore, "posts"), newPost)
			// check if selected file

			if (selectedFile) {
				const imageRef = ref(storage, `posts/${postDocRef.id}/image`)
				await uploadString(imageRef, selectedFile, "data_url")
				const downloadURL = await getDownloadURL(imageRef)
				await updateDoc(postDocRef, {
					imageURL: downloadURL
				})
			}
			router.back()
		} catch (error: any) {
			console.log("handleCreatorPostError", error.message)
			setError(true)
		}
		setLoading(false)

	}

	const onTextChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const {target: {name, value}} = event

		setTextInputs(prev => ({
			...prev,
			[name]: value,
		}))

	}

	return (
		<Flex direction="column"
		      bg="white"
		      borderRadius={4}
		      mt={2}
		>
			<Flex width="100%">
				{formTabs.map((item, index) => (
					<React.Fragment key={index.toString()}>
						<TabItem item={item}
						         selected={item.title === selectedTab}
						         setSelectedTab={setSelectedTab}

						/>
					</React.Fragment>
				))}
			</Flex>
			<Flex p={4}>
				{selectedTab === "Post" &&
                <TextInputs textInputs={textInputs}
                            handeCreatePost={handleCreatePost}
                            onChange={onTextChange}
                            loading={loading}
                />}
				{selectedTab === "Images & video" && <ImageUpload
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                onSelectImage={onSelectFile}
                setSelectedTab={setSelectedTab}
            />}
			</Flex>
			{error && (
				<Alert status='error'>
					<AlertIcon/>
					<Text>Error creating post!</Text>
				</Alert>
			)}
		</Flex>
	);
};

export default NewPostForm;