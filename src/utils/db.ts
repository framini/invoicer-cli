import Conf from 'conf';

const isBlacklistedKey = (key: string) => ['fields'].includes(key);
const isRef = (key: string) => key === 'ref' || key.endsWith('Ref');
const FILTERS = [isRef, isBlacklistedKey]

const serialize = (value: any) =>
  JSON.stringify(
    value,
    function replacer(key, value) {
      // To avoid clutter we'll filter out machine references and
      // other non important keys
      if (FILTERS.some(f => f(key))) {
        return undefined;
      }

      return value;
    },
    '\t'
  );

export const db = new Conf({
  serialize,
  projectName: 'invoicer-cli'
});
