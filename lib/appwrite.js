import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.myaora',
    projectId: '678235c800050b83201f',
    databaseId: '678239680011bdb56e07',
    userCollectionId: '678239ae000784f4609f',
    videoCollectionId: '67850bce00061232d39f',
    storageId: '67823d240008ab1ec2b3'
}

const {
  endpoint,
    platform,
    projectId,
    databaseId,
    userCollectionId,
    videoCollectionId,
    storageId,
} = config
// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform) // Your application ID or bundle ID.
;

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (email, password, username) => {
    try {
        // Create a new user account
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        );

        if (!newAccount) {
            throw new Error("Failed to create account.");
        }

        console.log("New Account ID:", newAccount.$id); // Debugging

        // Generate an avatar URL for the new user
        const avatarUrl = avatars.getInitials(username);

        // Sign in the new user to create a session
        await signIn(email, password);

        // Create a document for the new user in the database
        const newUser = await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            {
                email: email,
                username: username,
                avatar: avatarUrl,
                accountId: newAccount.$id,
            }
        );

        console.log("New User Document Created:", newUser); // Debugging

        return newUser;
    } catch (error) {
        console.error("Error creating user:", error.message || error);
        throw new Error(error.message || "Failed to create user.");
    }
};


export const signIn = async (email, password) => {
    try {
      // Step 1: Check for an active session
      const session = await account.get();
      if (session) {
        console.log("Active session found:", session);
        return session; // Return the current session if it exists
      }
    } catch (error) {
      // Step 2: If no session exists, proceed (ignore error 401 - no active session)
      if (error.code !== 401) {
        throw new Error("Failed to check for an active session");
      }
    }
  
    // Step 3: Create a new session if no active session exists
    try {
      const newSession = await account.createEmailPasswordSession(email, password);
      console.log("New session created:", newSession);
      return newSession;
    } catch (error) {
      throw new Error(error.message || "Failed to sign in");
    }
  }
  
  export const getCurrentUser = async () => {
    try {
      const currentAccount = await account.get();
      if (!currentAccount) throw Error;
  
      const currentUser = await databases.listDocuments(
        config.databaseId,
        config.userCollectionId,
        [Query.equal("accountId", currentAccount.$id)]
      );
  
      if (!currentUser) throw Error;
  
      return currentUser.documents[0];
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  export const getAllPosts = async () => {
    try {
      const posts = await databases.listDocuments(
        databaseId,
        videoCollectionId,
        [Query.orderDesc("$createdAt")]
      );
  
      return posts.documents;
    } catch (error) {
      throw new Error(error);
    }
  }
  export const getLatestVideos = async () => {
    try {
      const posts = await databases.listDocuments(
        databaseId,
        videoCollectionId,
        [Query.orderDesc("$createdAt"), Query.limit(7)]
      );
  
      return posts.documents;
    } catch (error) {
      throw new Error(error);
    }
  }
  export const searchVideos = async (query) => {
    try {
      const posts = await databases.listDocuments(
        databaseId,
        videoCollectionId,
        [Query.search('title', query)]
      );
  
      return posts.documents;
    } catch (error) {
      throw new Error(error);
    }
  }

  export const getUserVideos = async (userId) => {
    try {
      const posts = await databases.listDocuments(
        databaseId,
        videoCollectionId,
        [Query.equal('creator', userId), Query.orderDesc("$createdAt")]
      );
  
      return posts.documents;
    } catch (error) {
      throw new Error(error);
    }
  }
  // Sign Out
export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getFilePreview(fileId, type) {
  let fileUrl;

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
}

// Upload File
export const uploadFile = async(file, type) => {
  if (!file) return;

  const { mimeType, ...rest } = file;
  const asset = {
    name: file.fileName,
    type: mimeType,
    size: file.fileSize,
    uri: file.uri
    };

  try {
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
}

// Create Video Post
export const createVideo = async (form) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument(
      databaseId,
      videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: form.userId,
      }
    );

    return newPost;
  } catch (error) {
    throw new Error(error);
  }
}