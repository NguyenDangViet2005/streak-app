export const securityOptions = {
  contentSecurityPolicy: {
    directives: {
      'script-src': ["'self'"],
      'img-src': ["'self'", 'data:'],
      'upgrade-insecure-requests': null
    }
  },
  strictTransportSecurity: false
};
