import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root"
})

export class TCPServices {
  socket;
  swVersionResponse: any;
  swVersionRequest: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

  constructor() {
    console.log("Hello TCPServices Provider");

    this.socket = new (<any>window).Socket();
    console.log("test socket ", this.socket);

    (<any>window).globalSocket = this.socket;

    this.socket.onData = function(data) {
      console.log("#onData: " + data);
      this.swVersionResponse = data
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
        console.log("open method connected to ", this.socket);
      },
      function(errorMessage) {
        // invoked after unsuccessful opening of socket
        console.log("error message ", errorMessage);
      }
    );
  }

  // Request to read data
  // const byteArrayInit = [0x01, 0x08, 0x00, 0x00, 0x00, 0x00, 0xe0, 0x0b];
  // const byteArrayReadSWVersion = [0x01, 0x03, 0x00, 0x01, 0x00, 0x04, 0x15, 0xc9];
  // const byteArrayReadTemperature = [0x01, 0x03, 0x04, 0x00, 0x00, 0x01, 0x85, 0x3a];

  // Request to write data
  // const byteArrayWriteTemperature45 = [0x01, 0x10, 0x04, 0x00, 0x00, 0x01, 0x02, 0x00, 0x2d, 0x23, 0x8d]; // 45
  // const byteArrayWriteTemperature55 = [0x01, 0x10, 0x04, 0x00, 0x00, 0x01, 0x02, 0x00, 0x37,0xa2, 0x46]; // 55
  getSwVersion() {
    console.log('about to send command to get sw version')
    const swVersionCommandRequest = [0x01, 0x03, 0x00, 0x01, 0x00, 0x04, 0x15, 0xc9];
    this.writeToDevice(swVersionCommandRequest)
    // return this.swVersionResponse
  }

  getTemperature() {
    console.log('about to send command to get the temperature')
    const byteArrayReadTemperature = [0x01, 0x03, 0x04, 0x00, 0x00, 0x01, 0x85, 0x3a];
    this.writeToDevice(byteArrayReadTemperature)
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
    debugger;
    var str = "";
    var ui8 = new Uint8Array(buf);
    for (var i = 0; i < ui8.length; i++) {
      str = str + String.fromCharCode(ui8[i]);
    }
    return str;
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
    this.socket.write(payload, this.dispatchEventOnSuccess, this.logOnError);
  }
  
  // Method to tell js that an event was dispatched from native code
  dispatchEventOnSuccess(payload) {
    if (payload && payload !== "OK") {
      (<any>window).Socket.dispatchEvent(JSON.parse(payload));
    } else {
      console.log("Received payload: " + payload);
    }
  }

  logOnError(error){
    console.log(error);
  }

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

  // Send packet
  sendPacket(ipAddr, ipPort, data) {
    debugger;
    var delay = 5000; /// 5 seconds timeout
    //(<any>window).chrome.socket.tcp.create({}, createInfo => {
    this.socket.create({}, createInfo => {
      //callback function with createInfo as the parameter
      var _socketTcpId = createInfo.socketId;
      //(<any>window).chrome.sockets.tcp.connect(
      this.socket.connect(_socketTcpId, ipAddr, ipPort, result => {
        //callback function with result as the parameter
        if (result === 0) {
          var data2send = this.str2arrayBuffer(data);
          /// connection ok, send the packet
          //(<any>window).chrome.sockets.tcp.send(_socketTcpId, data2send);
          this.socket.write(_socketTcpId, data2send);
        }
      });
      //   (<any>window).chrome.sockets.tcp
      this.socket.onReceive.addListener(info => {
        //callback function with info as the parameter
        /// recived, then close connection
        // (<any>window).chrome.sockets.tcp
        this.socket.close(_socketTcpId);
        var data = this.arrayBuffer2str(info.data);
      });
      /// set the timeout
      setTimeout(function() {
        // (<any>window).chrome.sockets.tcp
        this.socket.close(_socketTcpId);
      }, delay);
    });
  }

  /*
var x = [1, 2, 3];
var y = prepend(0, x);
y; // => [0, 1, 2, 3];
x; // => [1, 2, 3];

*/
  /*

  writeData(slave: number, commandWrite: number, fromAddress: number, lenghtData: number, dataToWrite: any, TrueIsStringFalseIsNumber: boolean)
{
    // nella scrittura solo le stringhe hanno bisogno del carattere 0 come fine corsa, gli interi
    // possono essere scritti direttamente.
    // bool isNumber = dataToWrite.toInt();
    // int isZero = dataToWrite.toInt();
    // isNumber = false;

    // se è un numero
    if(!TrueIsStringFalseIsNumber) {
        let qs = dataToWrite.toString();
        let dataConverted: any = Buffer.from(qs);
        let dataSend: any;

        //IMPOSTO SLAVE E COMANDO
        if(slave > 9) {
            dataSend[0] = this.uint16(this.prepend('0x', slave));
        } else {
            dataSend[0] = this.uint16(this.prepend('0x0', slave));
        }

        if(commandWrite > 9) {
            dataSend[1] = this.uint16(this.prepend('0x', commandWrite));
        } else {
            dataSend[1] = this.uint16(this.prepend('0x', commandWrite));
        }

        //from address da DA CHE INDIRIZZO SCRIVO
        let fromAddressHEX;
        fromAddressHEX.this.uint16(fromAddress);

        if (fromAddress > 255) {

            let firstWord, secondWord;
            if (fromAddressHEX.length() == 3) {
                firstWord = '0x0' + fromAddressHEX[0];
                secondWord = '0x' + fromAddressHEX[1] + fromAddressHEX[2];
            } else if (fromAddressHEX.length() == 4) {
                firstWord = '0x' + fromAddressHEX[0] + fromAddressHEX[1];
                secondWord = '0x' + fromAddressHEX[2] + fromAddressHEX[3];
            } else {
                firstWord = '0x00';
                secondWord = '0x' + fromAddressHEX[0] + fromAddressHEX[1];
            }

            dataSend[2] = firstWord.this.uint16(null); // toUInt(nullptr,0);
            dataSend[3] = secondWord.this.uint16(null); // toUInt(nullptr,0);
        } else {
            let secondWord;
            if (fromAddressHEX.length() < 2) {
                secondWord = '0x0' + fromAddressHEX[0];
            } else {
                secondWord = '0x' + fromAddressHEX[0] + fromAddressHEX[1];
            }

            dataSend[2] = 0x00;
            dataSend[3] = secondWord.this.uint16(null); // toUInt(nullptr,0);
        }
        //FINE FROM ADDRESS

        //DATA WORD PART
        //divido per due i byte così da ricavare gli word
        let tmp = lenghtData;
        tmp = this.chunkString(tmp, tmp.toString().length) // qCeil(tmp / 2);
        let lenghDataDivided = tmp; //static_cast<int>(tmp);

        let dataWord;
        dataWord.this.uint16(lenghDataDivided); // setNum(lenghDataDivided,16);

        let firstWord, secondWord;

        if (dataWord.length() == 3) {
            firstWord = '0x0' + dataWord[0];
            secondWord = '0x' + dataWord[1] + dataWord[2];
        } else if (dataWord.length() == 4) {
            firstWord = '0x' + dataWord[0] + dataWord[1];
            secondWord = '0x' + dataWord[2] + dataWord[3];
        } else if (dataWord.length() == 1) {
            firstWord = '0x00';
            secondWord = '0x0' + dataWord[0];
        } else {
            firstWord = '0x00';
            secondWord = '0x' + dataWord[0] + dataWord[1];
        }

        dataSend[4] = firstWord // .toUInt(nullptr,0);
        dataSend[5] = secondWord // .toUInt(nullptr,0);
        //FINE DATA WORD


        //DATA BYTE COUNT
        let dataByteCount;
        dataByteCount.this.uint16(lenghtData) // setNum((lenghtData),16);

        let firstWords;
        if (dataByteCount.length() == 1) {
            firstWords = '0x0' + dataByteCount[0];
        } else {
            firstWords = '0x' + dataByteCount[0] + dataByteCount[1];
        }

        dataSend[6] = firstWords // .toUInt(nullptr,0);
        //FINE DATA BYTE COUNT


        //INSERISCO I DATI QUI
        let dataWords;
        dataWords.this.uint16(dataToWrite).toString();

        let firstWordss, secondWords;
        if (dataWords.length() == 3) {
            firstWordss = '0x0' + dataWords[0];
            secondWords = '0x' + dataWords[1] + dataWords[2];
        } else if (dataWords.length() == 4) {
            firstWordss = '0x' + dataWords[0] + dataWords[1];
            secondWords = '0x' + dataWords[2] + dataWords[3];
        } else if (dataWords.length() == 1) {
            firstWordss = '0x00';
            secondWords = '0x0' + dataWords[0];
        } else {
            firstWordss = '0x00';
            secondWords = '0x' + dataWords[0] + dataWords[1];
        }

        dataSend[7] = firstWordss.toUInt(nullptr,0);
        dataSend[8] = secondWords.toUInt(nullptr,0);


        //calcolo il crc checksum
        uint CRCReturned = CRC16(dataSend,dataSend.length());
        CRCReturned = htons(CRCReturned);
        QByteArray ritorno((char*)&CRCReturned, 2);

        dataSend.append(ritorno[1]);
        dataSend.append(ritorno[0]);

        return getModBusRequest(dataSend);
    }
    else { // è una stringa
        QString qs = dataToWrite.toString();
        QByteArray dataConverted = qs.toUtf8();
        QByteArray dataSend;

        // IMPOSTO SLAVE E COMANDO
        if(slave > 9) {
            dataSend[0] = QString().number(slave).prepend("0x").toUInt(nullptr,16);
        } else {
            dataSend[0] = QString().number(slave).prepend("0x0").toUInt(nullptr,16);
        }

        if(commandWrite > 9) {
            dataSend[1] = QString().number(commandWrite).prepend("0x").toUInt(nullptr,16);
        } else {
            dataSend[1] = QString().number(commandWrite).prepend("0x0").toUInt(nullptr,16);
        }

        // from address da DA CHE INDIRIZZO SCRIVO
        QString fromAddressHEX;
        fromAddressHEX.setNum(fromAddress,16);

        if(fromAddress > 255) {

            QString firstWord, secondWord;

            if (fromAddressHEX.length() == 3) {
                firstWord = "0x0" + fromAddressHEX[0];
                secondWord = "0x" + fromAddressHEX[1] + fromAddressHEX[2];
            } else if(fromAddressHEX.length() == 4) {
                firstWord = "0x" + fromAddressHEX[0] + fromAddressHEX[1];
                secondWord = "0x" + fromAddressHEX[2] + fromAddressHEX[3];
            } else {
                firstWord = "0x00";
                secondWord = "0x" + fromAddressHEX[0] + fromAddressHEX[1];
            }

            dataSend[2] = firstWord.toUInt(nullptr,0);
            dataSend[3] = secondWord.toUInt(nullptr,0);
        } else {
            QString secondWord;

            if (fromAddressHEX.length() < 2) {
                secondWord = "0x0" + fromAddressHEX[0];
            } else {
                secondWord = "0x" + fromAddressHEX[0] + fromAddressHEX[1];
            }

            dataSend[2] = 0x00;
            dataSend[3] = secondWord.toUInt(nullptr,0);
        }
        // FINE FROM ADDRESS

        // DATA WORD PART
        // divido per due i byte così da ricavare gli word
        double tmp = lenghtData;
        tmp = qCeil(tmp / 2);
        int lenghDataDivided = static_cast<int>(tmp);

        QString dataWord;
        dataWord.setNum(lenghDataDivided,16);

        QString firstWord, secondWord;

        if (dataWord.length() == 3) {
            firstWord = "0x0" + dataWord[0];
            secondWord = "0x" + dataWord[1] + dataWord[2];
        } else if (dataWord.length() == 4) {
            firstWord = "0x" + dataWord[0] + dataWord[1];
            secondWord = "0x" + dataWord[2] + dataWord[3];
        } else if (dataWord.length() == 1) {
            firstWord = "0x00";
            secondWord = "0x0" + dataWord[0];
        } else {
            firstWord = "0x00";
            secondWord = "0x" + dataWord[0] + dataWord[1];
        }

        dataSend[4] = firstWord.toUInt(nullptr,0);
        dataSend[5] = secondWord.toUInt(nullptr,0);
        // FINE DATA WORD

        // DATA BYTE COUNT
        QString dataByteCount;
        dataByteCount.setNum((lenghtData),16);

        QString firstWords;
        if (dataByteCount.length() == 1) {
            firstWords = "0x0" + dataByteCount[0];
        } else {
            firstWords = "0x" + dataByteCount[0] + dataByteCount[1];
        }

        dataSend[6] = firstWords.toUInt(nullptr,0);
        // FINE DATA BYTE COUNT

        char zeroPuro = 0;

        if (dataConverted.length() <= lenghtData - 1) {
            dataConverted.append(zeroPuro);
        }

        if (dataConverted.length() < lenghtData) {

            for (let i = dataConverted.length(); i < lenghtData; i++) {
                dataConverted.append(zeroPuro);
            }
        }

        for (let i = 0; i < dataConverted.length(); i++) {
            dataSend.append(dataConverted[i]);
        }

        // calcolo il crc checksum
        uint CRCReturned = CRC16(dataSend,dataSend.length());
        CRCReturned = htons(CRCReturned);
        QByteArray ritorno((char*)&CRCReturned, 2);

        dataSend.append(ritorno[1]);
        dataSend.append(ritorno[0]);

        return getModBusRequest(dataSend);
    }
}
*/

  // readDataFromBoard(
  //   slave: number,
  //   readCommand: number,
  //   fromAddress: number,
  //   toAddress: number,
  //   numBitToRead: number
  // ) {
  //   let dataSend: (string | number)[];
  //   dataSend = [slave, readCommand, fromAddress, toAddress, numBitToRead];
  //   debugger;

  //   if (slave > 9) {
  //     dataSend[0] = this.uint16(this.prepend("0x", slave)).toString(); //QString().number(slave).prepend("0x").toUInt(nullptr,16);
  //   } else {
  //     dataSend.push("0x01"); // this.uint16(this.prepend("0x0", slave)).toString(); //QString().number(slave).prepend("0x0").toUInt(nullptr,16);
  //   }

  //   if (readCommand > 9) {
  //     dataSend[1] = this.uint16(this.prepend("0x", readCommand)).toString(); // QString().number(readCommand).prepend("0x").toUInt(nullptr,16);
  //   } else {
  //     dataSend[1] = "0x03"; // this.uint16(this.prepend("0x0", readCommand)).toString(); //QString().number(readCommand).prepend("0x0").toUInt(nullptr,16);
  //   }

  //   //from address da qui
  //   let fromAddressHEX = fromAddress.toString(16);

  //   if (fromAddress > 255) {
  //     let firstWord, secondWord;
  //     if (fromAddressHEX.length == 3) {
  //       firstWord = "0x0" + fromAddressHEX[0];
  //       secondWord = "0x" + fromAddressHEX[1] + fromAddressHEX[2];
  //     } else if (fromAddressHEX.length == 4) {
  //       firstWord = "0x" + fromAddressHEX[0] + fromAddressHEX[1];
  //       secondWord = "0x" + fromAddressHEX[2] + fromAddressHEX[3];
  //     } else {
  //       firstWord = "0x00";
  //       secondWord = "0x" + fromAddressHEX[0] + fromAddressHEX[1];
  //     }

  //     //dataSend[2] = firstWord.toUInt(nullptr,0);
  //     //dataSend[3] = secondWord.toUInt(nullptr,0);
  //   } else {
  //     let secondWord;

  //     if (fromAddressHEX.length < 2) {
  //       secondWord = "0x0" + fromAddressHEX[0];
  //     } else {
  //       secondWord = "0x" + fromAddressHEX[0] + fromAddressHEX[1];
  //     }

  //     dataSend[2] = 0x00;
  //     dataSend[3] = secondWord; //.toUInt(nullptr,0);
  //   }

  //   //toAddress da qui
  //   if (numBitToRead == 8) {
  //     //se è impostato 8 bit devo dividere per due, di default è 16bit, ovvero il doppio
  //     let tmp = toAddress;
  //     tmp = this.chunkString(tmp, tmp.toString().length); //qCeil(tmp / 2);
  //     toAddress = tmp; //static_cast<int>(tmp);
  //   }

  //   let toAddressHEX = toAddress.toString(16);
  //   //toAddressHEX.setNum(toAddress,16);

  //   if (toAddress > 255) {
  //     let firstWord, secondWord;
  //     if (toAddressHEX.length == 3) {
  //       firstWord = "0x0" + toAddressHEX[0];
  //       secondWord = "0x" + toAddressHEX[1] + toAddressHEX[2];
  //     } else if (toAddressHEX.length == 4) {
  //       firstWord = "0x" + toAddressHEX[0] + toAddressHEX[1];
  //       secondWord = "0x" + toAddressHEX[2] + toAddressHEX[3];
  //     } else {
  //       firstWord = "0x00";
  //       secondWord = "0x" + toAddressHEX[0] + toAddressHEX[1];
  //     }

  //     dataSend[4] = firstWord; //.toUInt(nullptr,0);
  //     dataSend[5] = secondWord; //.toUInt(nullptr,0);
  //   } else {
  //     let secondWord1;

  //     if (toAddress <= 15) {
  //       secondWord1 = "0x0" + toAddressHEX[0];
  //     } else {
  //       secondWord1 = "0x" + toAddressHEX[0] + toAddressHEX[1];
  //     }

  //     dataSend[4] = "0x00";
  //     dataSend[5] = secondWord1; //.toUInt(nullptr,0);
  //   }

  //   //calcolo il crc checksum
  //   let CRCReturned = this.Crc16(dataSend, dataSend.length); // CRC16(dataSend,dataSend.length());
  //   //CRCReturned = htons(CRCReturned);
  //   //QByteArray ritorno((char*)&CRCReturned, 2);

  //   //dataSend[6] = ritorno[1];
  //   //dataSend[7] = ritorno[0];

  //   //QByteArray ritornoFinal = getModBusRequest(dataSend);
  //   debugger;
  //   // this.sendPacket('192.168.1.1', 5555, dataSend)

  //   this.socket.write(dataSend);
  //   // (<any>window).Socket.write(dataSend);

  //   //verifico il checksum che mi ritorna
  //   // QByteArray checkRitorno;
  //   // for(int i = 0; i < ritornoFinal.size(); i++){
  //   //     if(i < ritornoFinal.size()-2)
  //   //     {
  //   //         checkRitorno.append(ritornoFinal[i]);
  //   //     }
  //   // }

  //   // uint CRCReturnedCheck = CRC16(checkRitorno,checkRitorno.length());
  //   // CRCReturnedCheck = htons(CRCReturnedCheck);
  //   // QByteArray ritornoCRC((char*)&CRCReturnedCheck, 2);
  //   // //fine verifica checksum di ritorno, se è corretto ritorno il dato se no torno vuoto

  //   // if(ritornoFinal.length() > 0)
  //   // {
  //   //     if((ritornoFinal[ritornoFinal.length()-2] == ritornoCRC[1]) && (ritornoFinal[ritorno.length()-1] == ritornoCRC[0])){
  //   //         return ritornoFinal;
  //   //     }
  //   // }
  //   // else
  //   // {
  //   //     ritornoFinal.clear();
  //   // }

  //   // return ritornoFinal;
  // }
}
