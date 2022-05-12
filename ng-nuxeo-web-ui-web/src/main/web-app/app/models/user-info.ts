export class UserInfo
{
    id: string | undefined;
    firstName: string | undefined;
    lastName: string | undefined;
    userName: string | undefined;
    company: string | undefined;
    email: string | undefined;
    phoneNumber: string | undefined;
    avatar: string | undefined;
    locale: string | undefined;
    groups: string[] = [];
    isAdministrator = false;
}