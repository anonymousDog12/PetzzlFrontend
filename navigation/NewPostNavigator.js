import { createStackNavigator } from '@react-navigation/stack';
import SelectPhotoScreen from '../screens/NewPost/SelectPhotoScreen';
import AddCaptionScreen from '../screens/NewPost/AddCaptionScreen';

const Stack = createStackNavigator();

const NewPostNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SelectPhoto" component={SelectPhotoScreen} />
      <Stack.Screen name="AddCaption" component={AddCaptionScreen} />
    </Stack.Navigator>
  );
};

export default NewPostNavigator;
