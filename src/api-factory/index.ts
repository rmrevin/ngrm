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

export function apiFactory (options: Schema): Rule {
  return () => {
    if (!options.name) {
      throw new SchematicsException('Option (name) is required.');
    }

    const templateSource = apply(
      url('./files'),
      [
        template({
          ...strings,
          ...options,
        }),
        move(normalize(`${options.path}`)),
      ],
    );

    return branchAndMerge(mergeWith(templateSource));
  };
}
