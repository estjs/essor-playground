import { atou, utoa } from '../utils';

export function loadHashCode() {
  try {
    const hash = location.hash;
    if (!hash || hash.length <= 1) return '';
    const code = atou(hash.slice(1));
    return code;
  } catch (error) {
    console.error('Failed to load hash code:', error);
    return '';
  }
}

export function setHashCode(code: string) {
  try {
    location.hash = utoa(code);
  } catch (error) {
    console.error('Failed to set hash code:', error);
  }
}
