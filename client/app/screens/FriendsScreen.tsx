import React, { useState, useMemo } from 'react';
import { View, Text, SafeAreaView, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { createThemedStyles } from '../../styles/themedStyles';

export default function FriendsScreen() {
  const { styles: themeStyles } = useTheme();
  const styles = useMemo(() => createThemedStyles(themeStyles), [themeStyles]);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with real data from backend
  const recentFollowers = [
    { id: '1', username: 'sarah_m', name: 'Sarah Miller', avatar: 'https://i.pravatar.cc/150?img=1', isFollowing: false },
    { id: '2', username: 'mike_j', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=2', isFollowing: true },
    { id: '3', username: 'emma_w', name: 'Emma Wilson', avatar: 'https://i.pravatar.cc/150?img=3', isFollowing: false },
  ];

  const suggestions = [
    { id: '4', username: 'alex_k', name: 'Alex Kumar', avatar: 'https://i.pravatar.cc/150?img=4', mutualFriends: 3 },
    { id: '5', username: 'lisa_p', name: 'Lisa Park', avatar: 'https://i.pravatar.cc/150?img=5', mutualFriends: 5 },
    { id: '6', username: 'james_r', name: 'James Rodriguez', avatar: 'https://i.pravatar.cc/150?img=6', mutualFriends: 2 },
  ];

  const peopleYouMayKnow = [
    { id: '7', username: 'olivia_t', name: 'Olivia Taylor', avatar: 'https://i.pravatar.cc/150?img=7', mutualFriends: 8 },
    { id: '8', username: 'daniel_l', name: 'Daniel Lee', avatar: 'https://i.pravatar.cc/150?img=8', mutualFriends: 4 },
    { id: '9', username: 'sophia_c', name: 'Sophia Chen', avatar: 'https://i.pravatar.cc/150?img=9', mutualFriends: 6 },
    { id: '10', username: 'noah_b', name: 'Noah Brown', avatar: 'https://i.pravatar.cc/150?img=10', mutualFriends: 1 },
  ];

  const handleFollow = (userId: string) => {
    console.log('Follow user:', userId);
    // Implement follow logic
  };

  const handleRemove = (userId: string) => {
    console.log('Remove suggestion:', userId);
    // Implement remove suggestion logic
  };

  // Filter users based on search query
  const filterUsers = (users: any[]) => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    );
  };

  const filteredRecentFollowers = useMemo(() => filterUsers(recentFollowers), [searchQuery]);
  const filteredSuggestions = useMemo(() => filterUsers(suggestions), [searchQuery]);
  const filteredPeopleYouMayKnow = useMemo(() => filterUsers(peopleYouMayKnow), [searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <Text style={styles.headerTitle}>Friends</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8b92a0" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8b92a0"
          />
        </View>

        {/* Recent Followers Section */}
        {filteredRecentFollowers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Followers</Text>
          {filteredRecentFollowers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userHandle}>@{user.username}</Text>
              </View>
              <TouchableOpacity
                style={[styles.followButton, user.isFollowing && styles.followingButton]}
                onPress={() => handleFollow(user.id)}
              >
                <Text style={[styles.followButtonText, user.isFollowing && styles.followingButtonText]}>
                  {user.isFollowing ? 'Following' : 'Follow Back'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        )}

        {/* Suggestions Section */}
        {filteredSuggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggestions For You</Text>
          {filteredSuggestions.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userHandle}>@{user.username}</Text>
                <Text style={styles.mutualFriends}>
                  {user.mutualFriends} mutual friend{user.mutualFriends !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.followButton}
                  onPress={() => handleFollow(user.id)}
                >
                  <Text style={styles.followButtonText}>Follow</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemove(user.id)}
                >
                  <Ionicons name="close" size={20} color="#999" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        )}

        {/* People You May Know Section */}
        {filteredPeopleYouMayKnow.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>People You May Know</Text>
          {filteredPeopleYouMayKnow.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userHandle}>@{user.username}</Text>
                <Text style={styles.mutualFriends}>
                  {user.mutualFriends} mutual friend{user.mutualFriends !== 1 ? 's' : ''}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.followButton}
                onPress={() => handleFollow(user.id)}
              >
                <Text style={styles.followButtonText}>Follow</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        )}

        {/* No Results Message */}
        {searchQuery.trim() !== '' &&
         filteredRecentFollowers.length === 0 &&
         filteredSuggestions.length === 0 &&
         filteredPeopleYouMayKnow.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={48} color="#8b92a0" />
            <Text style={styles.noResultsText}>No results found</Text>
            <Text style={styles.noResultsSubtext}>
              Try searching for a different name or username
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
