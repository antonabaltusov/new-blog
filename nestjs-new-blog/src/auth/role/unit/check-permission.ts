import { Role } from '../role.enum';

export enum Modules {
  isAdmin = 'isAdmin',
  editComment = 'removeCommit',
}

export const checkPermission = (module: Modules, role: Role) => {
  switch (module) {
    case Modules.isAdmin:
      return [Role.Admin].includes(role);
      break;
    case Modules.editComment:
      return [Role.Admin].includes(role);
      break;
  }
};
