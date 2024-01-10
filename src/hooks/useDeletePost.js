import { Alert } from 'react-native';
import SecureStorage from 'react-native-secure-storage';
import { useDispatch } from 'react-redux';
import { CONFIG } from '../../config';
import { deletePostSuccess } from '../redux/actions/dashboard';

export const useDeletePost = (navigation, setIsDeleting) => {
  const dispatch = useDispatch();

  const deletePost = async (postId) => {
    setIsDeleting(true);
    const accessToken = await SecureStorage.getItem('access');
    if (!accessToken) {
      console.error('JWT token not found');
      setIsDeleting(false);
      return;
    }

    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/delete_post/${postId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `JWT ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to delete the post');
        setIsDeleting(false);
        return;
      }

      dispatch(deletePostSuccess(postId));
      navigation.goBack(); // Navigate back to the dashboard
    } catch (error) {
      console.error('Deletion error:', error);
      setIsDeleting(false);
    }
  };

  return (postId) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => deletePost(postId),
          style: 'destructive',
        },
      ],
      { cancelable: false },
    );
  };
};
