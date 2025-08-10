import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { Text, View } from "react-native";
//import { SignOutButton } from "@/app/components/SignOutButton";

const Home = () => {
	const { user } = useUser();

	return (
		<View>
			<SignedIn>
				<Text>Hello {user?.emailAddresses[0].emailAddress} to Celer</Text>
				{/*<SignOutButton />*/}
			</SignedIn>
			<SignedOut>
				<Link href="/(auth)/sign-in">
					<Text>Sign in</Text>
				</Link>
				<Link href="/(auth)/sign-up">
					<Text>Sign up</Text>
				</Link>
			</SignedOut>
		</View>
	);
}
export default Home;