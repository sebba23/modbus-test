import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { Camera } from "@ionic-native/camera/ngx";
import { IonicStorageModule } from "@ionic/storage";
import { HomeComponent } from "./home/home.component";
import { TCPServices } from "./socket-service";
import { HttpModule } from "@angular/http";

@NgModule({
  declarations: [AppComponent, HomeComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpModule,
    IonicStorageModule.forRoot()
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    TCPServices
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
