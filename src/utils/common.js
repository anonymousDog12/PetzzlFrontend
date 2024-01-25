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
