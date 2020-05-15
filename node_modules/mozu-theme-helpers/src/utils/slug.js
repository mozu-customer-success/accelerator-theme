var REs = [
  [/[\/\\\.~`#\$%\^&\*\+=]/g,'-'],
  [/['"]/g,'']
];

export default function slug(str) {
  if (typeof str !== "string") throw new Error(`Cannot slugify ${str}`);
  return REs.reduce((s, [re, sub]) => s.replace(re, sub), str);
}