/* eslint-env node */

import { walk } from 'estree-walker';

import fs from 'fs';
import path from 'path';

const translationsPath = path.join(__dirname, './docs/translations.json');

export default function Translations() {
  let translations = [];

  return {
    name: 'translations',
    buildStart: () => {
      if (fs.existsSync(translationsPath)) {
        const file = fs.readFileSync(translationsPath, 'utf8');

        translations = JSON.parse(file);
      }
    },
    moduleParsed: (moduleInfo) => {
      const { ast } = moduleInfo;

      walk(ast, {
        enter(node, parent, prop, index) {
          const {
            type,
            callee,
            arguments: args
          } = node;

          if (type === 'CallExpression' && callee.name === 'translate' && (args.length === 1 || args.length === 2)) {
            const key = args[ 0 ].value;

            if (key && !translations.includes(key)) {
              translations = [
                ...translations,
                key
              ];
            }
          }
        }
      });
    },
    buildEnd: () => {
      fs.writeFileSync(translationsPath, JSON.stringify(translations.sort(), null, 2));
    }
  };
}