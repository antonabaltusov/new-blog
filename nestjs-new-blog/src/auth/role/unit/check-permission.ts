import { Role } from '../role.enum';

export enum Modules {
  isAdmin = 'isAdmin',
  removeCommit = 'removeCommit'
}

export const checkPermission = (module: Modules, role: Role) => {
  switch (module) {
    case Modules.isAdmin:
      return [Role.Admin].includes(role);
      break;
    case Modules.removeCommit:
      if ([Role.Admin].includes(role)) {
        return Role.Admin;
      } else if ([Role.User].includes(role)) {
        return Role.User;
        }
  }
};
