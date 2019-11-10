export const getTransitionFromId = (id: string): any => {
  return id;
};

export const capitalize = (s: string) => {
  return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
};

export const getSingular = (word: string) => {
  // we're gonna be using this for words that can "singularized" by
  // just removing the 's' at the end so YOLO ¯\_(ツ)_/¯
  return word.substr(0, word.length - 1)
}
