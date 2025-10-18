import { StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f5fd", // soft background
  },

  // 🟣 Header/Banner
  header: {
    width: "100%",
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 20,
    overflow: "visible"
  },

  // ✏️ Edit button in top-left of header
  editButton: {
    position: "absolute",
    top: 10, // adjust for safe area / notch
    left: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 8,
  },

  // 🖼 Profile image container + overlap
  profileImageContainer: {
    alignItems: "center",
    marginTop: -90, // pulls image up to overlap the banner
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
  },

  // ✏️ Text styles
  displayName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#333",
    marginTop: 40,
    marginBottom: 3,
  },
  username: {
    fontSize: 16,
    color: "#888",
    marginBottom: 15,
  },
  bio: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },

  // 📝 Input + Boxes
  input: {
    width: "90%",
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  emailBox: {
    width: "90%",
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  emailLabel: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  emailValue: {
    color: "#333",
  },

  // 💾 Save button
  button: {
    backgroundColor: "#6c63ff",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginTop: 10,
    shadowColor: "#6c63ff",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  profileImageContainerOther: {
    position: "absolute",
    bottom: -60, // moves the image halfway out of the banner
    alignSelf: "center",
  },
});
