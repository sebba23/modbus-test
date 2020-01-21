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
    // this.socket.arrayBuffer2str(299);
    // this.socket.sendPacket("192.168.1.1", 5555, 1);
    // this.socket.writeToDevice();
  }

  sendMessage(message: any) {
    console.log("sending a message: %1 to the device", message);
  }

  readMessage() {
    console.log("reading a message from the device");
    // this.socket.writeToDevice()
    // this.socket.str2arrayBuffer("23");
  }

  swVersionRequest() {
    console.log("software version request");

    //debugger;
    if (this.socketService.checkSwVersion()) {
      this.swVersion = this.socketService.getSwVersion();
      // this.swVersion = this.socket.swVersionResponse
      // debugger
      // setTimeout(() => {
      //   // this.showSwVersion = true;
      // }, 2000);
    } else {
      setTimeout(() => {
        alert("Connect to the device first");
        // this.showSwVersion = false;
        // this.loadingService.showLoading(false);
      }, 1000);
    }

    // will it work?
    // this.swVersion = this.socket.swVersionResponse
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
}
