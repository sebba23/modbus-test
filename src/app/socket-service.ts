/*
General Info:
Request to read data:
const byteArrayInit = [0x01, 0x08, 0x00, 0x00, 0x00, 0x00, 0xe0, 0x0b];
const byteArrayReadSWVersion = [0x01, 0x03, 0x00, 0x01, 0x00, 0x04, 0x15, 0xc9];
const byteArrayReadTemperature = [0x01, 0x03, 0x04, 0x00, 0x00, 0x01, 0x85, 0x3a];
const byteArrayMatricola = [0x01, 0x03, 0x03, 0xf2, 0x00, 0x04, 0xe5, 0xbe]
const byteArraySerialNumber = [0x01, 0x03, 0x03, 0xf6, 0x00, 0x02, 0x24, 0x7d]

Request to write data:
const byteArrayWriteTemperature45 = [0x01, 0x10, 0x04, 0x00, 0x00, 0x01, 0x02, 0x00, 0x2d, 0x23, 0x8d]; // 45
const byteArrayWriteTemperature55 = [0x01, 0x10, 0x04, 0x00, 0x00, 0x01, 0x02, 0x00, 0x37,0xa2, 0x46]; // 55
*/

import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root"
})

export class TCPServices {
  socket;

  constructor() {
    console.log("Hello TCPServices Provider");

    this.socket = new (<any>window).Socket();
    console.log("socket ", this.socket);

    (<any>window).globalSocket = this.socket;

    this.socket.onData = function(data) {
      console.log("#onData: " + data);
    };

    this.socket.onError = function(errorMessage) {
      console.error("An error occurred talking to the socket: " + errorMessage);
    };

    this.socket.onClose = function(hasError) {
      console.log("Socket closing: " + hasError);
    };

    this.socket.open(
      "192.168.1.1",
      5555,
      function() {
        // invoked after successful opening of socket
        console.log("connected to ", (<any>window).globalSocket);
      },
      function(errorMessage) {
        // invoked after unsuccessful opening of socket
        console.log("error message ", errorMessage);
      }
    );
  }

  // Method to open a socket/connection
  connect() {
    this.socket.open(
      "192.168.1.1",
      5555,
      function() {
        // invoked after successful opening of socket
        console.log("open method connected to: ", this.socket);
      },
      function(errorMessage) {
        // invoked after unsuccessful opening of socket
        console.log("error message: ", errorMessage);
      }
    );
  }

  getSwVersion() {
    console.log('about to send command to get sw version')
    const swVersionCommandRequest = [0x01, 0x03, 0x00, 0x01, 0x00, 0x04, 0x15, 0xc9];
    return this.writeToDevice(swVersionCommandRequest)
  }

  getTemperature() {
    console.log('about to send command to get the temperature')
    const byteArrayReadTemperature = [0x01, 0x03, 0x04, 0x00, 0x00, 0x01, 0x85, 0x3a];
    return this.writeToDevice(byteArrayReadTemperature)
  }

  setTemperature45() {
    console.log('about to send command to set the temperature (45°)')
    const byteArrayWriteTemperature45 = [0x01, 0x10, 0x04, 0x00, 0x00, 0x01, 0x02, 0x00, 0x2d, 0x23, 0x8d]; // 45
    this.writeToDevice(byteArrayWriteTemperature45)
  }

  setTemperature55() {
    console.log('about to send command to set the temperature (55°)')
    const byteArrayWriteTemperature55 = [0x01, 0x10, 0x04, 0x00, 0x00, 0x01, 0x02, 0x00, 0x37,0xa2, 0x46]; // 55
    this.writeToDevice(byteArrayWriteTemperature55)
  }

  getMatricola() {
    console.log('about to send command to get the matricola')
    const byteArrayMatricola = [0x01, 0x03, 0x03, 0xf2, 0x00, 0x04, 0xe5, 0xbe]
    return this.writeToDevice(byteArrayMatricola)
  }

  getSerialNumber() {
    console.log('about to send command to get serial number')
    const byteArraySerialNumber = [0x01, 0x03, 0x03, 0xf6, 0x00, 0x02, 0x24, 0x7d]
    return this.writeToDevice(byteArraySerialNumber)
  }

  checkSwVersion() {
    return (this.socket.state == (<any>window).Socket.State.OPENED)
  }

  testConnection() {
    if (this.socket.state == (<any>window).Socket.State.OPENED) {
      console.log("Socket is opened");
      setTimeout (() => { alert('Connection successful') }, 900);
    } else {
      console.log("Socked is closed");
      setTimeout (() => { alert('Cannot connect to the device') }, 900);
    }
  }

  closeConnection() {
    this.socket.close();
    console.log("about to close socket");
    if (this.socket.state != (<any>window).Socket.State.OPENED) {
      setTimeout (() => { alert('Connection closed') }, 600);
    }
  }

  // Convert buffer to string
  // Call this when we get response from device
  arrayBuffer2str(buf) {
    var str = "";
    var ui8 = new Uint8Array(buf);
    for (var i = 0; i < ui8.length; i++) {
      str = str + String.fromCharCode(ui8[i]);
    }
    return str;
  }

  // Convert buffer to string
  // Call this when we get response from device
  arrayBuffer2strSerialNumber(buf) {
    var str = "";
    var ui8 = new Uint8Array(buf);
    for (var i = 0; i < ui8.length; i++) {
      str = str + ui8[i].toString(16);
    }
    return parseInt(str, 16);
  }

  // Convert string to buffer
  // Call this to convert message before writing to the device
  str2arrayBuffer(str) {
    debugger;
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0; i < str.length; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  writeToDevice(payload) {
    return new Promise((resolve, reject) => {
      this.socket.write(payload, (result) => {
        if (result && result !== "OK") {
          let data = JSON.parse(result);
          (<any>window).Socket.dispatchEvent(data);
          resolve(data)
        } else {
          console.log("Received payload: " + result);
        }
      }, (error) => {
        console.log(error);
        reject(error)
      });
    })
  }
  
  // // Method to tell js that an event was dispatched from native code
  // dispatchEventOnSuccess(payload) {
  //   if (payload && payload !== "OK") {
  //     (<any>window).Socket.dispatchEvent(JSON.parse(payload));
  //   } else {
  //     console.log("Received payload: " + payload);
  //   }
  // }

  // logOnError(error){
  //   console.log(error);
  // }

  uintToString(uintArray) {
    var encodedString = String.fromCharCode.apply(null, uintArray),
      decodedString = decodeURIComponent(escape(encodedString));
    return decodedString;
  }

  prepend(value, array) {
    var newArray = array.slice();
    newArray.unshift(value);
    return newArray;
  }

  uint16(n) {
    return n & 0xffff;
  }

  chunkString(str, length) {
    return str.match(new RegExp(".{1," + length + "}", "g"));
  }

  Crc16(buff, length) {
    let crc = 0xffff;

    for (let pos = 0; pos < length; pos++) {
      crc ^= buff[pos]; // (uint8_t)          // XOR byte into least sig. byte of crc

      for (let i = 8; i != 0; i--) {
        // Loop over each bit
        if ((crc & 0x0001) != 0) {
          // If the LSB is set
          crc >>= 1; // Shift right and XOR 0xA001
          crc ^= 0xa001;
        } else {
          crc >>= 1; // Just shift right
        } // Else LSB is not set
      }
    }
    return crc;
  }
}
