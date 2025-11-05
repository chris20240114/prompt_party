import { StyleSheet } from "react-native";

export const friendsStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f5fd",
  },
  container: {
    flex: 1,
    backgroundColor: "#f9f5fd",
  },
  header: {
    padding: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#6c63ff",
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  section: {
    marginTop: 10,
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#f0ebff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 3,
  },
  userHandle: {
    fontSize: 13,
    color: "#999",
    marginBottom: 3,
  },
  mutualFriends: {
    fontSize: 12,
    color: "#6c63ff",
    fontWeight: "500",
  },
  followButton: {
    backgroundColor: "#6c63ff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#6c63ff",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  followButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  followingButton: {
    backgroundColor: "#f0ebff",
    borderWidth: 0,
    shadowOpacity: 0,
  },
  followingButtonText: {
    color: "#6c63ff",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0ebff",
    justifyContent: "center",
    alignItems: "center",
  },
});
