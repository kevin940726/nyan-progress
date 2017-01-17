const colors = [
  { name: 'red', code: 9 },
  { name: 'orange', code: 208 },
  { name: 'yellow', code: 11 },
  { name: 'green', code: 10 },
  { name: 'blue', code: 12 },
  { name: 'indigo', code: 54 },
  { name: 'violet', code: 93 },
];

const C = index => str => `\x1b[38;5;${colors[index].code}m${str}\x1b[0m`;

const applyColors = (rainbow) => {
  const applyByOrder = (base, char) => {
    if (char === '-') return C(base)(char);
    else if (char === '_') return C(base + 1)(char);
    return char;
  };

  return rainbow.map((line, r) => (
    line.split('')
      .map(char => applyByOrder(r * 2, char))
      .join('')
  ));
};

export default applyColors;
