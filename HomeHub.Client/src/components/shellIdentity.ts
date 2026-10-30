import { UserType } from '../gen/users_pb';

export function displayNameFor(isAdmin: boolean, fullName?: string): string {
  return fullName ?? (isAdmin ? 'Household admin' : 'HomeHub');
}

export function roleLabelFor(isAdmin: boolean, type?: UserType): string {
  if (isAdmin) return 'Admin key';
  if (type === UserType.DISPLAY) return 'Shared display';
  return 'Household member';
}
