import { Component, OnInit, Injectable } from "@angular/core";
import { TCPServices } from "../socket-service";

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
    this.socketService.getSwVersion()
  }

  getTemperature() {
    this.socketService.getTemperature()
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
