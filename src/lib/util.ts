export const parseCookie = (str: string | null | undefined) => {
  console.log('parseCookie', str);
  if (!str) return {};
  return str
    .split(';')
    .map((v) => v.split('='))
    .reduce((acc: any, v) => {
      if (v.length == 2) acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
};
