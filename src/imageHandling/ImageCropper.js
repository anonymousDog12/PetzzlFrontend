import axios from "axios";
import ImageCropPicker from "react-native-image-crop-picker";
import SecureStorage from "react-native-secure-storage";
import { CONFIG } from "../../config";

// TODO: set time out isn't the most ideal solution
// try to find out more about the root cause of why ImageCropPicker.openCropper doesn't show up

const ImageCropper = {
  openCropper: async (uri, petId, onSuccess) => {
    try {
      const accessToken = await SecureStorage.getItem("access");

      setTimeout(async () => {
        try {
          const croppedImage = await ImageCropPicker.openCropper({
            path: uri,
            width: 300,
            height: 300,
            cropping: true,
            cropperCircleOverlay: true,
            freeStyleCropEnabled: true,
          });

          console.log("Cropped image:", croppedImage);

          const formData = new FormData();
          formData.append("file", {
            uri: croppedImage.path,
            type: croppedImage.mime,
            name: croppedImage.path.split("/").pop(),
          });
          formData.append("pet_id", petId);

          const uploadResponse = await axios.post(`${CONFIG.BACKEND_URL}/api/petprofiles/upload_pet_profile_pic/`, formData, {
            headers: {
              "Authorization": `JWT ${accessToken}`,
              "Content-Type": "multipart/form-data",
            },
          });

          console.log("Upload response:", uploadResponse.data);

          if (uploadResponse.status === 200) {
            onSuccess();
          }
        } catch (innerError) {
          console.error("Error during image cropping or upload inside setTimeout:", innerError);
        }
      }, 500); // Adjust timeout duration as needed

    } catch (e) {
      console.error("Error during image cropping or upload:", e);
    }
  },
};

export default ImageCropper;
