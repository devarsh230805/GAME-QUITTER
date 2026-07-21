import { client, account } from "react-native-appwrite";
import { Platform } from "react-native";

const client = new client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID);

switch (Platform.OS) {
  case "android":
    client.setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_PACKAGE_NAME);
}

const account = new account(client);

export { account };
