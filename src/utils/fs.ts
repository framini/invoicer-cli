import * as fs from 'fs';

export const fileExists = async (path: fs.PathLike): Promise<boolean> => {
  return new Promise((resolve) => {
    fs.access(path, fs.constants.F_OK, err => {
      if (err) {
        return resolve(false);
      }

      resolve(true);
    });
  });
};
