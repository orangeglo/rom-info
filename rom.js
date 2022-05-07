const CARTRIDGE_TYPES = [
  'ROM Only',
  'MBC1', 'MBC1+RAM', 'MBC1+RAM+BATTERY', null,
  'MBC2', 'MBC2+BATTERY', null,
  'ROM+RAM', 'ROM+RAM+BATTERY', null, null, null, null, null,
  'MBC3+TIMER+BATTERY', 'MBC3+TIMER+RAM+BATTERY', 'MBC3', 'MBC3+RAM', 'MBC3+RAM+BATTERY', null, null, null, null, null,
  'MBC5', 'MBC5+RAM', 'MBC5+RAM+BATTERY', 'MBC5+RUMBLE', 'MBC5+RUMBLE+RAM', 'MBC5+RUMBLE+RAM+BATTERY'
]

class ROM {
  constructor(arrayBuffer) {
    let file = new FileSeeker(arrayBuffer);

    file.seek(0x134);
    this.title = String.fromCharCode(...file.read(0xF)).replace(/\0/g, '');
    this.menuText = this.title;

    file.seek(0x143);
    let cgbByte = file.readByte();
    this.cgb = cgbByte == 0x80 || cgbByte == 0xC0;

    file.seek(0x147);
    this.typeByte = file.readByte();
    this.type = CARTRIDGE_TYPES[this.typeByte];
    this.romByte = file.readByte();
    this.ramByte = file.readByte();

    file.seek(260);
    this.validBytes = file.read(5);

    if (!this.valid()) { alert('File is not a valid Game Boy ROM!') }
    else if (!this.type) { alert('Cartridge type could not be determined!') }
  }

  valid() {
    if (!this._valid) {
      let check = Array.from(this.validBytes);
      this._valid = (JSON.stringify(check) === JSON.stringify([0xCE, 0xED, 0x66, 0x66, 0xCC]));
    }

    return this._valid;
  }

  romSizeKB() {
    return 32 << this.romByte;
  }

  ramSizeKB() {
    return Math.trunc(Math.pow(4, this.ramByte - 1)) * 2;
  }
}

class FileSeeker {
  constructor(arrayBuffer) {
    this.view = new DataView(arrayBuffer);
    this.position = 0;
  }

  seek(address) {
    this.position = address;
  }

  rewind() {
    this.position = 0;
  }

  size() {
    return this.view.byteLength;
  }

  read(bytes) {
    let data = [];
    for (let i = 0; i < bytes; i++) {
      data.push(this.readByte());
    }
    return data;
  }

  readByte() {
    let byte = this.view.getUint8(this.position);
    this.position++;
    return byte;
  }
}
