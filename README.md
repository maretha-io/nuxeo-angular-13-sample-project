# Nuxeo Angular 13 sample project

> This project serves as a starting point for an Angular 13 web application.

The Angular app is located under `./ng-nuxeo-web-ui-web/src/main/web-app` and comes with a certain list of packages:
- FontAwesome icon library for Angular
- Bootstrap 5
- ngx-bootstrap
- ngx-translate (+ ngx-translate-messageformat-compiler & ngx-translate-module-loader)

## Project structure
 - `./app/pages/**` for container-like components (eg: home page)
 - `./app/components/**` for reusable components (eg: resource editor)
 - `./app/helpers/**` for project-wide services:
    - `auth.service.ts` handles authentication
    - `token.service.ts` manage the authentication token (this is just a quick way of doing things, but it could and should be improved for security reasons)
    - `auth-guard.service.ts` can be used as a route guard
    - `nuxeo.service.ts` a starting point for calling Nuxeo endpoints

There's a `shared.module.ts` file where you should define de components/directives/pipes/etc that you want to use in any sub-modules you might have.

## Developing
For development purposes, simply run `ng serve` at the same folder level as the Angular app (./ng-nuxeo-web-ui-web/src/main/web-app), which will start your app on http://localhost:4200.

## Generating a Maven package
In order to generate a new Maven package to be installed into your Nuxeo server, simply run `mvn clean package -e` at the same folder level as this README file.

---

> The `/environments/environment[.prod].ts` file specifies a "nuxeoUrl" property which is used when making http calls against a Nuxeo server.