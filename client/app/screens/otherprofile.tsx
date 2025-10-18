import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { profileStyles as styles } from "../styles/profilestyles";
import { Link } from "expo-router";
import { Feather } from "@expo/vector-icons"; // nice icons for edit button

export default function OtherProfileScreen() {
  const profileData = {
    profileImage: "https://via.placeholder.com/150",
    displayName: "Jane Doe",
    username: "@janedoe123",
    bio: "Lover of coffee, travel, and late-night coding 🚀",
    bgColor: "#6c63ff", // match your profile header color
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Header / Banner */}
      <View style={[styles.header, { backgroundColor: profileData.bgColor }]}>
        
        {/* Edit Button in top-left */}
        <Link href="/screens/profile" asChild>
          <TouchableOpacity style={styles.editButton}>
            <Feather name="edit-2" size={20} color="#fff" />
          </TouchableOpacity>
        </Link>

        {/* Profile Image OVERLAPPING the header */}
        <View style={styles.profileImageContainerOther}>
          <Image
            source={{ uri: profileData.profileImage }}
            style={styles.profileImage}
          />
        </View>

      </View>

      {/* Text Content */}
      <Text style={styles.displayName}>{profileData.displayName}</Text>
      <Text style={styles.username}>{profileData.username}</Text>
      <Text style={styles.bio}>{profileData.bio}</Text>

    </ScrollView>
  );
}
