import { useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { profileStyles as styles } from "../styles/profilestyles";


export default function ProfileScreen() {
  // Editable fields
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bgColor, setBgColor] = useState("#6c63ff"); // default fun purple
  //const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  // Non-editable email & username (pretend we got it from backend/auth)
  const email = "user@example.com";
  const username = "exampleuser"

  // Pick new profile picture
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    console.log("Profile updated:", {
      profileImage,
      displayName,
      username,
      bio,
    });
    alert("Profile updated!");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Header with background color */}
      <View style={[styles.header, { backgroundColor: bgColor }]}>
        {/* Empty space for the banner */}
      </View>

      {/* Profile image overlapping banner + background */}
      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, styles.placeholder]}>
              <Text style={{ color: "#888" }}>Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>
    
      </View>

      {/* Editable display name */}
      <TextInput
        style={styles.input}
        placeholder= "Display name"
        value={displayName}
        onChangeText={setDisplayName}
      />

      {/* Non-editable username */}
      <View style={styles.emailBox}>
        <Text style={styles.emailLabel}>Username</Text>
        <Text style={styles.emailValue}>{username}</Text>
      </View>

      {/* Non-editable email */}
      <View style={styles.emailBox}>
        <Text style={styles.emailLabel}>Email</Text>
        <Text style={styles.emailValue}>{email}</Text>
      </View>

      {/* Editable bio */}
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Write your very own prompt!"
        value={bio}
        onChangeText={setBio}
        multiline
      />

      {/* Save button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
      
    </ScrollView>
  );
}
