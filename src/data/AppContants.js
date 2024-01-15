// Field names (matching backend data schema)
export const PET_PAGE_CREATION_FIELD_NAMES = {
  PET_ID: "pet_id",
  USER_ID: "user",
  PET_NAME: "pet_name",
  PET_TYPE: "pet_type",
  BIRTHDAY: "birthday",
  GENDER: "gender",
  BIO: "bio",
};

// These are the actual values that match the backend
export const PET_TYPES = {
  DOG: "dog",
  CAT: "cat",
  BIRD: "bird",
  FISH: "fish",
  HORSE: "horse",
  RABBIT: "rabbit",
  TURTLE: "turtle",
  OTHER: "other",
};

// These are display texts
export const PET_TYPE_DISPLAY = {
  [PET_TYPES.DOG]: "🐶 Dog",
  [PET_TYPES.CAT]: "🐱 Cat",
  [PET_TYPES.BIRD]: "🐦 Bird",
  [PET_TYPES.FISH]: "🐠 Fish",
  [PET_TYPES.HORSE]: "🐴 Horse",
  [PET_TYPES.RABBIT]: "🐰 Rabbit",
  [PET_TYPES.TURTLE]: "🐢 Turtle",
  [PET_TYPES.OTHER]: "🐾 Other",
};


export const DEFAULT_PROFILE_PICS = {
  [PET_TYPES.DOG]: "https://petzzl.sfo3.cdn.digitaloceanspaces.com/default-profile-pics/dog.png",
  [PET_TYPES.CAT]: "https://petzzl.sfo3.cdn.digitaloceanspaces.com/default-profile-pics/cat.png",
  [PET_TYPES.BIRD]: "https://petzzl.sfo3.cdn.digitaloceanspaces.com/default-profile-pics/bird.png",
  [PET_TYPES.FISH]: "https://petzzl.sfo3.cdn.digitaloceanspaces.com/default-profile-pics/fish.png",
  [PET_TYPES.HORSE]: "https://petzzl.sfo3.cdn.digitaloceanspaces.com/default-profile-pics/horse.png",
  [PET_TYPES.RABBIT]: "https://petzzl.sfo3.cdn.digitaloceanspaces.com/default-profile-pics/rabbit.png",
  [PET_TYPES.TURTLE]: "https://petzzl.sfo3.cdn.digitaloceanspaces.com/default-profile-pics/turtle.png",
  [PET_TYPES.OTHER]: "https://petzzl.sfo3.cdn.digitaloceanspaces.com/default-profile-pics/other.png",
};


// Report reasons (matching backend data schema)
export const REPORT_REASONS = {
  DL: 'I Just Don\'t Like It',
  NP: 'Not a Pet Photo',
  SP: 'Self Promotion',
  IC: 'Inappropriate Content',
  IP: 'Intellectual Property Violation',
  VD: 'Violence or Dangerous Organizations',
  NS: 'Nudity or Sexual Activity',
  OT: 'Other',
};
