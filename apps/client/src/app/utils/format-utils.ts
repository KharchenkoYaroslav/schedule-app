export const formatTypeAndFormat = (
  type: string | undefined,
  format: string | undefined
): string => {
  const typeStr = type ? `${type}.,` : '';
  const formatStr = format ? `${format}.` : '';

  if (typeStr && formatStr) {
      return `${typeStr} ${formatStr}`;
  } else if (typeStr) {
      return typeStr; 
  } else if (formatStr) {
      return formatStr;
  }
  return '';
};

export const formatSubject = (subject: string | undefined) => subject || '';

export const transformName = (fullName: string | undefined): string => {
  if (!fullName) return '';

  const words = fullName.split(' ');

  if (words.length !== 3) {
    return fullName;
  }

  const firstWord = words[0];
  const secondInitial = words[1][0] + '.';
  const thirdInitial = words[2][0] + '.';
  return `${firstWord} ${secondInitial}${thirdInitial}`;
};
