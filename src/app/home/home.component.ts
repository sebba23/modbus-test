import { Component, OnInit, Injectable } from "@angular/core";
import { TCPServices } from "../socket-service";
import { callbackify } from "util";

@Injectable({
  providedIn: "root"
})
@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  
  swVersion: any;

  constructor(private socketService: TCPServices) {}

  ngOnInit() {}

  connect() {
    console.log("connecting to the device");
    this.socketService.connect();
  }

  killSocket() {
    console.log("closing connection");
    this.socketService.closeConnection();
  }

  connectionTest() {
    console.log("test connection");
    this.socketService.testConnection();
  }

  swVersionRequest() {
    console.log("software version request");
    this.socketService.getSwVersion().then((data: any) => {
      let versionString = this.socketService.arrayBuffer2str(data.data.slice(3, data.data.length-2))
      console.log(`Software version is ${versionString.substring(0, 2).split('').join(".")} ${this.transformSwVersion(versionString.substring(2, versionString.length))}`)
    })
  }

  transformSwVersion(str) {
    return str.replace(/(\d\d)(\d\d)(\d\d)/, "$1/$2/$3")
  }

  getTemperature() {
    let temperature
    this.socketService.getTemperature().then((data: any) => {
      if (data.data[3] !== 0) {
        temperature = data.data.slice(3, data.data.length-2)
      } else {
        temperature = data.data.slice(4, data.data.length-2)
      }
      console.log(`Temperature is ${temperature}`)
    })
  }

  setTemperature45() {
    this.socketService.setTemperature45()
  }

  setTemperature55() {
    this.socketService.setTemperature55()
  }

  getMatricola() {
    this.socketService.getMatricola()
  }

  getSerialNumber() {
    this.socketService.getSerialNumber()
  }
}
