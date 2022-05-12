export const environment = {
  production: true,
  nuxeoUrl: (window as any)['__env']['nuxeoUrl'],
  webAppUrl: (window as any)['__env']['webAppUrl'],
  authClientId: (window as any)['__env']['authClientId']
};
