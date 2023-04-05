import React from 'react';
import {Button, Flex, Input, Stack, Textarea} from "@chakra-ui/react";

type TextInputsProps = {
	textInputs: {
		title: string
		body: string
	}
	onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
	handeCreatePost: () => void
	loading: boolean
}
const TextInputs: React.FC<TextInputsProps> = (props) => {
	const {textInputs, onChange, handeCreatePost, loading} = props

	return (
		<Stack spacing={3}
		       width="100%"
		>
			<Input
				name="title"
				value={textInputs.title}
				onChange={onChange}
				fontSize="10pt"
				borderRadius={4}
				placeholder="Title"
				_placeholder={{color: "gray.500",}}
				_focus={{
					outline: "none",
					bg: "white",
				}}
			/>
			<Textarea
				name="body"
				value={textInputs.body}
				onChange={onChange}
				fontSize="10pt"
				height="100px"
				resize="none"
				borderRadius={4}
				placeholder="Text (optional)"
				_placeholder={{color: "gray.500",}}
				_focus={{
					outline: "none",
					bg: "white",
				}}
			/>
			<Flex justify="flex-end">
				<Button height="34px"
				        p="0px 30px"
				        isDisabled={!textInputs.title}
				        isLoading={loading}
				        onClick={handeCreatePost}
				>
					post
				</Button>
			</Flex>
		</Stack>
	);
};

export default TextInputs;