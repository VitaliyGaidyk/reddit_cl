import React, {useEffect, useState} from 'react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {Post, postState, PostVote} from "@/atoms/postAtoms";
import {deleteObject, ref} from "@firebase/storage";
import {auth, firestore, storage} from "@/firebase/clientApp";
import {collection, deleteDoc, doc, getDocs, query, where, writeBatch} from "@firebase/firestore";
import {useAuthState} from "react-firebase-hooks/auth";
import {communityState} from "@/atoms/communitiesAtom";
import {authModalState} from "@/atoms/authModalAtom";
import posts from "@/components/Posts/Posts";
import {useRouter} from "next/router";

const usePosts = () => {
	const [user] = useAuthState(auth)
	const [postStateValue, setPostStateValue] = useRecoilState(postState)
	const currentCommunity = useRecoilValue(communityState).currentCommunity
	const setAuthModal = useSetRecoilState(authModalState)
	const router = useRouter()
	const [loading, setLoading] = useState(false);


	const onVote = async (
		event: React.MouseEvent<SVGElement, MouseEvent>,
		post: Post,
		vote: number,
		communityId: string) => {
		event.stopPropagation()

		if (!user?.uid) {
			setAuthModal({open: true, view: "login"})
			return
		}

		const {voteStatus} = post;
		// const existingVote = post.currentUserVoteStatus;
		const existingVote = postStateValue.postVotes.find(
			(vote) => vote.postId === post.id
		);

		// is this an upvote or a downvote?
		// has this user voted on this post already? was it up or down?

		try {
			let voteChange = vote;
			const batch = writeBatch(firestore);

			const updatedPost = {...post};
			const updatedPosts = [...postStateValue.posts];
			let updatedPostVotes = [...postStateValue.postVotes];

			// New vote
			if (!existingVote) {
				const postVoteRef = doc(
					collection(firestore, "users", `${user?.uid}/postVotes`)
				);

				const newVote: PostVote = {
					id: postVoteRef.id,
					postId: post.id!,
					communityId,
					voteValue: vote,
				};

				console.log("NEW VOTE!!!", newVote);

				// newVote.id = postVoteRef.id;

				batch.set(postVoteRef, newVote);

				updatedPost.voteStatus = voteStatus + vote;
				updatedPostVotes = [...updatedPostVotes, newVote];
			}
			// Removing existing vote
			else {
				// Used for both possible cases of batch writes
				const postVoteRef = doc(
					firestore,
					"users",
					`${user?.uid}/postVotes/${existingVote.id}`
				);

				// Removing vote
				if (existingVote.voteValue === vote) {
					voteChange *= -1;
					updatedPost.voteStatus = voteStatus - vote;
					updatedPostVotes = updatedPostVotes.filter(
						(vote) => vote.id !== existingVote.id
					);
					batch.delete(postVoteRef);
				}
				// Changing vote
				else {
					voteChange = 2 * vote;
					updatedPost.voteStatus = voteStatus + 2 * vote;
					const voteIdx = postStateValue.postVotes.findIndex(
						(vote) => vote.id === existingVote.id
					);

					// Vote was found - findIndex returns -1 if not found
					if (voteIdx !== -1) {
						updatedPostVotes[voteIdx] = {
							...existingVote,
							voteValue: vote,
						};
					}
					batch.update(postVoteRef, {
						voteValue: vote,
					});
				}
			}

			let updatedState = {...postStateValue, postVotes: updatedPostVotes};

			const postIdx = postStateValue.posts.findIndex(
				(item) => item.id === post.id
			);

			// if (postIdx !== undefined) {
			updatedPosts[postIdx!] = updatedPost;
			updatedState = {
				...updatedState,
				posts: updatedPosts,

			};
			// }

			/**
			 * Optimistically update the UI
			 * Used for single page view [pid]
			 * since we don't have real-time listener there
			 */
			if (updatedState.selectedPost) {
				updatedState = {
					...updatedState,
					selectedPost: updatedPost,
				};
			}

			// Optimistically update the UI
			setPostStateValue(updatedState);

			// Update database
			const postRef = doc(firestore, "posts", post.id!);
			batch.update(postRef, {voteStatus: voteStatus + voteChange});
			await batch.commit();
		} catch (error) {
			console.log("onVote error", error);
		}
	}

	const getCommunityPostVote = async (communityId: string) => {
		const postVotesQuery = query(
			collection(firestore, 'users', `${user?.uid}/postVotes`),
			where("communityId", "==", communityId))

		const postVoteDocs = await getDocs(postVotesQuery)
		const postVotes = postVoteDocs.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}))

		setPostStateValue(prev => ({
			...prev,
			postVotes: postVotes as PostVote[]
		}))
	}

	useEffect(() => {
		if (!user || !currentCommunity) return
		getCommunityPostVote(currentCommunity?.id)
	}, [user, currentCommunity])

	useEffect(() => {
		// Clear user post votes
		if (!user) {
			setPostStateValue(prev => ({
				...prev,
				postVotes: [],
			}))
		}
	}, [user])
	const onSelectPost = (post: Post) => {
		setPostStateValue((prev) => ({
			...prev,
			selectedPost: post
		}))
		router.push(`/r/${post.communityId}/comments/${post.id}`)
	}

	const onDeletePost = async (post: Post): Promise<boolean> => {

		// check image delete if exists
		try {
			// if post has an image url, delete it from storage
			if (post.imageURL) {
				const imageRef = ref(storage, `posts/${post.id}/image`);
				await deleteObject(imageRef);
			}

			// delete post from posts collection
			const postDocRef = doc(firestore, "posts", post.id!);
			await deleteDoc(postDocRef);


			// Update post state
			setPostStateValue((prev) => ({
				...prev,
				posts: prev.posts.filter((item) => item.id !== post.id),
			}))
			return true
		} catch (error: any) {
			return false
		}
	}

	return {
		postStateValue,
		setPostStateValue,
		loading,
		setLoading,
		onVote,
		onSelectPost,
		onDeletePost,
	}
}

export default usePosts;