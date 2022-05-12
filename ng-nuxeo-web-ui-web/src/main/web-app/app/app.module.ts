import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { registerLocaleData } from '@angular/common';
import localeRo from '@angular/common/locales/ro';
import localeEn from '@angular/common/locales/en';

import {
  TranslateModule,
  TranslateCompiler,
  TranslateLoader,
} from '@ngx-translate/core';
import {
  MESSAGE_FORMAT_CONFIG,
  TranslateMessageFormatCompiler,
} from 'ngx-translate-messageformat-compiler';
import { WebpackTranslateLoaderService } from './helpers/webpack-translate-loader.service';

import { SharedModule } from './shared.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { PopoverModule } from 'ngx-bootstrap/popover';

@NgModule({
  declarations: [
    AppComponent, 
    HomeComponent, 
    UnauthorizedComponent, 
    NotFoundComponent, FooterComponent, HeaderComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: () => new WebpackTranslateLoaderService(),
      },
      compiler: {
        provide: TranslateCompiler,
        useFactory: () => new TranslateMessageFormatCompiler(),
      },
    }),
    BsDropdownModule.forRoot(),
    PopoverModule.forRoot(),
  ],
  providers: [
    {
      provide: MESSAGE_FORMAT_CONFIG,
      useValue: {
        locales: ['en', 'ro'],
      },
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule
{
  constructor()
  {
    registerLocaleData(localeRo, 'ro');
    registerLocaleData(localeEn, 'en');
  }
}
