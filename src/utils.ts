export const parseJson = (text: string, defaultValue: any = text) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    return defaultValue;
  }
};
