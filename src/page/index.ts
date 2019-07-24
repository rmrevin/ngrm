import { normalize, strings } from '@angular-devkit/core';
import {
  apply,
  branchAndMerge,
  mergeWith,
  move,
  Rule,
  SchematicsException,
  template,
  url,
} from '@angular-devkit/schematics';
import { Schema } from './schema';

export function page (options: Schema): Rule {
  return () => {
    if (!options.name) {
      throw new SchematicsException('Option (name) is required.');
    }

    console.log(url('./files'));

    const templateSource = apply(
      url('./files'),
      [
        template({
          ...strings,
          ...options,
        }),
        move(normalize(`${options.path}/${options.name}`)),
      ],
    );

    return branchAndMerge(mergeWith(templateSource));
  };
}
