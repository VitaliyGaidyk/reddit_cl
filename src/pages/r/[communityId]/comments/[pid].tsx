import React, {useEffect} from 'react';
import PageContent from "@/components/Layout/PageContent";
import PostItem from "@/components/Posts/PostItem";
import usePosts from "@/hooks/usePosts";
import {useAuthState} from "react-firebase-hooks/auth";
import {auth, firestore} from "@/firebase/clientApp";
import {useRouter} from "next/router";
import {doc, getDoc} from "@firebase/firestore";
import {Post} from "@/atoms/postAtoms";
import About from "@/components/Community/About";
import useCommunityData from "@/hooks/useCommunityData";

const PostPage: React.FC = () => {
	const [user] = useAuthState(auth)
	const {postStateValue, setPostStateValue, onDeletePost, onVote} = usePosts()
	const router = useRouter()
	const {communityStateValue} = useCommunityData()

	const fetchPost = async (postId: string) => {
		try {
			const postDocRef = doc(firestore, 'posts', postId)
			const postDoc = await getDoc(postDocRef)
			setPostStateValue((prev) => ({
				...prev,
				selectedPost: {id: postDoc.id, ...postDoc.data()} as Post
			}))

		} catch (error: any) {
			console.log("error fetchPost", error.message)
		}
	}

	useEffect(() => {
		const {pid} = router.query

		if (pid && !postStateValue.selectedPost) {
			fetchPost(pid as string)
		}
	}, [router.query, postStateValue.selectedPost])

	return (
		<PageContent>
			{postStateValue.selectedPost && (
				<PostItem
					post={postStateValue.selectedPost}
					onVote={onVote}
					onDeletePost={onDeletePost}
					userVoteValue={
						postStateValue.postVotes.find(
							(item) => item.postId === postStateValue.selectedPost!.id
						)?.voteValue
					}
					userIsCreator={
						user?.uid === postStateValue.selectedPost.creatorId
					}
				/>
			)}
			{communityStateValue.currentCommunity &&
             <About
                 communityData={
						  communityStateValue.currentCommunity
					  }
             />
			}
		</PageContent>
	)
};

export default PostPage;