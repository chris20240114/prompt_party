import { StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f5fd",
  },
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
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
    marginBottom: 60,
    marginTop: 0,
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

  // 🔥 Streak Badge
  streakBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF6B35",
    marginLeft: 4,
    marginRight: 2,
  },
  streakLabel: {
    fontSize: 10,
    color: "#666",
    fontWeight: "600",
  },

  // 💬 Custom Prompt Section
  customPromptContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  promptHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  customPromptTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6c63ff",
    marginLeft: 8,
  },
  customPromptText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
    lineHeight: 22,
  },
  promptInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fafafa",
    minHeight: 80,
    marginBottom: 10,
    fontSize: 15,
    textAlignVertical: "top",
  },
  promptSubmitButton: {
    backgroundColor: "#6c63ff",
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#6c63ff",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  promptSubmitText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
  },
  responseSubmitted: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
  },
  responseSubmittedText: {
    color: "#2e7d32",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 8,
  },

  // ⭐ Pinned Prompts Section
  pinnedSection: {
    width: "90%",
    marginBottom: 30,
  },
  pinnedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  pinnedTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginLeft: 8,
  },
  pinnedCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  pinnedPromptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  pinnedPrompt: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
    flex: 1,
    marginRight: 10,
  },
  pinnedAnswer: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    marginBottom: 12,
  },
  pinnedFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  likesText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 5,
    fontWeight: "500",
  },
  dateText: {
    fontSize: 12,
    color: "#999",
  },

  // Help text styles
  promptHelpText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
    lineHeight: 18,
  },
  pinnedHelpText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 15,
    lineHeight: 18,
  },

  // Empty state for pinned responses
  emptyPinnedState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#eee",
    borderStyle: "dashed",
  },
  emptyPinnedText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
    marginTop: 10,
  },
  emptyPinnedSubtext: {
    fontSize: 13,
    color: "#bbb",
    marginTop: 5,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
