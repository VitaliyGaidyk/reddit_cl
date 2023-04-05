import React, {useEffect, useState} from 'react';
import {useSetRecoilState} from "recoil";
import {authModalState} from "@/atoms/authModalAtom";
import {Button, Flex, Input, Text} from "@chakra-ui/react";
import {useCreateUserWithEmailAndPassword} from "react-firebase-hooks/auth";
import {auth, firestore} from "@/firebase/clientApp"
import {FIREBASE_ERRORS} from "@/firebase/errors";
import {User} from "@firebase/auth";
import {addDoc, collection} from "@firebase/firestore";

const SignUp: React.FC = () => {
	 const setAuthModalState = useSetRecoilState(authModalState)
	 const [signUpForm, setSignUpForm] = useState({
			email: "",
			password: "",
			confirmPassword: "",
	 })
	 const [error, setError] = useState('')
	 const [
			createUserWithEmailAndPassword,
			userCred,
			loading,
			userError,
	 ] = useCreateUserWithEmailAndPassword(auth);
	 //Firebase logic
	 const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault()
			if (error) setError('')
			if (signUpForm.password !== signUpForm.confirmPassword) {
				 setError('Password do not match')
				 return
			}
			createUserWithEmailAndPassword(signUpForm.email, signUpForm.password)
	 }
	 const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			//update form state
			setSignUpForm((prev) => ({
				 ...prev,
				 [event.target.name]: event.target.value
			}))
	 }
	 const createUserDocument = async (user: User) => {
			await addDoc(collection(firestore, "users"), JSON.parse(JSON.stringify(user)))
	 }

	 useEffect(()=> {
			if (userCred) {
				 createUserDocument(userCred.user)
			}
	 }, [userCred])

	 return (
			 <form onSubmit={onSubmit}>
					<Input name="email"
								 required
								 placeholder="email"
								 type="email"
								 mb={2}
								 onChange={onChange}
								 fontSize="10pt"
								 _placeholder={{color: "gray.500"}}
								 _hover={{
										bg: "white",
										border: "1px solid",
										borderColor: "blue.500",
								 }}
								 _focus={{
										outline: "none",
										bg: "white",
										border: "1px solid",
										borderColor: "blue.500",
								 }}
								 bg="gray.50"
					/>
					<Input name="password"
								 required
								 placeholder="password"
								 type="password"
								 mb={2}
								 onChange={onChange}
								 fontSize="10pt"
								 _placeholder={{color: "gray.500"}}
								 _hover={{
										bg: "white",
										border: "1px solid",
										borderColor: "blue.500",
								 }}
								 _focus={{
										outline: "none",
										bg: "white",
										border: "1px solid",
										borderColor: "blue.500",
								 }}
								 bg="gray.50"
					/>
					<Input name="confirmPassword"
								 required
								 placeholder="Confirm password"
								 type="password"
								 mb={2}
								 onChange={onChange}
								 fontSize="10pt"
								 _placeholder={{color: "gray.500"}}
								 _hover={{
										bg: "white",
										border: "1px solid",
										borderColor: "blue.500",
								 }}
								 _focus={{
										outline: "none",
										bg: "white",
										border: "1px solid",
										borderColor: "blue.500",
								 }}
								 bg="gray.50"
					/>
					{error || userError &&
			<Text textAlign="center" color="red" fontSize="10pt">
							 {error || FIREBASE_ERRORS[userError.message as keyof typeof FIREBASE_ERRORS]}
			</Text>
					}
					<Button type="submit"
									width="100%"
									height="36px"
									mt={2}
									mb={2}
									isLoading={loading}
					>
						 Sign Up
					</Button>
					<Flex fontSize="9pt" justifyContent="center">
						 <Text mr={1}>
								Already redditor?
						 </Text>
						 <Text color="blue.500"
									 fontWeight={700}
									 cursor="pointer"
									 onClick={() => setAuthModalState((prev) => ({
											...prev,
											view: "login"
									 }))
									 }
						 >
								Log In
						 </Text>
					</Flex>
			 </form>
	 )
};

export default SignUp;