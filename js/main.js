const MAX_VALUES_ARRAY_SIZE = 3;
const I603_TIMER_INTERVAL = 25; //(ms) See in HWCONFIG PLC
const WS_URL = 'ws://192.168.1.103:3040'

var app = new Vue({
  el: '#app',
  data: {
    deltaRegisters: {},
    binDI: [],
    binDO: [],
    deltaValues: ANALOG_REG_INFO,
    deltaDO: DO_REG_INFO,
    deltaAO: AO_REG_INFO,
    deltaInputs: DI_INFO,
    ws_connection: null,
    status: { delta: 'initialization', udp1_status: '', udp2_status: '', udp3_status: '' },
  },
  watch: {
    deltaRegisters: function (newReg, _) {
      var vm = this;
      vm.status.delta = 'Delta is Ok!';

      vm.status.udp1_status = newReg.udp1_status;
      vm.status.udp2_status = newReg.udp2_status;
      vm.status.udp3_status = newReg.udp3_status;

      vm.deltaValues.forEach(function (dv, i, arr) {
        arr[i].values.unshift(newReg[dv.id]);
        arr[i].values.splice(MAX_VALUES_ARRAY_SIZE);
      });

      var int8_to_bin = (d) => { return (d + 256).toString(2).substr(1, 8).split('').reverse() };
      var int16_to_bin = (d) => { return (d + 65536).toString(2).substr(1, 16).split('').reverse() };

      var d_in = [newReg.DIX1, newReg.DIX2];
      vm.binDI = [].concat(...d_in.map(int8_to_bin));

      var d_out = [newReg.DOY0, newReg.DOY1, newReg.DOY2, newReg.DOY3, newReg.DOY4];
      vm.binDO = [].concat(...d_out.map(int16_to_bin));

      vm.deltaDO.forEach(function (dout, i, arr) {
        arr[i].state = vm.binDO[dout.addr];
      });

      vm.deltaInputs.forEach(function (dout, i, arr) {
        arr[i].state = vm.binDI[dout['id'].substr(2, 2) - 0];
      });

      for (let aOut in vm.deltaAO) {
        vm.deltaAO[aOut].decimalValue = newReg[aOut];
        vm.deltaAO[aOut].analogValue =
          parseFloat(vm.deltaAO[aOut].v0) +
          parseFloat(vm.deltaAO[aOut].koeff) * newReg[aOut];

        let av = vm.deltaAO[aOut].analogValue;
        vm.deltaAO[aOut].strAnalogValue = isNaN(av) ? av : av.toFixed(2)
      }
    }
  },

  computed: {
    plc_global_time: function () {
      return (this.deltaRegisters.GTCN * I603_TIMER_INTERVAL / 1000).toFixed(1);
    },
  },


  methods: {

    getDeltaStatus: function () {
      var vm = this;
      axios.get('/info')
        .then(function (response) {
          vm.deltaRegisters = JSON.parse(JSON.stringify(response.data));
        })
        .catch(function (error) {
          vm.status.delta = 'Error! Can not connect to the server. ' + error;
        });
    },

    sendNewOutputState: function () {
      //send command to Delta
      var vm = this;

      vm.deltaDO.forEach(function (dOut/*, i, arr*/) {
        if (dOut.command != null) {
          vm.binDO[dOut.addr] = dOut.command
        }
      });

      var bin_s = vm.binDO.join('');
      var make16bNumbers = function () {
        var arr = [];
        for (let i = 0; i < 5; i++) {
          var s = bin_s.substr(i * 16, 16).split('').reverse().join('');
          arr.push(parseInt(s, 2));
        }
        return arr;
      };

      var analogOutputs = [];
      for (let i = 1; i <= 16; i++) {
        let ao = i < 10 ? "AO0" + i : "AO" + i;
        let result = (vm.deltaAO[ao].setV - parseFloat(vm.deltaAO[ao].v0))
          / parseFloat(vm.deltaAO[ao].koeff);
        if ((vm.deltaAO[ao].setV == null) || isNaN(result) || (result > 32767)) {
          result = -1;
        }
        analogOutputs[i - 1] = parseInt(result);
      };
      var sendingArray = ['UDP1'].concat(make16bNumbers());
      console.log(sendingArray.concat(analogOutputs));

      vm.ws_connection.send(sendingArray.concat(analogOutputs));
      vm.clearOutputSelection();
    },

    changeDOutputState: function (dOut) {
      dOut.command = dOut.command == null ? 1 :
        dOut.command == 1 ? 0 : null;
    },

    clearOutputSelection: function () {
      //this.deltaDO.forEach(function (dOut) {
      //  dOut.command = null;
      //});
      this.deltaDO.forEach( (dOut) => {dOut.command = null} );
      
      for (let aOut in this.deltaAO) {
        this.deltaAO[aOut].setV = null;
      }
    },

    setAnalogValue: function (aOut) {
      this.deltaAO[aOut].setV = null;
    },

    saveToStorage: function () {
      saveToLocalStorage(this.deltaAO);
    },

    moveAnalogValueForChange: function (id) {
      this.deltaAO[id].setV = this.deltaAO[id].strAnalogValue;
      //deltaRegisters[ id ]
    }


  },

  created() {
    var vm = this;

    vm.ws_connection = new WebSocket(WS_URL);
    vm.ws_connection.onopen = function () {
      console.log('WS connection opened');
      vm.ws_connection.send('Ok');
    }

    vm.ws_connection.onclose = function (eventclose) {
      console.log('WS connection closed: ' + vm.eventclose);
    }

    vm.ws_connection.onmessage = function (msg) {
      try {
        vm.deltaRegisters = JSON.parse(msg.data);
      } catch (e) {
        console.debug(e); //error
      }
    }

    var update_delta_registers = function (delta_register) {
      delta_register.forEach(function (dv, i, arr) {
        arr[i].title = SENSORS_INFO[dv.id].title,
          arr[i].name = SENSORS_INFO[dv.id].name;
        arr[i].values = [];
        arr[i].command = null;
      });
    }

    update_delta_registers(vm.deltaValues);
    update_delta_registers(vm.deltaDO);
    update_delta_registers(vm.deltaInputs);

    for (let aOut in vm.deltaAO) {
      vm.deltaAO[aOut].v0 = localStorage.getObject(aOut).v0;
      vm.deltaAO[aOut].koeff = localStorage.getObject(aOut).koeff;
    }
  }

});

