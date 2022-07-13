import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { registerLocaleData } from '@angular/common';
import localeRo from '@angular/common/locales/ro';
import localeEn from '@angular/common/locales/en';

import { TranslateModule, TranslateCompiler, TranslateLoader } from '@ngx-translate/core';
import { MESSAGE_FORMAT_CONFIG, TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { WebpackTranslateLoaderService } from './helpers/webpack-translate-loader.service';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

import { ToastContainerModule, ToastrModule } from 'ngx-toastr';

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
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { NavigationBarComponent } from './components/navigation-bar/navigation-bar.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DocumentInfoComponent } from './components/document-info/document-info.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ToolbarComponent } from './components/tool-bar/tool-bar.component';
import { FolderViewComponent } from './components/folder-view/folder-view.component';
import { FileViewComponent } from './components/file-view/file-view.component';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { TrashComponent } from './pages/trash/trash.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { ClipboardComponent } from './components/clipboard/clipboard.component';
import { CollectionsAggregatorComponent } from './components/collections-aggregator/collections-aggregator.component';
import { CollectionsComponent } from './components/collections/collections.component';
import { DynamicDirective } from './directives/dynamic.directive';
import { HistoryComponent } from './components/history/history.component';
import { SearchComponent } from './components/search-pane/search-pane.component';
import { DisplaySettingsComponent } from './components/display-settings/display-settings.component';
import { AutofocusDirective } from './directives/autofocus.directive';
import { LazyImgDirective } from './directives/lazy-img.directive';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TokenService } from './helpers/token.service';
import { SecurePipe } from './pipes/secure.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    UnauthorizedComponent,
    NotFoundComponent,
    FooterComponent,
    HeaderComponent,
    NavigationBarComponent,
    DocumentInfoComponent,
    ToolbarComponent,
    FolderViewComponent,
    FileViewComponent,
    TrashComponent,
    ClipboardComponent,
    CollectionsComponent,
    CollectionsAggregatorComponent,
    HistoryComponent,
    ClickOutsideDirective,
    DynamicDirective,
    SearchComponent,
    DisplaySettingsComponent,
    AutofocusDirective,
    LazyImgDirective,
    SecurePipe
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
        useFactory: (httpClient: HttpClient, moduleName?: string) =>
          new WebpackTranslateLoaderService(httpClient, moduleName),
        deps: [HttpClient]
      },
      compiler: {
        provide: TranslateCompiler,
        useFactory: () => new TranslateMessageFormatCompiler(),
      },
    }),
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'inline',
      preventDuplicates: true,
      enableHtml: true
    }),
    ToastContainerModule,
    NgxJsonViewerModule,
    BsDropdownModule.forRoot(),
    PopoverModule.forRoot(),
    TooltipModule.forRoot(),
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    ButtonsModule.forRoot(),
    AccordionModule.forRoot(),
    BsDatepickerModule.forRoot(),
  ],
  providers: [
    {
      provide: MESSAGE_FORMAT_CONFIG,
      useValue: {
        locales: ['en-US', 'ar-SA'],
      },
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule
{
  constructor()
  {
    registerLocaleData(localeRo, 'ar-SA');
    registerLocaleData(localeEn, 'en-US');
  }
}
