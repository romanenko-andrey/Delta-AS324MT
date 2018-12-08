// Определяем новый компонент под именем sensor-item
Vue.component('sensor-item', {
  // Компонент sensor-item принимает "props", то есть входные параметры.
  // Имя входного параметра val.
  props: ['sensor'],
  template: '<li>{{ sensor.id }} : {{ sensor.value }} : {{ sensor.name }}</li>'
});


Vue.component('sensor-id', {
  props: ['sensorID'],
  template: '<b-col>{{ sensorID }}</b-col>'
});

Vue.component('sensor-value', {
  props: ['sensorValue'],
  template: '<b-col>{{ sensorValue }}</b-col>'
});

Vue.component('sensor-line2', {
  props: ['sensor'],
  template: '<sensor-id v-bind:sensorID=\'sensor.id\'></sensor-id> <sensor-value v-bind:sensorValue=\'sensor.value\'></sensor-value>'
  
});

Vue.component('sensor-line', {
  props: ['sensor'],
  template: `<b-row v-bind:title=sensor.title>
               <b-col cols="2" class="sensor-line sensor-id">{{ sensor.id }}</b-col> 
               <b-col cols="2" class="sensor-line sensor-value">{{ sensor.value }}</b-col> 
               <b-col class="sensor-line sensor-name">{{ sensor.name }}</b-col> 
            </b-row>`
});


var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello from Delta!',
    v_bind_message: 'Вы загрузили эту страницу: ' + new Date().toLocaleString(),
    deltaRegisters: {},
    digitalInputs: [0,0,0],
    digitalOutputs: [0,0,0,0,0],
    deltaValues: [ 
      { id: 'AI00', value: 0}, 
      { id: 'AI01', value: 0}, 
      { id: 'AI02', value: 0}, 
      { id: 'AI03', value: 0}, 
      { id: 'AO01', value: 0}, 
      { id: 'AO02', value: 0}
    ],
    status: {delta: 'initialization', udp1_status:'', udp2_status:'', udp3_status:''},
  },
  watch: {
    deltaRegisters: function(newReg, _){
      var vm = this;
      vm.status.delta = 'Delta is Ok!';
      vm.status.udp1_status = newReg.udp1_status;
      vm.status.udp2_status = newReg.udp2_status;
      vm.status.udp3_status = newReg.udp3_status;
      for (let v of vm.deltaValues){
        v.value = newReg[v.id];
      } 
     
      var int_to_bin = (d) => { return (d + 256).toString(2).substr(1,8); };
      var d_in = [newReg.DIX0, newReg.DIX1, newReg.DIX2];
      var d_out = [newReg.DOY0, newReg.DOY1, newReg.DOY2, newReg.DOY3, newReg.DOY4];
      vm.digitalInputs = d_in.map( int_to_bin ).join('').split('');
      vm.digitalOutputs = d_out.map( int_to_bin ).join('').split('');
    }
  },

  computed: {
    message2: function() {
      return this.message + ' ' + this.status.delta;
    },

  },


  methods: {
   
    getDeltaStatus: function(){
      var vm = this;
      axios.get('/info')
        .then(function (response) {
          vm.deltaRegisters = JSON.parse(JSON.stringify(response.data));
        })
        .catch(function (error) {
          vm.status.delta = 'Error! Can not connect to the server. ' + error;
        });
    }
  },

  created() {
    this.deltaValues.forEach(function(dv, i, arr) {
      arr[i].title = sensors_info[dv.id].title,
      arr[i].name  = sensors_info[dv.id].name; 
    });
 
  }

});


