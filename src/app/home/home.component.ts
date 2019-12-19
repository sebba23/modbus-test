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
  constructor(private socket: TCPServices) {}

  ngOnInit() {}

  connect() {
    console.log("connecting to the device");
    this.socket.connect();
  }

  killSocket() {
    console.log("closing connection");
    this.socket.closeConnection();
  }

  connectionTest() {
    console.log("test connection");
    this.socket.testConnection();
    this.socket.arrayBuffer2str(299);
    // this.socket.sendPacket("192.168.1.1", 5555, 1);
    this.socket.write();
  }

  sendMessage(message: any) {
    console.log("sending a message: %1 to the device", message);
  }

  readMessage() {
    console.log("reading a message from the device");
    this.socket.readDataFromBoard(1,3,1,6,16)
    // this.socket.str2arrayBuffer("23");
  }
}
