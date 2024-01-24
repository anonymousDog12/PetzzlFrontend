import ImageCropPicker from "react-native-image-crop-picker";

const TemporaryImageCropper = {
  openCropper: async (uri, onSuccess) => {
    try {
      const croppedImage = await ImageCropPicker.openCropper({
        path: uri,
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true,
        freeStyleCropEnabled: true,
      });

      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(croppedImage.path);
      }
    } catch (error) {
      console.error("Error during image cropping:", error);
    }
  },
};

export default TemporaryImageCropper;
