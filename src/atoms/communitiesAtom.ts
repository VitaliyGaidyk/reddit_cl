import {atom} from "recoil";
import {Timestamp} from "@firebase/firestore";

export interface Community {
	id: string;
	creatorId: string;
	numberOfMembers: number;
	privacyType: "public" | "private" | "restricted";
	createAt?: Timestamp;
	imageURL?: string;
}

export interface CommunitySnippet {
	communityId: string,
	isModerate?: boolean,
	imageURL?: string
}

interface CommunityState {
	mySnippets: CommunitySnippet[],
	currentCommunity?: Community,
	snippetsFetch: boolean,

}

const defaultCommunityState: CommunityState = {
	mySnippets: [],
	snippetsFetch: false
}

export const communityState = atom<CommunityState>({
	key: "communityState",
	default: defaultCommunityState
})