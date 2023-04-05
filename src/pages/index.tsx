import {NextPage} from "next";
import PageContent from "@/components/Layout/PageContent";
import {useAuthState} from "react-firebase-hooks/auth";
import {auth, firestore} from "@/firebase/clientApp";
import {useEffect, useState} from "react";
import {collection, getDocs, limit, orderBy, query, where} from "@firebase/firestore";
import usePosts from "@/hooks/usePosts";
import {Post, PostVote} from "@/atoms/postAtoms";
import PostLoader from "@/components/Posts/PostLoader";
import {Stack} from "@chakra-ui/react";
import PostItem from "@/components/Posts/PostItem";
import CreatePostLink from "@/components/Community/CreatePostLink";
import posts from "@/components/Posts/Posts";
import useCommunityData from "@/hooks/useCommunityData";
import Recommendations from "@/components/Community/Recommendations";

const Home: NextPage = () => {
	const [user, loadingUser] = useAuthState(auth)
	const [loading, setLoading] = useState(false)
	const {postStateValue, setPostStateValue, onSelectPost, onDeletePost, onVote} = usePosts()
	const {communityStateValue} = useCommunityData()

	const buildUserHomeFeed = async () => {
		setLoading(true)

		try {
			if (communityStateValue.mySnippets.length) {
				const myCommunityId = communityStateValue.mySnippets.map(snippet => snippet.communityId)
				const postQuery = query(collection(firestore, 'posts'),
					where('communityId', "in", myCommunityId),
					limit(10)
				)

				const postDocs = await getDocs(postQuery)
				const posts = postDocs.docs.map(doc => ({
					id: doc.id,
					...doc.data()
				}))
				setPostStateValue(prev => ({
					...prev,
					posts: posts as Post[]
				}))
			} else {
				buildNoUserHomeFeed()
			}
		} catch (error: any) {
			console.log("Error buildUserHomeFeed", error.message)
		}

		setLoading(false)
	}

	const buildNoUserHomeFeed = async () => {
		setLoading(true)

		try {
			const postQuery = query(collection(firestore, 'posts'),
				orderBy('voteStatus', 'desc'),
				limit(10))

			const postDocs = await getDocs(postQuery)
			const posts = postDocs.docs.map(doc => ({
				id: doc.id,
				...doc.data(),
			}))

			setPostStateValue((prev) => ({
				...prev,
				posts: posts as Post[]
			}))
		} catch (error: any) {
			console.log("error buildNoUserHoneFeed", error.message)
		}

		setLoading(false)
	}

	const getUserPostVotes = async () => {
		try {
			const postIds = postStateValue.posts.map(post => post.id)
			const postVotesQuery = query(collection(firestore, `users/${user?.uid}/postVotes`),
				where('postId', 'in', postIds)
			)
			const postVotesDocs = await getDocs(postVotesQuery)
			const postVotes = postVotesDocs.docs.map(doc => ({id: doc.id, ...doc.data()}))

			setPostStateValue((prev) => ({
				...prev,
				postVotes: postVotes as PostVote[]
			}))
		} catch (error) {
			console.log('getUserPostVotes error', error.message)
		}
	}

	useEffect(() => {
		if (communityStateValue.snippetsFetch) buildUserHomeFeed()
	}, [communityStateValue.snippetsFetch])

	useEffect(() => {
		if (!user && !loadingUser) buildNoUserHomeFeed()
	}, [user, loadingUser])

	useEffect(() => {
		if (user && postStateValue.posts.length) getUserPostVotes()

		return () => {
			setPostStateValue((prev) => ({
				...prev,
				postVotes: [],
			}))
		}
	}, [user, postStateValue.posts])

	return (
		<PageContent>
			<>
				<CreatePostLink/>
				{loading ? (
					<PostLoader/>
				) : (
					<Stack>
						{postStateValue.posts.map(post => (
							<PostItem key={post.id}
							          post={post}
							          onSelectPost={onSelectPost}
							          onVote={onVote}
							          onDeletePost={onDeletePost}
							          userVoteValue={postStateValue.postVotes.find(item => item.postId === post.id)?.voteValue}
							          userIsCreator={user?.uid === post.creatorId}
							          homePage
							/>
						))}
					</Stack>
				)}
			</>
				<Recommendations/>
		</PageContent>
	)
}

export default Home