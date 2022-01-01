import { v4 as uuidv4 } from 'uuid';

const publicPath = './public';
let path: string = publicPath;

export class HelperFileLoader {
  static set path(_path: string) {
    path = publicPath + _path;
  }

  public static customFileName(req, file, cb) {
    const originalName = file.originalname.split('.');
    const fileExtension = originalName[originalName.length - 1];
    cb(null, `${uuidv4()}.${fileExtension}`);
  }

  public static destinationPath(req, file, cb) {
    cb(null, path);
  }
}
