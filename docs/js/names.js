// Random name generator — contracts/store-api.md (Name generator). Pure and synchronous.
import { firstNames, lastNames } from './data/names.js';

const pick = (list) => list[Math.floor(Math.random() * list.length)];

export const fullName = ({ firstName, lastName }) => `${firstName} ${lastName}`;

/**
 * @param {'male'|'female'|'ambiguous'} gender  data-model.md Profile.gender
 * @param {string} [previousFullName]           never returned again back-to-back
 */
export function generateName(gender, previousFullName) {
  const pool = firstNames[gender];
  if (!pool) throw new Error(`Unknown gender: ${gender}`);
  let name;
  do {
    name = { firstName: pick(pool), lastName: pick(lastNames) };
  } while (fullName(name) === previousFullName);
  return name;
}
