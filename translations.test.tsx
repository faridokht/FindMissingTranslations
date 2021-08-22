import { exec } from 'child_process';
import en from 'locales/en/translations.json';
import de from 'locales/de/translations.json';

const srcPath = '.';

const translationKeysEn : string [] = getAllKeys(en, '', []);
const translationKeysDe : string [] = getAllKeys(de, '', []);

describe('i18n', () => {
  it('should EN translation have no missing keys', () => {
    const missingKeysInEnTranslation = translationKeysDe.filter(
      (x) => !translationKeysEn.includes(x),
    );
    expect(missingKeysInEnTranslation).toEqual([]);
  });

  it('should DE translation have no missing keys', () => {
    const missingKeysInDeTranslation = translationKeysEn.filter(
      (x) => !translationKeysDe.includes(x),
    );
    expect(missingKeysInDeTranslation).toEqual([]);
  });

  it.concurrent.each(getKeysForUsageCheck())('should find at least one use case for %p', async (phraseKey) => {
    await new Promise<void>(
      (done) => {
        exec(`grep -rnw --include='*.tsx' --exclude='*.test.tsx' '${srcPath}' -e '${phraseKey}'`,
          (_, stdout) => {
            expect(stdout).not.toEqual('');
            done();
          });
      },
    );
  });
});

function getAllKeys(obj, stack, array) {
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object') {
      getAllKeys(value, `${stack}.${key}`, array);
    } else {
      array.push(`${stack.slice(1)}.${key}`);
    }
  }
  return array;
}

// modify (filter, exclude,...) key list for usage test
function getKeysForUsageCheck() {
  return (translationKeysEn.length > translationKeysDe.length)
    ? translationKeysEn
    : translationKeysDe;
}
