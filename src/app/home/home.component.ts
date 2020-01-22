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
  
  versionString: any;
  matricola: any;
  serialNumber: any;

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
      this.versionString = this.socketService.arrayBuffer2str(data.data.slice(3, data.data.length-2))
      this.versionString = this.versionString.substring(0, 2).split('').join(".") + ' ' + this.transformSwVersion(this.versionString.substring(2, this.versionString.length))
      console.log(`Software version is ${this.versionString}`)
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
    this.socketService.getMatricola().then((data: any) => {
      this.matricola = this.socketService.arrayBuffer2str(data.data.slice(3, data.data.length-2))
      console.log(`Matricola is ${this.matricola}`)
    })
  }

  getSerialNumber() {
    this.socketService.getSerialNumber().then((data: any) => {
      this.serialNumber = this.socketService.arrayBuffer2strSerialNumber(data.data.slice(3, data.data.length-2))
      console.log(`Serial Number is ${this.serialNumber}`)
    })
  }
}
