import { DEFAULT_PROFILE_PICS, PET_TYPES } from "../data/AppContants";


export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};


export const validatePetName = (name) => {
  const trimmedName = name.trim().replace(/\s+/g, " ");

  if (trimmedName.length < 2 || trimmedName.length > 50) {
    return { error: "Pet name must be between 2 and 50 characters." };
  }
  if (!/^[a-zA-Z0-9 ]+$/.test(trimmedName)) {
    return { error: "Pet name must be alphanumeric and may include spaces." };
  }
  return { validName: trimmedName };
};


export const getGenderText = (gender) => {
  switch(gender) {
    case 'f': return 'Girl';
    case 'm': return 'Boy';
    default: return '';
  }
};


export const getProfilePic = (profilePic, petType) => {
  return profilePic || DEFAULT_PROFILE_PICS[petType] || DEFAULT_PROFILE_PICS[PET_TYPES.OTHER];
};
